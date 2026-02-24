import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export type SessionUser = { id: string; name: string };

const COOKIE_NAME = "kaja_session";

function getSecret(): string {
  const v = process.env.AUTH_JWT_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim();
  if (!v) throw new Error("Missing AUTH_JWT_SECRET or NEXTAUTH_SECRET");
  return v;
}

/**
 * Returns current session user from cookie (JWT). Use in API routes that require login.
 * Returns null if not logged in or token invalid.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value ?? "";
    if (!token) return null;
    const secret = new TextEncoder().encode(getSecret());
    const { payload } = await jwtVerify(token, secret);
    const sub = typeof payload.sub === "string" ? payload.sub : "";
    if (!sub) return null;
    const name = (typeof payload.name === "string" ? payload.name : "").trim() || "Member";
    return { id: sub, name };
  } catch {
    return null;
  }
}
