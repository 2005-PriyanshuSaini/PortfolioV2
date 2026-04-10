import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/adminAuth";
import { getSupabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("blogs").delete().eq("id", ctx.params.id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

