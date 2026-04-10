import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

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
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .select("id,title,description,tech_stack,live_url,github_url,featured,created_at")
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, projects: data ?? [] });
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

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .upsert(rows, { onConflict: "id" })
      .select("id,title,description,tech_stack,live_url,github_url,featured,created_at");

    if (error) throw error;
    return NextResponse.json({ success: true, projects: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

