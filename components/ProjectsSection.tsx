import * as React from "react";
import { unstable_noStore as noStore } from "next/cache";
import { getSupabaseServerClient } from "../lib/supabase";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[] | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean | null;
  created_at: string | null;
};

export default async function ProjectsSection() {
  noStore();
  const supabase = getSupabaseServerClient();

  let projects: ProjectRow[] = [];
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,description,tech_stack,live_url,github_url,featured,created_at")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    projects = data ?? [];
  } catch {
    projects = [];
  }

  return (
    <section id="projects" className="section-frosted section" style={{ scrollMarginTop: 88 }}>
      <div className="container-page">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="section-title">Things I&apos;ve Built</h2>
            <p className="section-subtitle">
              Production-ready work — APIs, interfaces, and systems built to ship and scale.
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="mt-10 text-sm text-fg-muted">
            No projects yet. Add some in <a className="text-accent hover:underline" href="/admin">/admin</a>.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.map((p) => {
              const tags = p.tech_stack ?? [];
              return (
                <article
                  key={p.id}
                  className="card flex min-h-[260px] flex-col p-6 transition-transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                    {p.featured ? (
                      <span className="shrink-0 tag border-accent/30 bg-accent/10 text-xs">Featured</span>
                    ) : null}
                  </div>
                  {p.description ? (
                    <p className="mt-2 text-sm leading-6 text-fg-muted">{p.description}</p>
                  ) : null}

                  {tags.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span key={t} className="tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-auto pt-6">
                    <div className="grid grid-cols-2 gap-3">
                      {p.live_url ? (
                        <a
                          className="btn btn-primary w-full"
                          href={p.live_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live
                        </a>
                      ) : (
                        <span className="btn btn-primary w-full cursor-not-allowed opacity-50">Live</span>
                      )}
                      {p.github_url ? (
                        <a
                          className="btn btn-secondary w-full"
                          href={p.github_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
                        </a>
                      ) : (
                        <span className="btn btn-secondary w-full cursor-not-allowed opacity-50">
                          GitHub
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
