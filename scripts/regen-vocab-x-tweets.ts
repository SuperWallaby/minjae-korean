/**
 * Regenerate X tweet copy for vocab review (and optional queued) items
 * using the new snackable caption styles.
 *
 *   npx tsx scripts/regen-vocab-x-tweets.ts
 *   npx tsx scripts/regen-vocab-x-tweets.ts --queued
 *   npx tsx scripts/regen-vocab-x-tweets.ts --limit 20
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { buildVocabXPostText } from "../src/lib/vocabXCaption.ts";
import { getMongoDb } from "../src/lib/mongo.ts";
import {
  listVocabXReview,
  type VocabXReviewItem,
} from "../src/lib/vocabXReviewRepo.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

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

async function updateReviewTweet(
  item: VocabXReviewItem,
): Promise<{ ok: true; style: string; tweetText: string } | { ok: false; error: string }> {
  const bundle = findBundle(item.bundleId);
  if (!bundle) return { ok: false, error: "unknown bundle" };

  const { tweetText, caption, replyText, style } = await buildVocabXPostText(bundle);
  const db = await getMongoDb();
  const now = new Date().toISOString();
  await db.collection("vocab_x_review").updateOne(
    { bundleId: item.bundleId },
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

  // Keep local scheduled.json in sync when present.
  const scheduled = loadScheduled();
  if (scheduled[item.bundleId]) {
    scheduled[item.bundleId] = {
      ...scheduled[item.bundleId],
      tweetText,
      replyText,
      caption,
      regeneratedAt: now,
    };
    saveScheduled(scheduled);
  }

  return { ok: true, style, tweetText };
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
      const { tweetText, replyText, style } = await buildVocabXPostText(bundle);
      await db.collection("grammar_x_post_queue").updateOne(
        { id: row.id },
        {
          $set: {
            tweetText,
            ...(replyText ? { replyText } : {}),
            updatedAt: new Date().toISOString(),
          },
          ...(replyText ? {} : { $unset: { replyText: "" } }),
        },
      );
      // Mirror onto approved review docs if present.
      await db.collection("vocab_x_review").updateOne(
        { bundleId },
        {
          $set: {
            tweetText,
            replyText: replyText ?? null,
            updatedAt: new Date().toISOString(),
          },
        },
      );
      results.push({ id: row.id, bundleId, ok: true, style, chars: tweetText.length });
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
  const limit = Math.max(1, Number(argValue("--limit") ?? "500") || 500);

  const pending = (await listVocabXReview("pending")).slice(0, limit);
  const reviewResults: Array<Record<string, unknown>> = [];

  console.log(`Regenerating ${pending.length} pending review tweets…`);
  for (const item of pending) {
    try {
      const r = await updateReviewTweet(item);
      reviewResults.push({ bundleId: item.bundleId, ...r });
      if (r.ok) {
        console.log(`✓ ${item.bundleId} [${r.style}] ${r.tweetText.length}c`);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
