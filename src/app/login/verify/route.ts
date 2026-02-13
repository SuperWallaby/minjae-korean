import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose";
import { randomUUID } from "node:crypto";

import { findStudentByEmail, patchStudent, upsertStudentByEmail } from "@/lib/students";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

function safeNext(next: string) {
  const v = (next ?? "").trim();
  if (!v) return "/account";
  if (!v.startsWith("/")) return "/account";
  if (v.startsWith("//")) return "/account";
  return v;
}

type MagicClaims = { email?: string; next?: string };

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token") ?? "";
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", req.url));
    }

    const secret = mustAuthSecret();
    const verified = await jwtVerify(token, new TextEncoder().encode(secret));
    const payload = verified.payload as unknown as MagicClaims;
    const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
    const next = safeNext(typeof payload.next === "string" ? payload.next : "");
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", req.url));
    }

    // Ensure a student exists for this email, and has a stable authUserId.
    const existing = findStudentByEmail(email);
    const base = existing ?? upsertStudentByEmail({ name: "Member", email });
    if (!base) {
      return NextResponse.redirect(new URL("/login?error=invalid_email", req.url));
    }
    const authUserId =
      (base.authUserId ?? "").trim() || `magic:${randomUUID()}`;
    if ((base.authUserId ?? "").trim() !== authUserId) {
      patchStudent(base.id, { authUserId });
    }

    // Create a session JWT stored in httpOnly cookie.
    const sessionToken = await new SignJWT({
      email,
      studentId: base.id,
      name: base.name,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(authUserId)
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(new TextEncoder().encode(secret));

    const res = NextResponse.redirect(new URL(next, req.url));
    res.cookies.set("kaja_session", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    // Let the client session provider re-fetch immediately after redirect.
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=expired_or_invalid", req.url));
  }
}

