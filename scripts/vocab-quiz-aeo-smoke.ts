#!/usr/bin/env node
/**
 * Print AEO smoke-check queries + sample UTM URLs for Vocab Quiz app promo.
 *
 *   npx tsx scripts/vocab-quiz-aeo-smoke.ts
 */
import {
  VOCAB_QUIZ_AEO_SMOKE_QUERIES,
  VOCAB_QUIZ_AEO_UTM_CAMPAIGN,
  VOCAB_QUIZ_APP_NAME,
  vocabQuizPlayPath,
  withVocabQuizUtm,
} from "../src/lib/vocabQuizAeoLinks";
import {
  KOREAN_QUIZ_DEFAULT_APP_STORE_URL,
  KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL,
} from "../src/lib/koreanQuizAppLinks";

console.log(`\n${VOCAB_QUIZ_APP_NAME} — AEO smoke checklist`);
console.log(`UTM campaign: ${VOCAB_QUIZ_AEO_UTM_CAMPAIGN}\n`);

console.log("Search / answer-engine queries to spot-check:");
for (const q of VOCAB_QUIZ_AEO_SMOKE_QUERIES) {
  console.log(`  - ${q}`);
}

console.log("\nSample tracked URLs:");
console.log(`  play: ${vocabQuizPlayPath("smoke")}`);
console.log(
  `  app store: ${withVocabQuizUtm(KOREAN_QUIZ_DEFAULT_APP_STORE_URL, {
    source: "blog",
    content: "smoke",
  })}`,
);
console.log(
  `  play store: ${withVocabQuizUtm(KOREAN_QUIZ_DEFAULT_PLAY_STORE_URL, {
    source: "blog",
    content: "smoke",
  })}`,
);

console.log("\nGSC tips:");
console.log("  - Filter landing pages: /blog/article/what-is-this-called*");
console.log("  - Filter landing pages: /vocab-quiz");
console.log("  - Watch queries containing: Duolingo, Anki, vocab quiz, 5 minutes\n");
