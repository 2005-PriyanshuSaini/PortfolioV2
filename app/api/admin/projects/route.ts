import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";
import { sql } from "../../../../lib/db";

type ProjectUpsert = {
  id?: string;
  title: string;
  description?: string | null;
  tech_stack?: string[] | null;
  live_url?: string | null;
  github_url?: string | null;
  featured?: boolean | null;
};

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const rows = await sql`
      SELECT id, title, description, tech_stack, live_url, github_url, featured, created_at
      FROM public.projects
      ORDER BY featured DESC, created_at DESC
    `;

    return NextResponse.json({ success: true, projects: (rows ?? []) as any[] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const payload = (await req.json()) as ProjectUpsert | ProjectUpsert[];
    const items = Array.isArray(payload) ? payload : [payload];

    const rows = items.map((p) => ({
      ...(p.id ? { id: p.id } : {}),
      title: p.title,
      description: p.description ?? null,
      tech_stack: p.tech_stack ?? null,
      live_url: p.live_url ?? null,
      github_url: p.github_url ?? null,
      featured: p.featured ?? false
    }));

    const out = await Promise.all(
      rows.map(async (p) => {
        if (p.id) {
          const r = await sql`
            INSERT INTO public.projects (id, title, description, tech_stack, live_url, github_url, featured)
            VALUES (${p.id}, ${p.title}, ${p.description}, ${p.tech_stack}, ${p.live_url}, ${p.github_url}, ${p.featured})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              tech_stack = EXCLUDED.tech_stack,
              live_url = EXCLUDED.live_url,
              github_url = EXCLUDED.github_url,
              featured = EXCLUDED.featured
            RETURNING id, title, description, tech_stack, live_url, github_url, featured, created_at
          `;
          return (r?.[0] ?? null) as any;
        }

        const r = await sql`
          INSERT INTO public.projects (title, description, tech_stack, live_url, github_url, featured)
          VALUES (${p.title}, ${p.description}, ${p.tech_stack}, ${p.live_url}, ${p.github_url}, ${p.featured})
          RETURNING id, title, description, tech_stack, live_url, github_url, featured, created_at
        `;
        return (r?.[0] ?? null) as any;
      })
    );

    return NextResponse.json({ success: true, projects: out.filter(Boolean) });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

