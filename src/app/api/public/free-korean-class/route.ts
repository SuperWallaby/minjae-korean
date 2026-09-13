import { NextRequest } from "next/server";

import { sendResendEmail } from "@/lib/resendEmail";

export const runtime = "nodejs";

const LEVELS = new Set([
  "absolute-beginner",
  "beginner",
  "intermediate",
  "advanced",
]);

const NOTIFY_TO =
  process.env.TRIAL_NOTIFY_EMAIL?.trim() || "minjae@kajakorean.com";

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

function levelLabel(level: string) {
  if (level === "absolute-beginner") return "Absolute beginner";
  if (level === "beginner") return "Beginner";
  if (level === "intermediate") return "Intermediate";
  if (level === "advanced") return "Advanced";
  return level;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const hp = typeof body?.website === "string" ? body.website.trim() : "";
    if (hp) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase().slice(0, 120)
        : "";
    const level = typeof body?.level === "string" ? body.level.trim() : "";
    const date = typeof body?.date === "string" ? body.date.trim() : "";
    const slot = typeof body?.slot === "string" ? body.slot.trim() : "";

    if (!email || !isEmail(email) || !LEVELS.has(level)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid date" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const when = new Date(slot);
    const opens = new Date("2026-09-17T00:00:00+09:00");
    if (Number.isNaN(when.getTime()) || when < opens || date < "2026-09-17") {
      return new Response(JSON.stringify({ ok: false, error: "Invalid time" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const slotLabel = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Seoul",
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(when);

    const subject = `Free trial request — ${email}`;
    const text = [
      "New 30-minute free trial request",
      "",
      `Email: ${email}`,
      `Level: ${levelLabel(level)}`,
      `Preferred date: ${date}`,
      `Preferred time (KST): ${slotLabel}`,
      `Slot ISO: ${when.toISOString()}`,
      "",
      "Price after trial: $5 per session",
    ].join("\n");
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.55; color: #1d1d1f; max-width: 560px;">
        <h2 style="margin: 0 0 12px; font-size: 18px;">New 30-minute free trial request</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin: 8px 0 16px;">
          <tr>
            <td style="padding: 6px 0; color: #6e6e73; width: 140px;">Email</td>
            <td style="padding: 6px 0;">${esc(email)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Level</td>
            <td style="padding: 6px 0;">${esc(levelLabel(level))}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Preferred date</td>
            <td style="padding: 6px 0;">${esc(date)}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #6e6e73;">Preferred time</td>
            <td style="padding: 6px 0;">${esc(slotLabel)} KST</td>
          </tr>
        </table>
        <p style="margin: 0; font-size: 13px; color: #6e6e73;">After the trial, 1-on-1 tutoring is $5 per session.</p>
      </div>
    `.trim();

    await sendResendEmail({
      to: NOTIFY_TO,
      subject,
      html,
      text,
      replyTo: email,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[free-korean-class]", e);
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
