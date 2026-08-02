#!/usr/bin/env node
/**
 * Ensure concept_rows bundles are in vocab-x-scheduled.json (Pinterest-ready captions).
 * Does not enqueue X.
 *
 *   npx tsx scripts/schedule-concept-pins.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { wordsFromConceptRowsBundle } from "../src/lib/vocabImageWords.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED = path.join(OUT, "vocab-x-scheduled.json");

function loadScheduled(): Record<string, unknown> {
  if (!fs.existsSync(SCHEDULED)) return {};
  return JSON.parse(fs.readFileSync(SCHEDULED, "utf8"));
}

async function main() {
  const scheduled = loadScheduled();
  const concepts = ALL_VOCAB_BUNDLES.filter((b) => b.format === "concept_rows");
  let n = 0;

  for (const bundle of concepts) {
    const png = path.join(OUT, `${bundle.id}.png`);
    if (!fs.existsSync(png)) {
      console.log(`skip missing ${bundle.id}`);
      continue;
    }
    const prev = scheduled[bundle.id] as { tweetText?: string } | undefined;
    if (prev?.tweetText) {
      console.log(`ok ${bundle.id}`);
      continue;
    }

    const words = wordsFromConceptRowsBundle(bundle);
    const { tweetText, caption, replyText } = await buildVocabXPostText(bundle, {
      imageWords: words,
    });
    scheduled[bundle.id] = {
      reviewStatus: "pin_ready",
      tweetText,
      caption,
      replyText,
      imageWords: words,
      imageWordsSource: "concept_rows",
      scheduledAt: new Date().toISOString(),
    };
    n += 1;
    console.log(`+ ${bundle.id} → ${tweetText.split("\n")[0]?.slice(0, 90)}`);
  }

  fs.writeFileSync(SCHEDULED, JSON.stringify(scheduled, null, 2));
  console.log(`done scheduled ${n} new (total concept=${concepts.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
