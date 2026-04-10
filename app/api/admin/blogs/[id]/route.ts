import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../../lib/adminAuth";
import { sql } from "../../../../../lib/db";

export async function DELETE(req: Request, ctx: { params: { id: string } }) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    await sql`DELETE FROM public.blogs WHERE id = ${ctx.params.id}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

