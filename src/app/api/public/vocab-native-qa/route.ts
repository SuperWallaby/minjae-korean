import { NextRequest } from "next/server";

import { sendResendEmail } from "@/lib/resendEmail";

export const runtime = "nodejs";

const NOTIFY_TO = "colton950901@gmail.com";
const MAX_QUESTION = 2000;
const MAX_NAME = 80;
const MAX_EMAIL = 120;
const MAX_PAGE_TITLE = 200;
const MAX_PAGE_URL = 500;

function isEmail(s: string) {
  const v = s.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    // Honeypot — bots fill this; real users don't see it.
    const hp =
      typeof body?.website === "string" ? body.website.trim() : "";
    if (hp) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const question =
      typeof body?.question === "string" ? body.question.trim() : "";
    const name =
      typeof body?.name === "string" ? body.name.trim().slice(0, MAX_NAME) : "";
    const emailRaw =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, MAX_EMAIL)
        : "";
    const pageUrl =
      typeof body?.pageUrl === "string"
        ? body.pageUrl.trim().slice(0, MAX_PAGE_URL)
        : "";
    const pageTitle =
      typeof body?.pageTitle === "string"
        ? body.pageTitle.trim().slice(0, MAX_PAGE_TITLE)
        : "";
    const bundleId =
      typeof body?.bundleId === "string" ? body.bundleId.trim().slice(0, 120) : "";

    if (!question || question.length < 3) {
      return new Response(
        JSON.stringify({ ok: false, error: "Please write a short question." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (question.length > MAX_QUESTION) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Question is too long (max ${MAX_QUESTION} characters).`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    if (emailRaw && !isEmail(emailRaw)) {
      return new Response(
        JSON.stringify({ ok: false, error: "Email looks invalid." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const titleBit = pageTitle || bundleId || "vocab page";
    const subject = `[Native Q&A] ${titleBit}`.slice(0, 180);
    const text = [
      "New Native Q&A question from kajakorean.com",
      "",
      `Page: ${pageTitle || "(no title)"}`,
      `URL: ${pageUrl || "(no url)"}`,
      `Bundle: ${bundleId || "(none)"}`,
      `Name: ${name || "(anonymous)"}`,
      `Reply-to email: ${emailRaw || "(not given)"}`,
      "",
      "Question:",
      question,
      "",
      "— Open this email later and answer on the page or by reply.",
    ].join("\n");

    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.55; color: #1d1d1f; max-width: 560px;">
        <h2 style="margin: 0 0 12px; font-size: 18px;">New Native Q&amp;A question</h2>
        <p style="margin: 0 0 8px; font-size: 14px; color: #6e6e73;">
          Someone left a question on a vocab chart. Answer when you can (Minjae / native Korean).
        </p>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 16px 0;">
          <tr>
            <td style="padding: 6px 0; color: #6e6e73; width: 110px; vertical-align: top;">Page</td>
            <td style="padding: 6px 0;">${esc(pageTitle || "(no title)")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73; vertical-align: top;">URL</td>
            <td style="padding: 6px 0; word-break: break-all;">
              ${
                pageUrl
                  ? `<a href="${esc(pageUrl)}">${esc(pageUrl)}</a>`
                  : "(no url)"
              }
            </td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Bundle</td>
            <td style="padding: 6px 0; font-family: ui-monospace, monospace;">${esc(bundleId || "(none)")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Name</td>
            <td style="padding: 6px 0;">${esc(name || "(anonymous)")}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Email</td>
            <td style="padding: 6px 0;">${esc(emailRaw || "(not given)")}</td>
          </tr>
        </table>
        <div style="background: #f5f5f7; border-radius: 12px; padding: 14px 16px; white-space: pre-wrap; font-size: 15px;">
${esc(question)}
        </div>
        <p style="margin: 16px 0 0; font-size: 12px; color: #86868b;">
          Kaja Korean · Native Q&amp;A notify → ${esc(NOTIFY_TO)}
        </p>
      </div>
    `.trim();

    await sendResendEmail({
      to: NOTIFY_TO,
      subject,
      html,
      text,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[vocab-native-qa]", e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
