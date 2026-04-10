import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";
import { sql } from "../../../../lib/db";

type BlogUpsert = {
  id?: string;
  title: string;
  content?: string | null;
  published?: boolean | null;
};

export async function GET(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const rows = await sql`
      SELECT id, title, content, published, created_at
      FROM public.blogs
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ success: true, blogs: (rows ?? []) as any[] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const payload = (await req.json()) as BlogUpsert | BlogUpsert[];
    const items = Array.isArray(payload) ? payload : [payload];

    const rows = items.map((b) => ({
      ...(b.id ? { id: b.id } : {}),
      title: b.title,
      content: b.content ?? null,
      published: b.published ?? false
    }));

    const results = await sql.transaction((tx) =>
      rows.map((b) => {
        if (b.id) {
          return tx`
            INSERT INTO public.blogs (id, title, content, published)
            VALUES (${b.id}, ${b.title}, ${b.content}, ${b.published})
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              content = EXCLUDED.content,
              published = EXCLUDED.published
            RETURNING id, title, content, published, created_at
          `;
        }

        return tx`
          INSERT INTO public.blogs (title, content, published)
          VALUES (${b.title}, ${b.content}, ${b.published})
          RETURNING id, title, content, published, created_at
        `;
      })
    );

    const blogs = results.flatMap((r) => (Array.isArray(r) ? r : [])).filter(Boolean);
    return NextResponse.json({ success: true, blogs });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

