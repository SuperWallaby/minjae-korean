import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

function traceId() {
  return `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function log(step: string, data: Record<string, unknown>) {
  // Intentionally verbose for production debugging.
  console.log(`[google_oauth][start] ${step}`, data);
}

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function resolveSiteUrl(req: NextRequest) {
  // In development, prefer the actual request origin (e.g. http://localhost:3000)
  // so redirect_uri + cookies stay on the same host.
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

export async function GET(req: NextRequest) {
  const tid = traceId();
  const next = safeNext(req.nextUrl.searchParams.get("next") ?? "");
  const clientId = mustEnv("GOOGLE_CLIENT_ID");
  const siteUrl = resolveSiteUrl(req);

  const state = randomUUID();
  const redirectUri = `${siteUrl.replace(/\/$/, "")}/api/auth/google/callback`;

  log("computed", {
    tid,
    nodeEnv: process.env.NODE_ENV,
    origin: req.nextUrl.origin,
    host: req.headers.get("host"),
    xForwardedHost: req.headers.get("x-forwarded-host"),
    xForwardedProto: req.headers.get("x-forwarded-proto"),
    siteUrl,
    redirectUri,
    next,
    stateSuffix: state.slice(-6),
    clientIdSuffix: clientId.slice(-6),
  });

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  const res = NextResponse.redirect(url);
  res.cookies.set("kaja_google_oauth", JSON.stringify({ state, next }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10, // 10 minutes
  });
  log("redirect", {
    tid,
    googleAuthUrlHost: url.host,
    cookie: {
      name: "kaja_google_oauth",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 10,
    },
  });
  return res;
}

