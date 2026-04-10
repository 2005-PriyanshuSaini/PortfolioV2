import { SignJWT, jwtVerify } from "jose";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function issueAdminToken() {
  const secret = getJwtSecret();
  return await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .setSubject("admin")
    .sign(secret);
}

export async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization");
  const m = auth?.match(/^Bearer\s+(.+)$/i);
  const token = m?.[1];
  if (!token) return { ok: false as const };

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);
    if (payload?.sub !== "admin") return { ok: false as const };
    if ((payload as any)?.role !== "admin") return { ok: false as const };
    return { ok: true as const };
  } catch {
    return { ok: false as const };
  }
}

