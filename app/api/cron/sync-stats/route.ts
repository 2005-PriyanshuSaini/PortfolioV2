import { NextResponse } from "next/server";
import { sql } from "../../../../lib/db";

type GitHubUserResponse = {
  html_url: string;
  public_repos: number;
};

type GitHubRepoResponse = {
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  archived: boolean;
};

const LEETCODE_QUERY = `query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
    profile { ranking }
  }
  allQuestionsCount { difficulty count }
}`;

function bearerFromHeader(authHeader: string | null) {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

function safeJson<T>(x: unknown): T {
  return x as T;
}

export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const token = bearerFromHeader(req.headers.get("authorization"));
    if (!secret || token !== secret) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const username = process.env.GITHUB_USERNAME;
    if (!username) {
      return NextResponse.json(
        { success: false, error: "Missing GITHUB_USERNAME" },
        { status: 500 }
      );
    }

    const ghToken = process.env.GITHUB_TOKEN;
    const ghHeaders: HeadersInit = {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-cron"
    };
    if (ghToken) ghHeaders.Authorization = `Bearer ${ghToken}`;

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: ghHeaders, cache: "no-store" }),
      fetch(`https://api.github.com/users/${username}/repos?per_page=100`, {
        headers: ghHeaders,
        cache: "no-store"
      })
    ]);

    if (!userRes.ok) throw new Error(`GitHub user fetch failed: ${userRes.status}`);
    if (!reposRes.ok) throw new Error(`GitHub repos fetch failed: ${reposRes.status}`);

    const ghUser = safeJson<GitHubUserResponse>(await userRes.json());
    const ghRepos = safeJson<GitHubRepoResponse[]>(await reposRes.json());

    const stars = ghRepos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
    const langCount = new Map<string, number>();
    for (const r of ghRepos) {
      if (r.fork || r.archived) continue;
      if (!r.language) continue;
      langCount.set(r.language, (langCount.get(r.language) ?? 0) + 1);
    }
    const topLanguages = [...langCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([lang]) => lang);

    const githubData = {
      username,
      profile_url: ghUser.html_url,
      repos: ghUser.public_repos,
      stars,
      top_languages: topLanguages
    };

    const lcUser = process.env.LEETCODE_USERNAME ?? username;
    const lcRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: LEETCODE_QUERY, variables: { username: lcUser } }),
      cache: "no-store"
    });
    if (!lcRes.ok) throw new Error(`LeetCode fetch failed: ${lcRes.status}`);
    const lcJson = safeJson<any>(await lcRes.json());

    const ac = lcJson?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum ?? [];
    const ranking = lcJson?.data?.matchedUser?.profile?.ranking ?? null;

    const all = ac.find((x: any) => x.difficulty === "All")?.count ?? 0;
    const easy = ac.find((x: any) => x.difficulty === "Easy")?.count ?? 0;
    const medium = ac.find((x: any) => x.difficulty === "Medium")?.count ?? 0;
    const hard = ac.find((x: any) => x.difficulty === "Hard")?.count ?? 0;

    const denom = all > 0 ? all : Math.max(1, easy + medium + hard);
    const leetcodeData = {
      username: lcUser,
      profile_url: `https://leetcode.com/${lcUser}/`,
      total_solved: all,
      ranking: typeof ranking === "number" ? ranking : null,
      easy,
      medium,
      hard,
      easy_pct: Math.round((easy / denom) * 100),
      medium_pct: Math.round((medium / denom) * 100),
      hard_pct: Math.round((hard / denom) * 100)
    };
    const syncedAt = new Date().toISOString();

    await sql`
      INSERT INTO public.stats (platform, data, synced_at)
      VALUES
        ('github', ${JSON.stringify(githubData)}::jsonb, ${syncedAt}),
        ('leetcode', ${JSON.stringify(leetcodeData)}::jsonb, ${syncedAt})
    `;

    return NextResponse.json({ success: true, synced_at: syncedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

