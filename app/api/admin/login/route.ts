import { NextResponse } from "next/server";
import { issueAdminToken } from "../../../../lib/adminAuth";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { username?: string; password?: string }
      | null;

    const u = body?.username ?? "";
    const p = body?.password ?? "";

    const envU = process.env.ADMIN_USERNAME;
    const envP = process.env.ADMIN_PASSWORD;
    if (!envU || !envP) {
      return NextResponse.json(
        { success: false, error: "Missing ADMIN_USERNAME/ADMIN_PASSWORD" },
        { status: 500 }
      );
    }

    if (u !== envU || p !== envP) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const token = await issueAdminToken();
    return NextResponse.json({ success: true, token });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

