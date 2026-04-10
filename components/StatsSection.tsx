import * as React from "react";
import { unstable_noStore as noStore } from "next/cache";
import { sql } from "../lib/db";
import { getGitHubProfileUrl, getLeetCodeProfileUrl } from "../lib/links";
import { syncStatsNow } from "../lib/syncStats";

function Bar({
  label,
  value,
  color
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-xs font-semibold text-fg-muted">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-fg">{value}%</span>
    </div>
  );
}

type StatsRow = {
  id: string;
  platform: "github" | "leetcode" | string;
  data: Record<string, unknown>;
  synced_at: string | null;
};

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <div className="h-5 w-28 animate-pulse rounded bg-white/10" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-8 w-20 animate-pulse rounded-xl bg-white/10" />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-[88px] animate-pulse rounded-xl border border-border bg-white/5" />
        <div className="h-[88px] animate-pulse rounded-xl border border-border bg-white/5" />
      </div>

      <div className="mt-6">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full border border-border bg-white/5" />
          <div className="h-7 w-20 animate-pulse rounded-full border border-border bg-white/5" />
          <div className="h-7 w-16 animate-pulse rounded-full border border-border bg-white/5" />
        </div>
      </div>

      <span className="sr-only">{title} loading</span>
    </div>
  );
}

function SkeletonWithLink({
  title,
  subtitle,
  href,
  buttonLabel
}: {
  title: string;
  subtitle: string;
  href: string;
  buttonLabel: string;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm text-fg-muted">{subtitle}</p>
        </div>
        <a className="btn btn-secondary px-4 py-2 text-xs" href={href} target="_blank" rel="noreferrer">
          {buttonLabel}
        </a>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="h-[88px] animate-pulse rounded-xl border border-border bg-white/5" />
        <div className="h-[88px] animate-pulse rounded-xl border border-border bg-white/5" />
      </div>

      <div className="mt-6">
        <div className="h-4 w-28 animate-pulse rounded bg-white/10" />
        <div className="mt-3 flex flex-wrap gap-2">
          <div className="h-7 w-24 animate-pulse rounded-full border border-border bg-white/5" />
          <div className="h-7 w-20 animate-pulse rounded-full border border-border bg-white/5" />
          <div className="h-7 w-16 animate-pulse rounded-full border border-border bg-white/5" />
        </div>
      </div>
    </div>
  );
}

export default async function StatsSection() {
  noStore();
  const fallbackGitHubUrl = getGitHubProfileUrl();
  const fallbackLeetCodeUrl = getLeetCodeProfileUrl();

  let rows: StatsRow[] = [];
  try {
    // Refresh stats on every visit/render (best-effort).
    await syncStatsNow().catch(() => null);

    const data = await sql`
      SELECT id, platform, data, synced_at
      FROM public.stats
      ORDER BY synced_at DESC
    `;
    rows = (data ?? []) as StatsRow[];
    if (rows.length === 0 && process.env.NODE_ENV === "development") {
      const c = await sql`SELECT count(*)::int as c FROM public.stats`;
      console.log(
        "[StatsSection] stats rows=0, count(*)=",
        c?.[0]?.c
      );
    }
  } catch (err) {
    console.error("[StatsSection] DB query failed", err);
    rows = [];
  }

  const latestByPlatform = new Map<string, StatsRow>();
  for (const r of rows) {
    if (!latestByPlatform.has(r.platform)) latestByPlatform.set(r.platform, r);
  }

  const github = latestByPlatform.get("github")?.data ?? null;
  const leetcode = latestByPlatform.get("leetcode")?.data ?? null;

  const isEmpty = rows.length === 0;

  return (
    <section id="stats" className="section-frosted section" style={{ scrollMarginTop: 88 }}>
      <div className="container-page">
        <h2 className="section-title">By the numbers</h2>
        <p className="section-subtitle">A quick snapshot across code and problem solving.</p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {isEmpty ? (
            <>
              <SkeletonWithLink
                title="GitHub"
                subtitle="Repos, stars, and top languages"
                href={fallbackGitHubUrl}
                buttonLabel="Profile"
              />
              <SkeletonWithLink
                title="LeetCode"
                subtitle="Solved and difficulty split"
                href={fallbackLeetCodeUrl}
                buttonLabel="LeetCode"
              />
            </>
          ) : (
            <>
              <div className="card p-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">GitHub</h3>
                    <p className="mt-1 text-sm text-fg-muted">Repos, stars, and top languages</p>
                  </div>
                  <a
                    className="btn btn-secondary px-4 py-2 text-xs"
                    href={
                      typeof github?.profile_url === "string"
                        ? (github.profile_url as string)
                        : fallbackGitHubUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Profile
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-white/5 p-4">
                    <div className="text-2xl font-bold">
                      {typeof github?.repos === "number" ? (github.repos as number) : "—"}
                    </div>
                    <div className="mt-1 text-sm text-fg-muted">Repositories</div>
                  </div>
                  <div className="rounded-xl border border-border bg-white/5 p-4">
                    <div className="text-2xl font-bold">
                      {typeof github?.stars === "number" ? (github.stars as number) : "—"}
                    </div>
                    <div className="mt-1 text-sm text-fg-muted">Stars</div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm font-semibold">Top languages</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Array.isArray(github?.top_languages) &&
                    (github.top_languages as unknown[]).length ? (
                      (github.top_languages as string[]).slice(0, 6).map((l) => (
                        <span key={l} className="tag">
                          {l}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-fg-muted">—</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">LeetCode</h3>
                    <p className="mt-1 text-sm text-fg-muted">Solved and difficulty split</p>
                  </div>
                  <a
                    className="btn btn-secondary px-4 py-2 text-xs"
                    href={
                      typeof leetcode?.profile_url === "string"
                        ? (leetcode.profile_url as string)
                        : fallbackLeetCodeUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    LeetCode
                  </a>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-border bg-white/5 p-4">
                    <div className="text-2xl font-bold">
                      {typeof leetcode?.total_solved === "number"
                        ? (leetcode.total_solved as number)
                        : "—"}
                    </div>
                    <div className="mt-1 text-sm text-fg-muted">Total solved</div>
                  </div>
                  <div className="rounded-xl border border-border bg-white/5 p-4">
                    <div className="text-2xl font-bold">
                      {typeof leetcode?.ranking === "number"
                        ? (leetcode.ranking as number)
                        : "—"}
                    </div>
                    <div className="mt-1 text-sm text-fg-muted">Ranking</div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Bar
                    label="Easy"
                    value={typeof leetcode?.easy_pct === "number" ? (leetcode.easy_pct as number) : 0}
                    color="#22c55e"
                  />
                  <Bar
                    label="Medium"
                    value={
                      typeof leetcode?.medium_pct === "number" ? (leetcode.medium_pct as number) : 0
                    }
                    color="#f59e0b"
                  />
                  <Bar
                    label="Hard"
                    value={typeof leetcode?.hard_pct === "number" ? (leetcode.hard_pct as number) : 0}
                    color="#ef4444"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

