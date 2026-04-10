"use client";

import * as React from "react";

type Tab = "projects" | "blogs";

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

type BlogRow = {
  id: string;
  title: string;
  content: string | null;
  published: boolean | null;
  created_at: string | null;
};

const TOKEN_KEY = "admin_token_v1";

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="card p-6">{children}</div>;
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-fg-muted">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-border bg-white/0 px-4 py-3 text-sm text-fg outline-none",
        "placeholder:text-fg-muted/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/20",
        props.className ?? ""
      ].join(" ")}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={[
        "w-full rounded-xl border border-border bg-white/0 px-4 py-3 text-sm text-fg outline-none",
        "placeholder:text-fg-muted/60 focus:border-accent/60 focus:ring-2 focus:ring-accent/20",
        props.className ?? ""
      ].join(" ")}
    />
  );
}

function SmallButton({
  variant,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant: "primary" | "secondary" | "danger";
}) {
  const cls =
    variant === "primary"
      ? "btn btn-primary px-4 py-2 text-xs"
      : variant === "danger"
        ? "btn px-4 py-2 text-xs border border-red-500/30 bg-red-500/10 text-fg hover:bg-red-500/15"
        : "btn btn-secondary px-4 py-2 text-xs";
  return (
    <button {...props} className={[cls, props.className ?? ""].join(" ")}>
      {children}
    </button>
  );
}

async function api<T>(path: string, opts: RequestInit & { token?: string } = {}) {
  const headers = new Headers(opts.headers ?? {});
  if (opts.token) headers.set("Authorization", `Bearer ${opts.token}`);
  if (!headers.has("Content-Type") && opts.body) headers.set("Content-Type", "application/json");

  const res = await fetch(path, { ...opts, headers, cache: "no-store" });
  const json = (await res.json().catch(() => null)) as T | null;
  if (!res.ok) throw new Error((json as any)?.error ?? `Request failed: ${res.status}`);
  return json as T;
}

