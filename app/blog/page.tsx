import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { getSupabaseServerClient } from "../../lib/supabase";
import { unstable_noStore as noStore } from "next/cache";

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

export default async function BlogPage() {
  noStore();
  const supabase = getSupabaseServerClient();

  let posts: BlogRow[] = [];
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("id,title,content,published,created_at")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;
    posts = data ?? [];
  } catch {
    posts = [];
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <Navbar />

      <section className="bg-bg section" style={{ scrollMarginTop: 88 }}>
        <div className="container-page">
          <h1 className="text-4xl font-bold tracking-tight">Dev Log</h1>
          <p className="mt-2 text-fg-muted">Published posts from Supabase.</p>

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
                  className="card p-6 transition-all hover:-translate-y-0.5 hover:bg-white/5"
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
        </div>
      </section>

      <Footer />
    </main>
  );
}

