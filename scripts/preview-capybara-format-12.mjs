#!/usr/bin/env node
/**
 * Preview Format 12 — manual question + 5 answer lines (no AI).
 *
 *   node scripts/preview-capybara-format-12.mjs
 *   node scripts/preview-capybara-format-12.mjs "When to use X?" "line1" "line2" ...
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const SAMPLES = [
  {
    name: "meaning-근데",
    question: "What does 근데 mean?",
    questionWords: ["근데"],
    manualAnswers: [
      "But — softens or pivots the topic",
      "So anyway — back to the point",
      "By the way — quick side note",
      "Well then — reacting to what was said",
      "Casual filler — buys thinking time",
    ],
  },
  {
    name: "compare-3way",
    question: "When to use",
    questionWords: ["아직", "벌써", "이제"],
    manualAnswers: [
      "아직: not yet, still waiting",
      "벌써: already, sooner than expected",
      "이제: from now on, at this point",
      "아직 vs 벌써: expectation direction",
      "이제: closes the past chapter",
    ],
  },
  {
    name: "compare-2way",
    question: "When to use",
    questionWords: ["그래서", "그러니까"],
    manualAnswers: [
      "그래서: result in the story",
      "그러니까: logical conclusion",
      "그래서: links two events",
      "그러니까: spells out the reason",
      "Pick 그래서 for narrative flow",
    ],
  },
];

async function main() {
  const { renderCapybaraDialogueImage } = await import(
    "../src/lib/capybaraDialogueImage.ts"
  );

  const outDir = join(ROOT, ".tmp", "capybara-format-12");
  mkdirSync(outDir, { recursive: true });

  const customQuestion = process.argv[2]?.trim();
  const customAnswers = process.argv.slice(3).map((s) => s.trim()).filter(Boolean);

  const jobs =
    customQuestion && customAnswers.length > 0
      ? [
          {
            name: "custom",
            question: customQuestion,
            manualAnswers: customAnswers.slice(0, 5),
          },
        ]
      : SAMPLES;

  const written = [];

  for (const sample of jobs) {
    const question =
      sample.questionWords?.length >= 2
        ? sample.question
        : sample.question;
    const png = await renderCapybaraDialogueImage({
      question,
      questionWords: sample.questionWords,
      formatPreset: "12",
      manualAnswers: sample.manualAnswers,
      outputWidth: 1600,
    });
    const outPath = join(outDir, `${sample.name}.png`);
    writeFileSync(outPath, png);
    written.push({
      file: outPath,
      question: sample.question,
      answers: sample.manualAnswers,
    });
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        format: 12,
        note: "Manual 5-line answers — no AI. Wider text columns.",
        files: written,
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
