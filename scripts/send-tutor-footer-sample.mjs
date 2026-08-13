#!/usr/bin/env node
/**
 * One-shot sample: weekly quiz email with Find a Korean tutor footer.
 *   node scripts/send-tutor-footer-sample.mjs [email]
 */
import { loadEnvLocal } from "./lib/env_local.mjs";

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
  const { buildWeeklyPictureQuiz, buildWeeklyQuizEmail } = await import(
    "../src/lib/newsletterWeeklyQuiz.ts"
  );

  const quiz = await buildWeeklyPictureQuiz();
  const mail = buildWeeklyQuizEmail({
    quiz,
    siteUrl,
    recipientEmail: email,
  });
  await sendResendEmail({
    to: email,
    subject: `[Sample] ${mail.subject}`,
    html: mail.html,
    text: mail.text,
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        to: email,
        subject: `[Sample] ${mail.subject}`,
        word: quiz.word,
        hasTutor: mail.html.includes("Find a Korean tutor"),
        hasItalki: mail.html.includes("italki"),
        hasPreply: mail.html.includes("Preply"),
      },
      null,
      2,
    ),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
