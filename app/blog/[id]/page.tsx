import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { getSupabaseServerClient } from "../../../lib/supabase";
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
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "2-digit" });
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  noStore();
  const supabase = getSupabaseServerClient();

  let post: BlogRow | null = null;
  try {
    const { data, error } = await supabase
      .from("blogs")
      .select("id,title,content,published,created_at")
      .eq("id", params.id)
      .eq("published", true)
      .maybeSingle();

    if (error) throw error;
    post = data ?? null;
  } catch {
    post = null;
  }

  return (
    <main className="min-h-dvh text-fg">
      <Navbar />

      <section className="section-frosted section" style={{ scrollMarginTop: 88 }}>
        <div className="container-page">
          {post ? (
            <article className="card p-8">
              <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
              <p className="mt-2 text-sm text-fg-muted">{formatDate(post.created_at)}</p>
              {post.content ? (
                <div className="prose prose-invert mt-8 max-w-none">
                  <p className="whitespace-pre-wrap leading-7 text-fg">{post.content}</p>
                </div>
              ) : (
                <p className="mt-8 text-fg-muted">No content.</p>
              )}
            </article>
          ) : (
            <div className="card p-8">
              <h1 className="text-2xl font-bold tracking-tight">Post not found</h1>
              <p className="mt-2 text-fg-muted">This post doesn&apos;t exist or isn&apos;t published.</p>
              <a className="mt-6 inline-flex font-semibold text-accent" href="/blog">
                Back to Dev Log →
              </a>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

