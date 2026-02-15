import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT, createRemoteJWKSet, jwtVerify } from "jose";

import { upsertStudentByAuthUserId } from "@/lib/students";

export const runtime = "nodejs";

function traceId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function log(step: string, data: Record<string, unknown>) {
  // Intentionally verbose for production debugging.
  console.log(`[google_oauth][callback] ${step}`, data);
}

function safeTokenJsonLog(tokenJson: unknown) {
  if (!tokenJson || typeof tokenJson !== "object") return { type: typeof tokenJson };
  const obj = tokenJson as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "access_token" || k === "id_token" || k === "refresh_token") {
      out[k] = typeof v === "string" ? `<redacted len=${v.length}>` : "<redacted>";
      continue;
    }
    out[k] = v;
  }
  return out;
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

function resolveSiteUrl(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const isDev = process.env.NODE_ENV !== "production";
  if (isDev) return origin;
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || origin || "http://localhost:3000";
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
  const tid = traceId();
  try {
    const code = req.nextUrl.searchParams.get("code") ?? "";
    const state = req.nextUrl.searchParams.get("state") ?? "";
    log("enter", {
      tid,
      nodeEnv: process.env.NODE_ENV,
      url: req.nextUrl.toString(),
      origin: req.nextUrl.origin,
      host: req.headers.get("host"),
      xForwardedHost: req.headers.get("x-forwarded-host"),
      xForwardedProto: req.headers.get("x-forwarded-proto"),
      hasCode: Boolean(code),
      codeLen: code.length,
      hasState: Boolean(state),
      stateSuffix: state ? state.slice(-6) : "",
    });
    if (!code) return NextResponse.redirect(new URL("/login?error=google_missing_code", req.url));

    const jar = await cookies();
    const rawCookie = jar.get("kaja_google_oauth")?.value;
    const stored = readOauthCookie(rawCookie);
    const next = safeNext(stored?.next ?? "");
    log("cookie", {
      tid,
      cookiePresent: Boolean(rawCookie),
      cookieLen: rawCookie ? rawCookie.length : 0,
      storedParsed: Boolean(stored),
      storedStateSuffix: stored?.state ? stored.state.slice(-6) : "",
      next,
    });

    if (!stored || !state || stored.state !== state) {
      log("bad_state", {
        tid,
        hasStored: Boolean(stored),
        hasState: Boolean(state),
        storedStateSuffix: stored?.state ? stored.state.slice(-6) : "",
        stateSuffix: state ? state.slice(-6) : "",
        hint: "Prod-only? Check NEXT_PUBLIC_SITE_URL vs actual host (www/apex) and HTTPS/secure cookie behavior.",
      });
      return NextResponse.redirect(new URL("/login?error=google_bad_state", req.url));
    }

    const siteUrl = resolveSiteUrl(req);
    const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/google/callback`;
    log("redirect_uri", { tid, siteUrl, redirectUri, next });

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
    const tokenJson = (await tokenRes.json().catch(() => null)) as unknown;
    log("token_exchange_response", {
      tid,
      ok: tokenRes.ok,
      status: tokenRes.status,
      statusText: tokenRes.statusText,
      body: safeTokenJsonLog(tokenJson),
    });

    if (!tokenRes.ok) {
      return NextResponse.redirect(new URL("/login?error=google_token_exchange", req.url));
    }

    const idToken = (() => {
      if (!tokenJson || typeof tokenJson !== "object") return "";
      if (!("id_token" in tokenJson)) return "";
      const v = (tokenJson as { id_token?: unknown }).id_token;
      return typeof v === "string" ? v : "";
    })();
    log("id_token", { tid, present: Boolean(idToken), len: idToken ? idToken.length : 0 });
    if (!idToken) return NextResponse.redirect(new URL("/login?error=google_no_id_token", req.url));

    const jwks = createRemoteJWKSet(
      new URL("https://www.googleapis.com/oauth2/v3/certs"),
    );
    let payload: Record<string, unknown> = {};
    try {
      const verified = await jwtVerify(idToken, jwks, {
        audience: mustEnv("GOOGLE_CLIENT_ID"),
        issuer: ["https://accounts.google.com", "accounts.google.com"],
      });
      payload = verified.payload as unknown as Record<string, unknown>;
      log("id_token_verified", {
        tid,
        subSuffix: typeof payload.sub === "string" ? payload.sub.slice(-6) : "",
        hasEmail: typeof payload.email === "string",
        emailDomain:
          typeof payload.email === "string" && String(payload.email).includes("@")
            ? String(payload.email).split("@").slice(-1)[0]
            : "",
      });
    } catch (err) {
      log("id_token_verify_failed", {
        tid,
        err: err instanceof Error ? { name: err.name, message: err.message } : String(err),
        hint: "Common causes: wrong GOOGLE_CLIENT_ID in prod or mismatched OAuth client.",
      });
      return NextResponse.redirect(new URL("/login?error=google_id_token_verify_failed", req.url));
    }

    const sub = typeof payload.sub === "string" ? payload.sub : "";
    const email =
      typeof payload.email === "string"
        ? String(payload.email).trim().toLowerCase()
        : "";
    const name =
      typeof payload.name === "string" ? String(payload.name).trim() : "Member";

    if (!sub) return NextResponse.redirect(new URL("/login?error=google_bad_sub", req.url));
    if (!email) return NextResponse.redirect(new URL("/login?error=google_no_email", req.url));

    const authUserId = `google:${sub}`;
    log("upsert_student", {
      tid,
      authUserIdSuffix: authUserId.slice(-10),
      emailDomain: email.includes("@") ? email.split("@").slice(-1)[0] : "",
    });
    const student = upsertStudentByAuthUserId({ authUserId, name, email });
    if (!student) return NextResponse.redirect(new URL("/login?error=student_upsert_failed", req.url));
    log("upsert_student_ok", { tid, studentId: student.id });

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
    log("session_jwt_signed", { tid, jwtLen: sessionToken.length });

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

    log("success_redirect", {
      tid,
      next,
      cookieSecure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    return res;
  } catch (e) {
    log("exception", {
      tid,
      err: e instanceof Error ? { name: e.name, message: e.message, stack: e.stack } : String(e),
    });
    console.error(e);
    return NextResponse.redirect(new URL("/login?error=google_callback_failed", req.url));
  }
}

