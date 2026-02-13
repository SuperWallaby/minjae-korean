import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import { findStudentByAuthUserId } from "@/lib/students";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

type SessionClaims = {
  sub: string;
  email?: string;
  studentId?: string;
  name?: string;
};

export async function GET() {
  try {
    const jar = await cookies();
    const token = jar.get("kaja_session")?.value ?? "";

    if (!token) {
      return new Response(JSON.stringify({ ok: true, user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const secret = mustAuthSecret();
    let verified;
    try {
      verified = await jwtVerify(token, new TextEncoder().encode(secret));
    } catch {
      return new Response(JSON.stringify({ ok: true, user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const payload = verified.payload as unknown as Partial<SessionClaims>;
    const authUserId = typeof payload.sub === "string" ? payload.sub : "";
    if (!authUserId) {
      return new Response(JSON.stringify({ ok: true, user: null }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const s = findStudentByAuthUserId(authUserId);
    const name =
      (s?.name ?? (typeof payload.name === "string" ? payload.name : "")).trim();
    const email =
      (s?.email ??
        (typeof payload.email === "string" ? payload.email : "")).trim();
    const studentId =
      (s?.id ??
        (typeof payload.studentId === "string" ? payload.studentId : "")).trim();

    return new Response(
      JSON.stringify({
        ok: true,
        user: {
          id: authUserId,
          name: name || "Member",
          email,
          studentId,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch {
    // If token expired/invalid, treat as signed out.
    return new Response(JSON.stringify({ ok: true, user: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

