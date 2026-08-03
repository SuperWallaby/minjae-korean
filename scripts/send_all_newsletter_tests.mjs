#!/usr/bin/env node
/**
 * One-shot: send all newsletter variants to a test inbox.
 *   npx tsx scripts/send_all_newsletter_tests.mjs [email]
 */
import { loadEnvLocal } from "./lib/env_local.mjs";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  loadEnvLocal();
  const email = (
    process.argv[2] || "colton950901@gmail.com"
  )
    .trim()
    .toLowerCase();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";

  const { sendResendEmail } = await import("../src/lib/resendEmail.ts");
  const { NEWSLETTER_SUBJECT } = await import(
    "../src/lib/newsletterSubjects.ts"
  );
  const { newsletterUnsubscribeUrl } = await import(
    "../src/lib/newsletterUnsubscribe.ts"
  );
  const {
    resolveNewsletterWelcomeBookCoverUrl,
    resolveNewsletterWelcomePdfUrl,
  } = await import("../src/lib/newsletterWelcomePdf.ts");
  const { buildWeeklyPictureQuiz, buildWeeklyQuizEmail } = await import(
    "../src/lib/newsletterWeeklyQuiz.ts"
  );
  const { buildGrammarQuizDigest, buildGrammarQuizEmail } = await import(
    "../src/lib/newsletterGrammarQuiz.ts"
  );
  const {
    buildPopularExpressionsDigest,
    buildPopularExpressionsEmail,
  } = await import("../src/lib/newsletterPopularExpressions.ts");

  const results = [];

  // 1) Welcome PDF
  {
    const pdfUrl = resolveNewsletterWelcomePdfUrl();
    const bookCoverUrl = resolveNewsletterWelcomeBookCoverUrl(siteUrl);
    const unsubscribeUrl = newsletterUnsubscribeUrl(email, siteUrl);
    const subject = NEWSLETTER_SUBJECT.welcomePdf;
    const text = [
      "Thanks for subscribing to Kaja Korean!",
      "",
      "Here is your free Korean learning PDF:",
      pdfUrl,
      "",
      `Unsubscribe: ${unsubscribeUrl}`,
    ].join("\n");
    const html = `<div style="font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;line-height:1.55;color:#1d1d1f;max-width:520px;">
      <h2 style="margin:0 0 12px;font-size:20px;">Thanks for subscribing!</h2>
      <p style="margin:0 0 14px;">As promised, here is your free Korean learning PDF from Kaja Korean.</p>
      <div style="margin:22px 0 18px;text-align:center;">
        <a href="${pdfUrl}" style="text-decoration:none;">
          <img src="${bookCoverUrl}" alt="Korean Beyond Translation" width="200" style="display:block;margin:0 auto 14px;max-width:200px;width:100%;height:auto;border-radius:10px;border:1px solid #e5e5ea;" />
        </a>
        <a href="${pdfUrl}" style="display:inline-block;background:#0071e3;color:white;padding:11px 16px;border-radius:999px;text-decoration:none;font-weight:600;">Download your PDF</a>
      </div>
      <p style="margin:14px 0 0;font-size:12px;color:#86868b;"><a href="${unsubscribeUrl}" style="color:#0071e3;">Unsubscribe</a></p>
    </div>`;
    await sendResendEmail({ to: email, subject, html, text });
    results.push({ kind: "welcomePdf", subject });
    console.error("sent welcomePdf");
    await sleep(400);
  }

  // 2) Photo Quiz
  {
    const quiz = await buildWeeklyPictureQuiz();
    const mail = buildWeeklyQuizEmail({
      quiz,
      siteUrl,
      recipientEmail: email,
    });
    await sendResendEmail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    results.push({
      kind: "photoQuiz",
      subject: mail.subject,
      word: quiz.word,
    });
    console.error("sent photoQuiz", quiz.word);
    await sleep(400);
  }

  // 3) Grammar / photo trial
  {
    const digest = buildGrammarQuizDigest();
    const mail = buildGrammarQuizEmail({
      digest,
      siteUrl,
      recipientEmail: email,
    });
    await sendResendEmail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    results.push({
      kind: "grammarQuiz",
      subject: mail.subject,
      trialId: digest.trial.id,
    });
    console.error("sent grammarQuiz", digest.trial.id);
    await sleep(400);
  }

  // 4) Popular expressions
  {
    const digest = buildPopularExpressionsDigest();
    const mail = buildPopularExpressionsEmail({
      digest,
      siteUrl,
      recipientEmail: email,
    });
    await sendResendEmail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    results.push({
      kind: "popularExpressions",
      subject: mail.subject,
      pins: digest.pins.map((p) => p.bundleId),
    });
    console.error("sent popularExpressions");
  }

  console.log(JSON.stringify({ ok: true, to: email, sent: results }, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
