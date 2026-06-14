import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const NOTIFY_EMAIL = "colton950901@gmail.com";

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
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

function htmlPage(title: string, body: string, ok: boolean) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; line-height: 1.5; }
      .ok { color: #166534; }
      .err { color: #b91c1c; }
    </style>
  </head>
  <body>
    <h1 class="${ok ? "ok" : "err"}">${title}</h1>
    <p>${body}</p>
  </body>
</html>`;
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") ?? "";
  const state = req.nextUrl.searchParams.get("state") ?? "";
  const error = req.nextUrl.searchParams.get("error") ?? "";
  const errorDescription = req.nextUrl.searchParams.get("error_description") ?? "";

  console.log("[pinterest_oauth][callback]", {
    code,
    codeLen: code.length,
    state,
    error,
    errorDescription,
    url: req.nextUrl.toString(),
  });

  if (error) {
    console.log("[pinterest_oauth][callback] oauth_error", { error, errorDescription });
    return new NextResponse(
      htmlPage(
        "Pinterest authorization failed",
        `${error}${errorDescription ? `: ${errorDescription}` : ""}`,
        false,
      ),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  if (!code) {
    return new NextResponse(htmlPage("Missing authorization code", "No code query parameter was provided.", false), {
      status: 400,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  try {
    const subject = "Pinterest OAuth authorization code";
    const text = [
      "Pinterest redirected back with an authorization code:",
      "",
      code,
      "",
      state ? `state: ${state}` : "state: (none)",
      "",
      `Received at: ${new Date().toISOString()}`,
    ].join("\n");
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; line-height: 1.5;">
        <h2 style="margin: 0 0 12px;">Pinterest OAuth code</h2>
        <p style="margin: 0 0 12px;">Authorization code:</p>
        <pre style="background:#f3f4f6; padding:12px; border-radius:8px; overflow:auto;">${code}</pre>
        ${state ? `<p style="margin: 12px 0 0;">state: <code>${state}</code></p>` : ""}
        <p style="margin: 12px 0 0; color:#6b7280; font-size:12px;">Received at ${new Date().toISOString()}</p>
      </div>
    `.trim();

    await sendWithResend({ to: NOTIFY_EMAIL, subject, html, text });

    return new NextResponse(
      htmlPage(
        "Pinterest code received",
        `The authorization code was logged and emailed to ${NOTIFY_EMAIL}.`,
        true,
      ),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  } catch (e) {
    console.error("[pinterest_oauth][callback] exception", e);
    return new NextResponse(
      htmlPage(
        "Failed to notify",
        e instanceof Error ? e.message : String(e),
        false,
      ),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}
