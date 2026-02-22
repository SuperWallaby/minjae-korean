import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  findStudentByAuthUserId,
  redeemCouponByStudentId,
  upsertStudentByAuthUserId,
} from "@/lib/studentsRepo";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

function normalizeCode(v: string) {
  return String(v ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
}

function configuredCodes(): Set<string> {
  const raw = String(process.env.COUPON_CODES ?? "").trim();
  if (!raw) return new Set();
  const parts = raw
    .split(",")
    .map((s) => normalizeCode(s))
    .filter(Boolean);
  return new Set(parts);
}

type SessionClaims = {
  sub?: string;
  email?: string;
  studentId?: string;
  name?: string;
};

export async function POST(req: Request) {
  try {
    const codes = configuredCodes();
    if (codes.size === 0) {
      return new Response(
        JSON.stringify({ ok: false, error: "Coupon system not configured" }),
        { status: 500 },
      );
    }

    const body = await req.json().catch(() => null);
    const codeRaw = typeof body?.code === "string" ? body.code : "";
    const code = normalizeCode(codeRaw);
    if (!code) {
      return new Response(JSON.stringify({ ok: false, error: "Missing code" }), {
        status: 400,
      });
    }
    if (!codes.has(code)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid code" }), {
        status: 400,
      });
    }

    const jar = await cookies();
    const token = jar.get("kaja_session")?.value ?? "";
    if (!token) {
      return new Response(
        JSON.stringify({ ok: false, error: "Please sign in" }),
        { status: 401 },
      );
    }

    const secret = mustAuthSecret();
    let verified;
    try {
      verified = await jwtVerify(token, new TextEncoder().encode(secret));
    } catch {
      return new Response(
        JSON.stringify({ ok: false, error: "Please sign in" }),
        { status: 401 },
      );
    }

    const payload = verified.payload as unknown as Partial<SessionClaims>;
    const authUserId = typeof payload.sub === "string" ? payload.sub.trim() : "";
    if (!authUserId) {
      return new Response(
        JSON.stringify({ ok: false, error: "Please sign in" }),
        { status: 401 },
      );
    }

    const payloadEmail =
      typeof payload.email === "string" ? payload.email.trim() : "";
    const payloadName =
      typeof payload.name === "string" ? payload.name.trim() : "";

    const existing = await findStudentByAuthUserId(authUserId);
    const student =
      existing ??
      (payloadEmail
        ? await upsertStudentByAuthUserId({
            authUserId,
            name: payloadName || "Member",
            email: payloadEmail,
          })
        : null);

    if (!student) {
      return new Response(
        JSON.stringify({ ok: false, error: "Student not found" }),
        { status: 404 },
      );
    }

    const redeemed = await redeemCouponByStudentId({
      studentId: student.id,
      code,
      credits: 2,
    });
    if (!redeemed.ok) {
      return new Response(JSON.stringify({ ok: false, error: redeemed.error }), {
        status: 409,
      });
    }

    return new Response(JSON.stringify({ ok: true, granted: 2 }), {
      status: 200,
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500 },
    );
  }
}

