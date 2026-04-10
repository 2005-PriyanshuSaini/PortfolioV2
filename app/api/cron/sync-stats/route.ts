import { NextResponse } from "next/server";
import { syncStatsNow } from "../../../../lib/syncStats";

function bearerFromHeader(authHeader: string | null) {
  if (!authHeader) return null;
  const m = authHeader.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? null;
}

export async function GET(req: Request) {
  try {
    const secret = process.env.CRON_SECRET;
    const token = bearerFromHeader(req.headers.get("authorization"));
    if (!secret || token !== secret) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    const { syncedAt } = await syncStatsNow();
    return NextResponse.json({ success: true, synced_at: syncedAt });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

