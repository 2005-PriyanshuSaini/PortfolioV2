import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getSupabaseServerClient } from "../../lib/supabase";
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

