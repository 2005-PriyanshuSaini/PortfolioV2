import * as React from "react";
import { unstable_noStore as noStore } from "next/cache";
import { sql } from "../lib/db";

type BlogRow = {
  id: string;
  title: string;
  content: string | null;
  published: boolean | null;
  created_at: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

export default async function BlogSection() {
  noStore();

  let posts: BlogRow[] = [];
  try {
    const rows = await sql`
      SELECT id, title, content, published, created_at
      FROM public.blogs
      WHERE published = true
      ORDER BY created_at DESC
    `;
    posts = (rows ?? []) as BlogRow[];
  } catch (err) {
    console.error("[BlogSection] DB query failed", err);
    posts = [];
  }

  return (
    <section id="blog" className="section-frosted section" style={{ scrollMarginTop: 88 }}>
      <div className="container-page">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="section-title">Dev Log</h2>
            <p className="section-subtitle">
              Deep dives on engineering, AI in practice, and lessons from real releases.
            </p>
          </div>
          <a className="text-sm font-semibold text-accent hover:text-accent/90" href="/blog">
            View all →
          </a>
        </div>

        {posts.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">
            No published posts yet. Publish in <a className="text-accent hover:underline" href="/admin">/admin</a>.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4">
            {posts.map((p) => {
              const excerpt =
                (p.content ?? "")
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 180) || "";
              return (
                <article
                  key={p.id}
                  className="card p-6 transition-transform hover:-translate-y-0.5 hover:bg-white/5"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                    <span className="text-sm text-fg-muted">{formatDate(p.created_at)}</span>
                  </div>
                  {excerpt ? <p className="mt-3 text-sm text-fg-muted">{excerpt}…</p> : null}
                  <a
                    className="mt-4 inline-flex text-sm font-semibold text-accent hover:text-accent/90"
                    href={`/blog/${p.id}`}
                  >
                    Read more →
                  </a>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
