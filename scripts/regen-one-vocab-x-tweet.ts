/**
 * One-off: regenerate a single vocab X tweet locked to image words.
 *   npx tsx scripts/regen-one-vocab-x-tweet.ts ant-before-after
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import {
  resolveVocabImageWords,
  tweetHangulMatchesImageWords,
} from "../src/lib/vocabImageWords.ts";
import { getMongoDb } from "../src/lib/mongo.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

async function main() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);

  const bundleId = process.argv[2]?.trim();
  if (!bundleId) {
    console.error("Usage: npx tsx scripts/regen-one-vocab-x-tweet.ts <bundleId>");
    process.exit(1);
  }

  const bundle = ALL_VOCAB_BUNDLES.find((b) => b.id === bundleId);
  if (!bundle) throw new Error(`Unknown bundle: ${bundleId}`);

  const imagePath = path.join(OUT, `${bundleId}.png`);
  const payload = await resolveVocabImageWords({
    bundle,
    cacheDir: OUT,
    imagePath: fs.existsSync(imagePath) ? imagePath : undefined,
  });

  const { tweetText, caption, replyText, style } = await buildVocabXPostText(
    bundle,
    { imageWords: payload.words },
  );
  const match = tweetHangulMatchesImageWords(tweetText, payload.words);
  console.log(JSON.stringify({ bundleId, style, words: payload.words, match, tweetText }, null, 2));
  if (!match.ok) throw new Error(`Foreign hangul: ${match.foreign.join(", ")}`);

  if (fs.existsSync(SCHEDULED_PATH)) {
    const scheduled = JSON.parse(fs.readFileSync(SCHEDULED_PATH, "utf8")) as Record<
      string,
      Record<string, unknown>
    >;
    if (scheduled[bundleId]) {
      scheduled[bundleId] = {
        ...scheduled[bundleId],
        tweetText,
        caption,
        replyText,
        imageWords: payload.words,
        imageWordsSource: payload.source,
        regeneratedAt: new Date().toISOString(),
      };
      fs.writeFileSync(SCHEDULED_PATH, JSON.stringify(scheduled, null, 2));
    }
  }

  const db = await getMongoDb();
  const now = new Date().toISOString();
  await db.collection("vocab_x_review").updateOne(
    { bundleId },
    {
      $set: {
        tweetText,
        replyText: replyText ?? null,
        captionLine1: caption.line1,
        captionLine2: caption.line2,
        updatedAt: now,
      },
    },
  );

  console.log("updated");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
