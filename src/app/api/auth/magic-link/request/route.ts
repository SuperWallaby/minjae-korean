import { NextRequest } from "next/server";
import { SignJWT } from "jose";

export const runtime = "nodejs";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function mustAuthSecret() {
  // Keep compatible with existing setups that already use NEXTAUTH_SECRET.
  return process.env.AUTH_JWT_SECRET?.trim() || mustEnv("NEXTAUTH_SECRET");
}

function isEmail(s: string) {
  const v = (s ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function safeNext(next: string) {
  const v = (next ?? "").trim();
  if (!v) return "/account";
  if (!v.startsWith("/")) return "/account";
  // avoid open redirects (no protocol, no double slash)
  if (v.startsWith("//")) return "/account";
  return v;
}

async function sendWithResend(args: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const apiKey = mustEnv("RESEND_API_KEY");
  const from = mustEnv("RESEND_FROM_EMAIL");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg =
      (json && typeof json === "object" && "message" in json
        ? String((json as { message?: unknown }).message ?? "")
        : null) ?? `HTTP ${res.status}`;
    throw new Error(`Resend failed: ${msg}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const next = safeNext(typeof body?.next === "string" ? body.next : "");
    if (!email || !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
    const secret = mustAuthSecret();

    const token = await new SignJWT({ email, next })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(`magic:${email}`)
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(secret));

    const link = `${siteUrl.replace(/\/$/, "")}/login/verify?token=${encodeURIComponent(token)}`;

    const subject = "Your Kaja login link";
    const text = `Tap to sign in:\n${link}\n\nThis link expires in 15 minutes.`;
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Sign in to Kaja</h2>
        <p style="margin: 0 0 14px;">Click the button below to sign in. This link expires in <b>15 minutes</b>.</p>
        <p style="margin: 18px 0;">
          <a href="${link}" style="display:inline-block; background:#111827; color:white; padding:10px 14px; border-radius:10px; text-decoration:none;">
            Sign in
          </a>
        </p>
        <p style="margin: 0; color: #6b7280; font-size: 12px;">If you didn’t request this, you can ignore this email.</p>
      </div>
    `.trim();

    await sendWithResend({ to: email, subject, html, text });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ ok: false, error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