export default function AdminPage() {
  const [token, setToken] = React.useState<string>("");
  const [tab, setTab] = React.useState<Tab>("projects");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string>("");

  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const [projects, setProjects] = React.useState<ProjectRow[]>([]);
  const [blogs, setBlogs] = React.useState<BlogRow[]>([]);

  const [editingProject, setEditingProject] = React.useState<Partial<ProjectRow> | null>(null);
  const [editingBlog, setEditingBlog] = React.useState<Partial<BlogRow> | null>(null);

  React.useEffect(() => {
    const t = window.localStorage.getItem(TOKEN_KEY) ?? "";
    if (t) setToken(t);
  }, []);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setProjects([]);
    setBlogs([]);
    setEditingProject(null);
    setEditingBlog(null);
  }, []);

  const loadAll = React.useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [p, b] = await Promise.all([
        api<{ success: true; projects: ProjectRow[] }>("/api/admin/projects", { token }),
        api<{ success: true; blogs: BlogRow[] }>("/api/admin/blogs", { token })
      ]);
      setProjects(p.projects ?? []);
      setBlogs(b.blogs ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [token]);

  React.useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const login = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ success: boolean; token?: string; error?: string }>("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      if (!res.token) throw new Error("No token returned");
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const syncStats = async () => {
    setLoading(true);
    setError("");
    try {
      await api("/api/admin/sync-stats", { method: "POST", token });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const saveProject = async () => {
    if (!editingProject?.title) return;
    setLoading(true);
    setError("");
    try {
      const tech =
        typeof (editingProject as any).tech_stack === "string"
          ? ((editingProject as any).tech_stack as string)
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : (editingProject.tech_stack ?? null);

      const payload = {
        id: editingProject.id,
        title: editingProject.title,
        description: editingProject.description ?? null,
        tech_stack: tech,
        live_url: editingProject.live_url ?? null,
        github_url: editingProject.github_url ?? null,
        featured: Boolean(editingProject.featured)
      };

      const res = await api<{ success: true; projects: ProjectRow[] }>("/api/admin/projects", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
      });
      setProjects(res.projects ?? []);
      setEditingProject(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    setLoading(true);
    setError("");
    try {
      await api(`/api/admin/projects/${id}`, { method: "DELETE", token });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  const saveBlog = async () => {
    if (!editingBlog?.title) return;
    setLoading(true);
    setError("");
    try {
      const payload = {
        id: editingBlog.id,
        title: editingBlog.title,
        content: editingBlog.content ?? null,
        published: Boolean(editingBlog.published)
      };
      const res = await api<{ success: true; blogs: BlogRow[] }>("/api/admin/blogs", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
      });
      setBlogs(res.blogs ?? []);
      setEditingBlog(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this blog?")) return;
    setLoading(true);
    setError("");
    try {
      await api(`/api/admin/blogs/${id}`, { method: "DELETE", token });
      await loadAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="min-h-dvh bg-bg text-fg">
        <div className="container-page section">
          <div className="mx-auto max-w-md">
            <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
            <p className="mt-2 text-fg-muted">Login to manage projects and blogs.</p>

            <div className="mt-8 space-y-4">
              <CardShell>
                <div className="space-y-4">
                  <Field label="Username">
                    <Input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      autoComplete="username"
                    />
                  </Field>
                  <Field label="Password">
                    <Input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                    />
                  </Field>
                  <div className="flex items-center gap-3">
                    <button
                      className="btn btn-primary w-full"
                      onClick={() => void login()}
                      disabled={loading}
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>
                  </div>
                  {error ? <p className="text-sm text-red-400">{error}</p> : null}
                </div>
              </CardShell>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-white/5 text-sm font-bold">
              PS
            </span>
            <div>
              <div className="text-sm font-semibold">Admin Panel</div>
              <div className="text-xs text-fg-muted">Manage content in Supabase</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <SmallButton variant="secondary" onClick={() => void syncStats()} disabled={loading}>
              Sync stats
            </SmallButton>
            <SmallButton variant="secondary" onClick={logout}>
              Logout
            </SmallButton>
          </div>
        </div>
      </div>

      <div className="container-page section">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content</h1>
            <p className="mt-2 text-fg-muted">Create, edit, and publish without touching code.</p>
          </div>
          <div className="flex gap-2">
            <SmallButton
              variant={tab === "projects" ? "primary" : "secondary"}
              onClick={() => setTab("projects")}
            >
              Projects
            </SmallButton>
            <SmallButton
              variant={tab === "blogs" ? "primary" : "secondary"}
              onClick={() => setTab("blogs")}
            >
              Blogs
            </SmallButton>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm text-red-400">{error}</p> : null}

        {tab === "projects" ? (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <CardShell>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Projects</h2>
                <SmallButton
                  variant="primary"
                  onClick={() =>
                    setEditingProject({
                      title: "",
                      description: "",
                      tech_stack: [],
                      live_url: "",
                      github_url: "",
                      featured: false
                    })
                  }
                >
                  + New
                </SmallButton>
              </div>

              <div className="mt-6 space-y-3">
                {projects.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-border bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{p.title}</div>
                        <div className="mt-1 text-xs text-fg-muted">
                          {p.featured ? "Featured" : "Normal"} •{" "}
                          {(p.tech_stack ?? []).slice(0, 4).join(", ") || "—"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SmallButton variant="secondary" onClick={() => setEditingProject(p)}>
                          Edit
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => void deleteProject(p.id)}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>
                  </div>
                ))}
                {!projects.length ? (
                  <p className="text-sm text-fg-muted">No projects yet.</p>
                ) : null}
              </div>
            </CardShell>

            <CardShell>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Editor</h2>
                <SmallButton variant="secondary" onClick={() => setEditingProject(null)}>
                  Close
                </SmallButton>
              </div>

              {editingProject ? (
                <div className="mt-6 space-y-4">
                  <Field label="Title">
                    <Input
                      value={editingProject.title ?? ""}
                      onChange={(e) =>
                        setEditingProject((s) => ({ ...(s ?? {}), title: e.target.value }))
                      }
                      placeholder="Project name"
                    />
                  </Field>
                  <Field label="Description">
                    <Textarea
                      value={editingProject.description ?? ""}
                      onChange={(e) =>
                        setEditingProject((s) => ({ ...(s ?? {}), description: e.target.value }))
                      }
                      placeholder="What is it?"
                      rows={4}
                    />
                  </Field>
                  <Field label="Tech stack (comma separated)">
                    <Input
                      value={
                        Array.isArray(editingProject.tech_stack)
                          ? editingProject.tech_stack.join(", ")
                          : ((editingProject as any).tech_stack ?? "")
                      }
                      onChange={(e) =>
                        setEditingProject((s) => ({ ...(s ?? {}), tech_stack: e.target.value as any }))
                      }
                      placeholder="Next.js, Supabase, Tailwind"
                    />
                  </Field>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="Live URL">
                      <Input
                        value={editingProject.live_url ?? ""}
                        onChange={(e) =>
                          setEditingProject((s) => ({ ...(s ?? {}), live_url: e.target.value }))
                        }
                        placeholder="https://..."
                      />
                    </Field>
                    <Field label="GitHub URL">
                      <Input
                        value={editingProject.github_url ?? ""}
                        onChange={(e) =>
                          setEditingProject((s) => ({ ...(s ?? {}), github_url: e.target.value }))
                        }
                        placeholder="https://github.com/..."
                      />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(editingProject.featured)}
                      onChange={(e) =>
                        setEditingProject((s) => ({ ...(s ?? {}), featured: e.target.checked }))
                      }
                    />
                    <span>Featured</span>
                  </label>

                  <div className="flex gap-2">
                    <SmallButton variant="primary" onClick={() => void saveProject()} disabled={loading}>
                      Save
                    </SmallButton>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-fg-muted">Select a project to edit, or create a new one.</p>
              )}
            </CardShell>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <CardShell>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Blogs</h2>
                <SmallButton
                  variant="primary"
                  onClick={() =>
                    setEditingBlog({
                      title: "",
                      content: "",
                      published: false
                    })
                  }
                >
                  + New
                </SmallButton>
              </div>

              <div className="mt-6 space-y-3">
                {blogs.map((b) => (
                  <div key={b.id} className="rounded-xl border border-border bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">{b.title}</div>
                        <div className="mt-1 text-xs text-fg-muted">
                          {b.published ? "Published" : "Draft"}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <SmallButton variant="secondary" onClick={() => setEditingBlog(b)}>
                          Edit
                        </SmallButton>
                        <SmallButton variant="danger" onClick={() => void deleteBlog(b.id)}>
                          Delete
                        </SmallButton>
                      </div>
                    </div>
                  </div>
                ))}
                {!blogs.length ? <p className="text-sm text-fg-muted">No blogs yet.</p> : null}
              </div>
            </CardShell>

            <CardShell>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Editor</h2>
                <SmallButton variant="secondary" onClick={() => setEditingBlog(null)}>
                  Close
                </SmallButton>
              </div>

              {editingBlog ? (
                <div className="mt-6 space-y-4">
                  <Field label="Title">
                    <Input
                      value={editingBlog.title ?? ""}
                      onChange={(e) =>
                        setEditingBlog((s) => ({ ...(s ?? {}), title: e.target.value }))
                      }
                      placeholder="Post title"
                    />
                  </Field>
                  <Field label="Content">
                    <Textarea
                      value={editingBlog.content ?? ""}
                      onChange={(e) =>
                        setEditingBlog((s) => ({ ...(s ?? {}), content: e.target.value }))
                      }
                      placeholder="Write your post..."
                      rows={10}
                    />
                  </Field>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={Boolean(editingBlog.published)}
                      onChange={(e) =>
                        setEditingBlog((s) => ({ ...(s ?? {}), published: e.target.checked }))
                      }
                    />
                    <span>Published</span>
                  </label>

                  <div className="flex gap-2">
                    <SmallButton variant="primary" onClick={() => void saveBlog()} disabled={loading}>
                      Save
                    </SmallButton>
                  </div>
                </div>
              ) : (
                <p className="mt-6 text-sm text-fg-muted">Select a blog to edit, or create a new one.</p>
              )}
            </CardShell>
          </div>
        )}

        {loading ? <p className="mt-6 text-sm text-fg-muted">Working...</p> : null}
      </div>
    </main>
  );
}

