/**
 * Pull auto-queued vocab-infographic X posts back into review (pending).
 * Cancels Mongo queue items and upserts vocab_x_review docs.
 *
 *   npx tsx scripts/pull-vocab-x-to-review.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { cancelQueuedVocabInfographicPosts } from "../src/lib/grammarXQueueRepo";
import { upsertVocabXPending } from "../src/lib/vocabXReviewRepo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");

async function loadEnv() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);
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

function findBundle(bundleId: string) {
  return ALL_VOCAB_BUNDLES.find((b) => b.id === bundleId);
}

async function main() {
  await loadEnv();

  const pulled = await cancelQueuedVocabInfographicPosts();
  const scheduled = loadScheduled();
  const results: Array<Record<string, unknown>> = [];

  for (const row of pulled) {
    const bundle = findBundle(row.bundleId);
    const item = await upsertVocabXPending({
      bundleId: row.bundleId,
      title: bundle?.title ?? row.bundleId,
      format: bundle?.format ?? "unknown",
      priority: bundle?.priority ?? "medium",
      imageUrl: row.imageUrl,
      imageAlt: row.imageAlt,
      tweetText: row.tweetText,
      replyText: row.replyText,
      forcePending: true,
    });
    scheduled[row.bundleId] = {
      ...(scheduled[row.bundleId] ?? {}),
      reviewId: item.id,
      reviewStatus: "pending",
      imageUrl: row.imageUrl,
      tweetText: row.tweetText,
      replyText: row.replyText,
      pulledFromQueueId: row.id,
      registeredAt: new Date().toISOString(),
    };
    delete (scheduled[row.bundleId] as { queueId?: string }).queueId;
    results.push({ bundleId: row.bundleId, reviewId: item.id, fromQueueId: row.id });
  }

  // Also convert local scheduled.json entries that still look like auto-queued
  // but may already have been cancelled / posted — only if we have imageUrl+tweetText
  // and no pending review yet from the pull above.
  for (const [bundleId, entry] of Object.entries(scheduled)) {
    if (results.some((r) => r.bundleId === bundleId)) continue;
    if (entry.reviewStatus === "pending" || entry.reviewStatus === "approved") continue;
    const imageUrl = typeof entry.imageUrl === "string" ? entry.imageUrl : "";
    const tweetText = typeof entry.tweetText === "string" ? entry.tweetText : "";
    if (!imageUrl || !tweetText) continue;

    const bundle = findBundle(bundleId);
    const item = await upsertVocabXPending({
      bundleId,
      title: bundle?.title ?? bundleId,
      format: bundle?.format ?? "unknown",
      priority: bundle?.priority ?? "medium",
      imageUrl,
      imageAlt:
        typeof entry.imageAlt === "string"
          ? entry.imageAlt
          : `${bundle?.title ?? bundleId} — Korean vocabulary`,
      tweetText,
      replyText: typeof entry.replyText === "string" ? entry.replyText : undefined,
      captionLine1:
        entry.caption && typeof entry.caption === "object" && entry.caption !== null
          ? String((entry.caption as { line1?: string }).line1 ?? "")
          : undefined,
      captionLine2:
        entry.caption && typeof entry.caption === "object" && entry.caption !== null
          ? String((entry.caption as { line2?: string }).line2 ?? "")
          : undefined,
      forcePending: true,
    });
    scheduled[bundleId] = {
      ...entry,
      reviewId: item.id,
      reviewStatus: "pending",
      registeredAt: new Date().toISOString(),
    };
    delete (scheduled[bundleId] as { queueId?: string }).queueId;
    results.push({ bundleId, reviewId: item.id, from: "scheduled.json" });
  }

  saveScheduled(scheduled);
  console.log(
    JSON.stringify(
      { ok: true, pulledFromQueue: pulled.length, registered: results.length, results },
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
