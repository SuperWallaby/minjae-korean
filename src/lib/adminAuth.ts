import type { NextRequest } from "next/server";

export function requireAdminKey(req: NextRequest): { ok: true } | { ok: false; error: string } {
  const expected = (process.env.ADMIN_API_KEY ?? "").trim();
  if (!expected) return { ok: false, error: "Missing ADMIN_API_KEY" };
  const got =
    req.headers.get("x-admin-key")?.trim() ||
    req.nextUrl.searchParams.get("key")?.trim();
  if (!got || got !== expected) return { ok: false, error: "Unauthorized" };
  return { ok: true };
}
