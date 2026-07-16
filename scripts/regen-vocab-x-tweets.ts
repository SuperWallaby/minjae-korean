/**
 * Regenerate X tweet copy for vocab items using image-locked captions.
 *
 *   npx tsx scripts/regen-vocab-x-tweets.ts
 *   npx tsx scripts/regen-vocab-x-tweets.ts --queued
 *   npx tsx scripts/regen-vocab-x-tweets.ts --scheduled
 *   npx tsx scripts/regen-vocab-x-tweets.ts --scheduled --format antonym_split
 *   npx tsx scripts/regen-vocab-x-tweets.ts --scheduled --mismatched-only
 *   npx tsx scripts/regen-vocab-x-tweets.ts --limit 20
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import {
  resolveVocabImageWords,
  tweetHangulMatchesImageWords,
  antonymTweetUsesTopicPair,
} from "../src/lib/vocabImageWords.ts";
import { getMongoDb } from "../src/lib/mongo.ts";
import {
  listVocabXReview,
  type VocabXReviewItem,
} from "../src/lib/vocabXReviewRepo.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

async function imageWordsFor(
  bundleId: string,
  imageUrl?: string | null,
) {
  const bundle = findBundle(bundleId);
  if (!bundle) {
    return {
      bundleId,
      extractedAt: new Date().toISOString(),
      words: [] as const,
      source: "preview" as const,
    };
  }
  const imagePath = path.join(OUT, `${bundleId}.png`);
  return resolveVocabImageWords({
    bundle,
    cacheDir: OUT,
    imagePath: fs.existsSync(imagePath) ? imagePath : undefined,
    imageUrl: imageUrl || undefined,
  });
}

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
}

function argFlag(name: string) {
  return process.argv.includes(name);
}

function argValue(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  if (i < 0) return undefined;
  return process.argv[i + 1];
}

function findBundle(bundleId: string) {
  return ALL_VOCAB_BUNDLES.find((b) => b.id === bundleId) ?? null;
}

function loadScheduled(): Record<string, Record<string, unknown>> {
  if (!fs.existsSync(SCHEDULED_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(SCHEDULED_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveScheduled(data: Record<string, unknown>) {
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(SCHEDULED_PATH, JSON.stringify(data, null, 2));
}

function tweetNeedsRegen(
  tweetText: string,
  words: { hangul: string; romanization?: string; english?: string }[],
  bundle: NonNullable<ReturnType<typeof findBundle>>,
): boolean {
  if (/what.?s the word/i.test(tweetText)) return true;
  // Without known image words we cannot safely judge or rewrite Hangul.
  if (!words.length) return false;
  if (!tweetHangulMatchesImageWords(tweetText, words).ok) return true;
  if (bundle.format === "antonym_split" && !antonymTweetUsesTopicPair(tweetText, words)) {
    return true;
  }
  return false;
}

async function syncMongoTweet(input: {
  bundleId: string;
  tweetText: string;
  replyText?: string;
  caption: { line1: string; line2: string };
}) {
  const db = await getMongoDb();
  const now = new Date().toISOString();
  const reviewSet: Record<string, unknown> = {
    tweetText: input.tweetText,
    captionLine1: input.caption.line1,
    captionLine2: input.caption.line2,
    updatedAt: now,
  };
  if (input.replyText) reviewSet.replyText = input.replyText;

  await db.collection("vocab_x_review").updateOne(
    { bundleId: input.bundleId },
    {
      $set: reviewSet,
      ...(input.replyText ? {} : { $unset: { replyText: "" } }),
    },
  );

  await db.collection("grammar_x_post_queue").updateMany(
    {
      note: `vocab-infographic:${input.bundleId}`,
      status: { $in: ["queued", "posting"] },
    },
    {
      $set: {
        tweetText: input.tweetText,
        updatedAt: now,
        ...(input.replyText ? { replyText: input.replyText } : {}),
      },
      ...(input.replyText ? {} : { $unset: { replyText: "" } }),
    },
  );
}

async function updateReviewTweet(
  item: VocabXReviewItem,
): Promise<
  | { ok: true; style: string; tweetText: string; words: number }
  | { ok: false; error: string }
> {
  const bundle = findBundle(item.bundleId);
  if (!bundle) return { ok: false, error: "unknown bundle" };

  const imagePayload = await imageWordsFor(item.bundleId, item.imageUrl);
  const { tweetText, caption, replyText, style } = await buildVocabXPostText(bundle, {
    imageWords: imagePayload.words,
  });
  await syncMongoTweet({
    bundleId: item.bundleId,
    tweetText,
    replyText,
    caption,
  });

  const scheduled = loadScheduled();
  if (scheduled[item.bundleId]) {
    scheduled[item.bundleId] = {
      ...scheduled[item.bundleId],
      tweetText,
      replyText,
      caption,
      imageWords: imagePayload.words,
      imageWordsSource: imagePayload.source,
      regeneratedAt: new Date().toISOString(),
    };
    saveScheduled(scheduled);
  }

  return { ok: true, style, tweetText, words: imagePayload.words.length };
}

async function updateScheduledTweets(opts: {
  limit: number;
  formatFilter?: string;
  mismatchedOnly: boolean;
  syncMongo: boolean;
}) {
  const scheduled = loadScheduled();
  const ids = Object.keys(scheduled).sort();
  const results: Array<Record<string, unknown>> = [];
  let processed = 0;

  for (const bundleId of ids) {
    if (processed >= opts.limit) break;
    const bundle = findBundle(bundleId);
    if (!bundle) {
      results.push({ bundleId, ok: false, error: "unknown bundle" });
      continue;
    }
    if (opts.formatFilter && bundle.format !== opts.formatFilter) continue;

    const entry = scheduled[bundleId]!;
    const oldTweet = String(entry.tweetText ?? "");
    let imageUrl: string | undefined;
    if (typeof entry.imageUrl === "string") imageUrl = entry.imageUrl;

    try {
      const imagePayload = await imageWordsFor(bundleId, imageUrl);
      if (opts.mismatchedOnly && !tweetNeedsRegen(oldTweet, imagePayload.words, bundle)) {
        results.push({ bundleId, ok: true, skipped: true, reason: "already-ok" });
        if (results.length % 25 === 0) {
          console.log(`… scanned ${results.length} (skipped ok so far)`);
        }
        continue;
      }

      processed += 1;
      const { tweetText, caption, replyText, style } = await buildVocabXPostText(bundle, {
        imageWords: imagePayload.words,
      });

      scheduled[bundleId] = {
        ...entry,
        tweetText,
        replyText,
        caption,
        imageWords: imagePayload.words,
        imageWordsSource: imagePayload.source,
        regeneratedAt: new Date().toISOString(),
      };
      // Persist after each item so a long run can resume safely.
      saveScheduled(scheduled);

      if (opts.syncMongo) {
        await syncMongoTweet({ bundleId, tweetText, replyText, caption });
      }

      results.push({
        bundleId,
        ok: true,
        style,
        chars: tweetText.length,
        words: imagePayload.words.length,
        hangul: imagePayload.words.map((w) => w.hangul).join("|"),
      });
      console.log(
        `✓ ${bundleId} [${style}] words=${imagePayload.words.map((w) => w.hangul).join("|") || "(none)"}`,
      );
    } catch (e) {
      results.push({
        bundleId,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
      console.log(`✗ ${bundleId}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return results;
}

async function updateQueuedVocabTweets(limit: number) {
  const db = await getMongoDb();
  const queued = await db
    .collection("grammar_x_post_queue")
    .find({
      status: "queued",
      note: { $regex: /^vocab-infographic:/ },
    })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();

  const results: Array<Record<string, unknown>> = [];
  for (const row of queued) {
    const note = String(row.note ?? "");
    const bundleId = note.replace(/^vocab-infographic:/, "").trim();
    const bundle = findBundle(bundleId);
    if (!bundle) {
      results.push({ id: row.id, bundleId, ok: false, error: "unknown bundle" });
      continue;
    }
    try {
      const imageUrl =
        typeof row.imageUrl === "string" ? row.imageUrl : undefined;
      const imagePayload = await imageWordsFor(bundleId, imageUrl);
      const { tweetText, replyText, style, caption } = await buildVocabXPostText(bundle, {
        imageWords: imagePayload.words,
      });
      await syncMongoTweet({ bundleId, tweetText, replyText, caption });

      const scheduled = loadScheduled();
      if (scheduled[bundleId]) {
        scheduled[bundleId] = {
          ...scheduled[bundleId],
          tweetText,
          replyText,
          caption,
          imageWords: imagePayload.words,
          imageWordsSource: imagePayload.source,
          regeneratedAt: new Date().toISOString(),
        };
        saveScheduled(scheduled);
      }

      results.push({
        id: row.id,
        bundleId,
        ok: true,
        style,
        chars: tweetText.length,
        words: imagePayload.words.length,
      });
    } catch (e) {
      results.push({
        id: row.id,
        bundleId,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
  return results;
}

async function main() {
  await loadEnv();
  const includeQueued = argFlag("--queued");
  const doScheduled = argFlag("--scheduled");
  const mismatchedOnly = argFlag("--mismatched-only");
  const skipMongo = argFlag("--no-mongo");
  const formatFilter = argValue("--format");
  const limit = Math.max(1, Number(argValue("--limit") ?? "500") || 500);

  if (doScheduled) {
    console.log(
      `Regenerating scheduled tweets (limit ${limit}${formatFilter ? `, format=${formatFilter}` : ""}${mismatchedOnly ? ", mismatched-only" : ""})…`,
    );
    const scheduledResults = await updateScheduledTweets({
      limit,
      formatFilter,
      mismatchedOnly,
      syncMongo: !skipMongo,
    });
    const okN = scheduledResults.filter((r) => r.ok && !r.skipped).length;
    const skipped = scheduledResults.filter((r) => r.skipped).length;
    const failN = scheduledResults.filter((r) => !r.ok).length;
    console.log(
      JSON.stringify(
        {
          ok: true,
          mode: "scheduled",
          updated: okN,
          skipped,
          failed: failN,
          samples: scheduledResults
            .filter((r) => r.ok && !r.skipped)
            .slice(0, 5)
            .map((r) => ({
              bundleId: r.bundleId,
              style: r.style,
              hangul: r.hangul,
            })),
        },
        null,
        2,
      ),
    );
    return;
  }

  const pending = (await listVocabXReview("pending")).slice(0, limit);
  const reviewResults: Array<Record<string, unknown>> = [];

  console.log(`Regenerating ${pending.length} pending review tweets…`);
  for (const item of pending) {
    try {
      const r = await updateReviewTweet(item);
      reviewResults.push({ bundleId: item.bundleId, ...r });
      if (r.ok) {
        console.log(
          `✓ ${item.bundleId} [${r.style}] ${r.tweetText.length}c words=${r.words}`,
        );
      } else {
        console.log(`✗ ${item.bundleId}: ${r.error}`);
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      reviewResults.push({ bundleId: item.bundleId, ok: false, error });
      console.log(`✗ ${item.bundleId}: ${error}`);
    }
  }

  let queueResults: Array<Record<string, unknown>> = [];
  if (includeQueued) {
    console.log(`Regenerating queued vocab posts (limit ${limit})…`);
    queueResults = await updateQueuedVocabTweets(limit);
    for (const r of queueResults) {
      console.log(
        r.ok
          ? `✓ queue ${r.bundleId} [${r.style}] ${r.chars}c`
          : `✗ queue ${r.bundleId}: ${r.error}`,
      );
    }
  }

  const okN = reviewResults.filter((r) => r.ok).length;
  const queueOk = queueResults.filter((r) => r.ok).length;
  console.log(
    JSON.stringify(
      {
        ok: true,
        pendingUpdated: okN,
        pendingFailed: reviewResults.length - okN,
        queuedUpdated: queueOk,
        queuedFailed: queueResults.length - queueOk,
        samples: reviewResults
          .filter((r) => r.ok)
          .slice(0, 3)
          .map((r) => ({
            bundleId: r.bundleId,
            style: r.style,
            tweetText: String(r.tweetText ?? "").slice(0, 160),
          })),
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
