#!/usr/bin/env node
/**
 * Register PNG bundles into vocab-x-scheduled.json for Pinterest (no X enqueue).
 *
 *   npx tsx scripts/schedule-ready-pins.ts
 *   npx tsx scripts/schedule-ready-pins.ts --prefix grid-
 *   npx tsx scripts/schedule-ready-pins.ts --prefix tr-
 *   npx tsx scripts/schedule-ready-pins.ts --prefix cmp-
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import type { VocabBundle } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import {
  wordsFromConceptRowsBundle,
  wordsFromPhraseStackBundle,
  wordsFromQuizBundle,
  wordsFromSimilarPairBundle,
  wordsFromTopikUpgradeBundle,
  loadCachedVocabImageWords,
  type VocabImageWord,
} from "../src/lib/vocabImageWords.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import { DROP_IDS } from "./lib/vocab-batch-config.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED = path.join(OUT, "vocab-x-scheduled.json");
const PINNED = path.join(OUT, "pinterest-pinned.json");

function loadJson(file: string) {
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function wordsFromCompoundBundle(bundle: VocabBundle): VocabImageWord[] {
  const cw = bundle.compoundWord;
  if (!cw) return [];
  return [
    {
      hangul: cw.left.hangul,
      romanization: cw.left.romanization,
      english: cw.left.english,
    },
    {
      hangul: cw.right.hangul,
      romanization: cw.right.romanization,
      english: cw.right.english,
    },
    {
      hangul: cw.resultHangul,
      romanization: cw.resultRomanization,
      english: cw.resultMeaning,
    },
  ];
}

function wordsFromGrammarBundle(bundle: VocabBundle): VocabImageWord[] {
  const g = bundle.grammarSpotlight;
  if (!g) return [];
  const ko = `${g.koreanBefore}${g.koreanHighlight}${g.koreanAfter}`.trim();
  const en = `${g.englishBefore}${g.englishHighlight}${g.englishAfter}`.trim();
  const words: VocabImageWord[] = [];
  if (g.koreanHighlight) {
    words.push({
      hangul: g.koreanHighlight,
      english: g.englishHighlight || g.grammarEnglish,
    });
  }
  if (ko && ko !== g.koreanHighlight) {
    words.push({ hangul: ko, english: en || g.grammarEnglish });
  }
  return words;
}

async function wordsForBundle(bundle: VocabBundle) {
  const fromQuiz = wordsFromQuizBundle(bundle);
  if (fromQuiz.length) return fromQuiz;
  const fromConcept = wordsFromConceptRowsBundle(bundle);
  if (fromConcept.length) return fromConcept;
  const fromPhrase = wordsFromPhraseStackBundle(bundle);
  if (fromPhrase.length) return fromPhrase;
  const fromTopik = wordsFromTopikUpgradeBundle(bundle);
  if (fromTopik.length) return fromTopik;
  const fromSimilar = wordsFromSimilarPairBundle(bundle);
  if (fromSimilar.length) return fromSimilar;
  const fromCompound = wordsFromCompoundBundle(bundle);
  if (fromCompound.length) return fromCompound;
  const fromGrammar = wordsFromGrammarBundle(bundle);
  if (fromGrammar.length) return fromGrammar;
  const cached = loadCachedVocabImageWords(OUT, bundle.id);
  if (cached?.words?.length) return cached.words;
  return [];
}

async function main() {
  const prefixIdx = process.argv.indexOf("--prefix");
  const prefix =
    prefixIdx >= 0 && process.argv[prefixIdx + 1]
      ? process.argv[prefixIdx + 1].trim()
      : "";

  const scheduled = loadJson(SCHEDULED) as Record<string, { tweetText?: string }>;
  const pinned = loadJson(PINNED) as Record<string, unknown>;
  const byId = new Map(ALL_VOCAB_BUNDLES.map((b) => [b.id, b]));

  const pngIds = fs
    .readdirSync(OUT)
    .filter(
      (f) =>
        f.endsWith(".png") &&
        !f.startsWith("_") &&
        !f.includes("_raw") &&
        !f.includes("_ill") &&
        !f.includes("_left") &&
        !f.includes("_right"),
    )
    .map((f) => f.replace(/\.png$/, ""))
    .filter((id) => byId.has(id))
    .filter((id) => !DROP_IDS.has(id))
    .filter((id) => !pinned[id])
    .filter((id) => !prefix || id.startsWith(prefix))
    .filter((id) => !scheduled[id]?.tweetText);

  let n = 0;
  for (const id of pngIds) {
    const bundle = byId.get(id)!;
    const words = await wordsForBundle(bundle);
    const { tweetText, caption, replyText } = await buildVocabXPostText(bundle, {
      imageWords: words,
    });
    scheduled[id] = {
      ...(scheduled[id] || {}),
      reviewStatus: "pin_ready",
      tweetText,
      caption,
      replyText,
      imageWords: words,
      imageWordsSource: words.length ? "catalog_or_cache" : "empty",
      scheduledAt: new Date().toISOString(),
    };
    n += 1;
    console.log(`+ ${id} → ${tweetText.split("\n")[0]?.slice(0, 90)}`);
  }

  fs.writeFileSync(SCHEDULED, JSON.stringify(scheduled, null, 2));
  console.log(`done scheduled ${n} (candidates ${pngIds.length})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
