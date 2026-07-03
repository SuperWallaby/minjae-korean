#!/usr/bin/env node
import { loadEnvLocal } from "./lib/env_local.mjs";

async function main() {
  loadEnvLocal();
  const email = (process.argv[2] || "colton950901@gmail.com").trim().toLowerCase();
  const { buildWeeklyPictureQuiz, buildWeeklyQuizEmail } = await import(
    "../src/lib/newsletterWeeklyQuiz.ts"
  );
  const { sendResendEmail } = await import("../src/lib/resendEmail.ts");

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com";
  const quiz = await buildWeeklyPictureQuiz();
  const mail = buildWeeklyQuizEmail({ quiz, siteUrl, recipientEmail: email });
  await sendResendEmail({
    to: email,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
  });
  console.log(
    JSON.stringify(
      {
        ok: true,
        to: email,
        subject: mail.subject,
        word: quiz.word,
        answer: quiz.options.find((o) => o.correct)?.letter,
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
