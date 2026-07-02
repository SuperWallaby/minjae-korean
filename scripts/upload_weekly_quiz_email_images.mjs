#!/usr/bin/env node
/**
 * Flatten weekly quiz images onto #f4f4f5 and upload to public R2 for email.
 *
 *   node scripts/upload_weekly_quiz_email_images.mjs
 *   node scripts/upload_weekly_quiz_email_images.mjs 2026-W27
 */
import { loadEnvLocal } from "./lib/env_local.mjs";

async function main() {
  loadEnvLocal();
  const weekKey = process.argv[2]?.trim();
  const { buildWeeklyPictureQuiz, newsletterWeekKey } = await import(
    "../src/lib/newsletterWeeklyQuiz.ts"
  );
  const { flattenQuizImagesForEmail } = await import(
    "../src/lib/newsletterQuizImageEmail.ts"
  );

  const quiz = await buildWeeklyPictureQuiz(weekKey || newsletterWeekKey());
  const emailQuiz = await flattenQuizImagesForEmail(quiz);
  console.log(
    JSON.stringify(
      {
        ok: true,
        weekKey: quiz.weekKey,
        word: quiz.word,
        images: emailQuiz.options.map((o) => ({
          letter: o.letter,
          url: o.imageUrl,
        })),
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
