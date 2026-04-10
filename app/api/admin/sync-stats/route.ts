import { NextResponse } from "next/server";
import { requireAdmin } from "../../../../lib/adminAuth";

export async function POST(req: Request) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return NextResponse.json({ success: false }, { status: 401 });

  try {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json({ success: false, error: "Missing CRON_SECRET" }, { status: 500 });
    }

    const origin = new URL(req.url).origin;
    const res = await fetch(`${origin}/api/cron/sync-stats`, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store"
    });

    const json = await res.json().catch(() => null);
    return NextResponse.json(json ?? { success: res.ok });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

