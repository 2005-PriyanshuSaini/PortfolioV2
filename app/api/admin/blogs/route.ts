import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

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
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("blogs")
      .select("id,title,content,published,created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, blogs: data ?? [] });
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

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("blogs")
      .upsert(rows, { onConflict: "id" })
      .select("id,title,content,published,created_at");

    if (error) throw error;
    return NextResponse.json({ success: true, blogs: data ?? [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

