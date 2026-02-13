import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";

import { upsertStudentByAuthUserId } from "@/lib/students";

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

function readOauthCookie(raw: string | undefined): { state: string; next: string } | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as unknown;
    if (!j || typeof j !== "object") return null;
    const o = j as Record<string, unknown>;
    const state = typeof o.state === "string" ? o.state : "";
    const next = typeof o.next === "string" ? o.next : "";
    if (!state) return null;
    return { state, next };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const code = req.nextUrl.searchParams.get("code") ?? "";
    const state = req.nextUrl.searchParams.get("state") ?? "";
    if (!code) return NextResponse.redirect(new URL("/login?error=google_missing_code", req.url));

    const jar = await cookies();
    const stored = readOauthCookie(jar.get("kaja_google_oauth")?.value);
    const next = safeNext(stored?.next ?? "");

    if (!stored || !state || stored.state !== state) {
      return NextResponse.redirect(new URL("/login?error=google_bad_state", req.url));
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
    const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: mustEnv("GOOGLE_CLIENT_ID"),
        client_secret: mustEnv("GOOGLE_CLIENT_SECRET"),
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });
    const tokenJson = await tokenRes.json().catch(() => null) as any;

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_token_exchange", req.url));
    }

    const idToken = typeof tokenJson?.id_token === "string" ? tokenJson.id_token : "";
    if (!idToken) return NextResponse.redirect(new URL("/login?error=google_no_id_token", req.url));

    const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
    let payload: any;
    try {
      ({ payload } = await jwtVerify(idToken, jwks, {
      audience: mustEnv("GOOGLE_CLIENT_ID"),
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      }));
    } catch (e) {
      return NextResponse.redirect(new URL("/login?error=google_id_token_verify_failed", req.url));
    }

    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email = typeof (payload as any).email === "string" ? String((payload as any).email).trim().toLowerCase() : "";
    const name = typeof (payload as any).name === "string" ? String((payload as any).name).trim() : "Member";

    if (!sub) return NextResponse.redirect(new URL("/login?error=google_bad_sub", req.url));
    if (!email) return NextResponse.redirect(new URL("/login?error=google_no_email", req.url));

    const authUserId = `google:${sub}`;
    const student = upsertStudentByAuthUserId({ authUserId, name, email });
    if (!student) return NextResponse.redirect(new URL("/login?error=student_upsert_failed", req.url));

    const secret = mustAuthSecret();
    const sessionToken = await new SignJWT({
      email,
      studentId: student.id,
      name: student.name,
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
    res.cookies.set("kaja_google_oauth", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
    res.headers.set("Cache-Control", "no-store");

    return res;
  } catch {
    return NextResponse.redirect(new URL("/login?error=google_callback_failed", req.url));
  }
}

