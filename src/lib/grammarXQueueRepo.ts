import { randomUUID } from "crypto";
import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type GrammarXQueueKind = "comparison" | "manual";
export type GrammarXQueueStatus = "queued" | "processing" | "posted" | "cancelled" | "failed";

export type GrammarXQueueItem = {
  id: string;
  kind: GrammarXQueueKind;
  status: GrammarXQueueStatus;
  priority: number;
  comparisonId?: number;
  tweetText?: string;
  imageUrl?: string;
  imageAlt?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  postedAt?: string;
  tweetId?: string;
  tweetUrl?: string;
  error?: string;
};

type GrammarXQueueDoc = GrammarXQueueItem;

let indexesPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

async function queueCol(): Promise<Collection<GrammarXQueueDoc>> {
  const db = await getMongoDb();
  const col = db.collection<GrammarXQueueDoc>("grammar_x_post_queue");
  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await col.createIndex({ status: 1, priority: 1, createdAt: 1 });
        await col.createIndex({ id: 1 }, { unique: true });
        await col.createIndex({ comparisonId: 1, status: 1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;
  return col;
}

export async function listGrammarXQueueItems(limit = 50): Promise<GrammarXQueueItem[]> {
  const col = await queueCol();
  return col
    .find({ status: "queued" })
    .sort({ priority: 1, createdAt: 1 })
    .limit(Math.max(1, limit))
    .toArray();
}

export async function listGrammarXQueueHistory(limit = 30): Promise<GrammarXQueueItem[]> {
  const col = await queueCol();
  return col
    .find({ status: { $in: ["posted", "failed", "cancelled"] } })
    .sort({ updatedAt: -1 })
    .limit(Math.max(1, limit))
    .toArray();
}

export async function getGrammarXQueueItem(id: string): Promise<GrammarXQueueItem | null> {
  const col = await queueCol();
  return col.findOne({ id });
}

export async function enqueueGrammarXComparison(input: {
  comparisonId: number;
  note?: string;
}): Promise<GrammarXQueueItem> {
  const col = await queueCol();
  const existing = await col.findOne({
    comparisonId: input.comparisonId,
    status: "queued",
  });
  if (existing) return existing;

  const now = nowIso();
  const item: GrammarXQueueItem = {
    id: randomUUID(),
    kind: "comparison",
    status: "queued",
    priority: Date.now(),
    comparisonId: input.comparisonId,
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(item);
  return item;
}

export async function enqueueGrammarXManual(input: {
  tweetText: string;
  imageUrl: string;
  imageAlt: string;
  note?: string;
}): Promise<GrammarXQueueItem> {
  const col = await queueCol();
  const now = nowIso();
  const item: GrammarXQueueItem = {
    id: randomUUID(),
    kind: "manual",
    status: "queued",
    priority: Date.now(),
    tweetText: input.tweetText.trim(),
    imageUrl: input.imageUrl.trim(),
    imageAlt: input.imageAlt.trim(),
    note: input.note?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  };
  await col.insertOne(item);
  return item;
}

export async function bumpGrammarXQueueItem(id: string): Promise<GrammarXQueueItem | null> {
  const col = await queueCol();
  const current = await col.findOne({ id, status: "queued" });
  if (!current) return null;
  const front = await col.findOne({ status: "queued" }, { sort: { priority: 1 } });
  const priority = (front?.priority ?? 0) - 1;
  await col.updateOne({ id }, { $set: { priority, updatedAt: nowIso() } });
  return col.findOne({ id });
}

export async function cancelGrammarXQueueItem(id: string): Promise<boolean> {
  const col = await queueCol();
  const result = await col.updateOne(
    { id, status: "queued" },
    { $set: { status: "cancelled", updatedAt: nowIso() } },
  );
  return result.modifiedCount === 1;
}

export async function claimNextGrammarXQueueItem(): Promise<GrammarXQueueItem | null> {
  const col = await queueCol();
  const doc = await col.findOneAndUpdate(
    { status: "queued" },
    { $set: { status: "processing", updatedAt: nowIso() } },
    { sort: { priority: 1, createdAt: 1 }, returnDocument: "after" },
  );
  return doc;
}

/** Revert claim when post fails before tweet goes out. */
export async function markGrammarXQueueFailed(id: string, error: string): Promise<void> {
  const col = await queueCol();
  await col.updateOne(
    { id },
    {
      $set: {
        status: "failed",
        error: error.slice(0, 500),
        updatedAt: nowIso(),
      },
    },
  );
}

export async function markGrammarXQueuePosted(input: {
  id: string;
  tweetId: string;
  tweetUrl: string;
}): Promise<void> {
  const col = await queueCol();
  await col.updateOne(
    { id: input.id, status: { $in: ["queued", "processing"] } },
    {
      $set: {
        status: "posted",
        tweetId: input.tweetId,
        tweetUrl: input.tweetUrl,
        postedAt: nowIso(),
        updatedAt: nowIso(),
        error: undefined,
      },
    },
  );
}

export async function countQueuedGrammarXItems(): Promise<number> {
  const col = await queueCol();
  return col.countDocuments({ status: "queued" });
}
