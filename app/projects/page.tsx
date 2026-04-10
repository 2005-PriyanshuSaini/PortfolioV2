import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { sql } from "../../lib/db";
import { unstable_noStore as noStore } from "next/cache";

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

export default async function ProjectsPage() {
  noStore();

  let projects: ProjectRow[] = [];
  try {
    const rows = await sql`
      SELECT id, title, description, tech_stack, live_url, github_url, featured, created_at
      FROM public.projects
      ORDER BY featured DESC, created_at DESC
    `;
    projects = (rows ?? []) as ProjectRow[];
    if (projects.length === 0) {
      const c = await sql`SELECT count(*)::int as c FROM public.projects`;
      const ident =
        await sql`SELECT current_user as "user", current_database() as db, inet_server_addr()::text as addr`;
      console.log(
        "[ProjectsPage] projects rows=0, count(*)=",
        c?.[0]?.c,
        "db=",
        ident?.[0]?.db,
        "user=",
        ident?.[0]?.user,
        "addr=",
        ident?.[0]?.addr
      );
    }
  } catch (err) {
    console.error("[ProjectsPage] DB query failed", err);
    projects = [];
  }

  return (
    <main className="min-h-dvh text-fg">
      <Navbar />

      <section className="section-frosted section" style={{ scrollMarginTop: 88 }}>
        <div className="container-page">
          <h1 className="text-4xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-fg-muted">
            Things I&apos;ve built — pulled live from Supabase.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
            {projects.map((p) => (
              <article
                key={p.id}
                className="card p-6 transition-all hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
                  {p.featured ? (
                    <span className="tag border-accent/30 bg-accent/10 text-fg">
                      Featured
                    </span>
                  ) : null}
                </div>
                {p.description ? (
                  <p className="mt-2 text-sm text-fg-muted">{p.description}</p>
                ) : null}

                {p.tech_stack?.length ? (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {p.tech_stack.map((t) => (
                      <span key={t} className="tag">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-6 flex gap-3">
                  {p.live_url ? (
                    <a
                      className="btn btn-primary flex-1"
                      href={p.live_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live
                    </a>
                  ) : (
                    <span className="btn btn-primary flex-1 cursor-not-allowed opacity-50">
                      Live
                    </span>
                  )}
                  {p.github_url ? (
                    <a
                      className="btn btn-secondary flex-1"
                      href={p.github_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  ) : (
                    <span className="btn btn-secondary flex-1 cursor-not-allowed opacity-50">
                      GitHub
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

