import { NextRequest } from "next/server";

import { upsertNewsletterSubscriber } from "@/lib/newsletterSubscribersRepo";
import { newsletterUnsubscribeUrl } from "@/lib/newsletterUnsubscribe";
import {
  resolveNewsletterWelcomeBookCoverUrl,
  resolveNewsletterWelcomePdfUrl,
} from "@/lib/newsletterWelcomePdf";
import { sendResendEmail } from "@/lib/resendEmail";

export const runtime = "nodejs";

function isEmail(s: string) {
  const v = (s ?? "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function welcomePdfUrl() {
  return resolveNewsletterWelcomePdfUrl();
}

function buildWelcomeEmail(pdfUrl: string, email: string) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const unsubscribeUrl = newsletterUnsubscribeUrl(email, siteUrl);
  const bookCoverUrl = resolveNewsletterWelcomeBookCoverUrl();
  const subject = "Your Kaja Korean learning PDF";
  const text = [
    "Thanks for subscribing to Kaja Korean!",
    "",
    "Here is your free Korean learning PDF:",
    pdfUrl,
    "",
    "You'll also receive Korean quizzes and challenges every week — so you can keep practicing.",
    "If you don't see this email, check your spam or promotions folder.",
    "",
    `Unsubscribe: ${unsubscribeUrl}`,
    "",
    "Happy studying!",
    "— Minjae / Kaja Korean",
  ].join("\n");
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.55; color: #1d1d1f; max-width: 520px;">
      <h2 style="margin: 0 0 12px; font-size: 20px;">Thanks for subscribing!</h2>
      <p style="margin: 0 0 14px;">As promised, here is your free Korean learning PDF from Kaja Korean — made for learners who want clear, practical study material.</p>
      <p style="margin: 0 0 14px;">You'll also get Korean quizzes and challenges every week, so you can keep practicing between lessons.</p>
      <div style="margin: 22px 0 18px; text-align: center;">
        <a href="${pdfUrl}" style="text-decoration: none;">
          <img
            src="${bookCoverUrl}"
            alt="Kaja Korean — Korean, Beyond Translation"
            width="200"
            style="display: block; margin: 0 auto 14px; max-width: 200px; width: 100%; height: auto; border-radius: 10px; border: 1px solid #e5e5ea;"
          />
        </a>
        <a href="${pdfUrl}" style="display:inline-block; background:#0071e3; color:white; padding:11px 16px; border-radius:999px; text-decoration:none; font-weight:600;">
          Download your PDF
        </a>
      </div>
      <p style="margin: 0 0 8px; font-size: 14px; color: #6e6e73;">If the button does not work, copy this link:</p>
      <p style="margin: 0; font-size: 13px; word-break: break-all;"><a href="${pdfUrl}">${pdfUrl}</a></p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #6e6e73;">Don't see the email? Check your spam or promotions folder.</p>
      <p style="margin: 20px 0 0; font-size: 12px; color: #86868b;">Happy studying!<br>— Minjae / Kaja Korean</p>
      <p style="margin: 14px 0 0; font-size: 12px; color: #86868b;"><a href="${unsubscribeUrl}" style="color:#0071e3;">Unsubscribe</a></p>
    </div>
  `.trim();
  return { subject, text, html };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const email =
      typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const source =
      typeof body?.source === "string" ? body.source.trim() : "subscribe_page";

    if (!email || !isEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await upsertNewsletterSubscriber({ email, source });

    const pdfUrl = welcomePdfUrl();
    const mail = buildWelcomeEmail(pdfUrl, email);
    await sendResendEmail({ to: email, ...mail });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
