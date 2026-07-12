import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type VocabXReviewStatus = "pending" | "approved" | "rejected";

export type VocabXReviewItem = {
  id: string;
  bundleId: string;
  status: VocabXReviewStatus;
  title: string;
  format: string;
  priority: string;
  imageUrl: string;
  imageAlt: string;
  tweetText: string;
  replyText?: string;
  captionLine1?: string;
  captionLine2?: string;
  queueId?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
};

let indexesPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

async function col(): Promise<Collection<VocabXReviewItem>> {
  const db = await getMongoDb();
  const collection = db.collection<VocabXReviewItem>("vocab_x_review");
  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await collection.createIndex({ bundleId: 1 }, { unique: true });
        await collection.createIndex({ status: 1, createdAt: -1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;
  return collection;
}

export async function upsertVocabXPending(
  input: Omit<VocabXReviewItem, "id" | "status" | "createdAt" | "updatedAt" | "reviewedAt" | "queueId"> & {
    id?: string;
    /** Re-open approved/rejected items back to pending (e.g. pull-back from queue). */
    forcePending?: boolean;
  },
): Promise<VocabXReviewItem> {
  const collection = await col();
  const existing = await collection.findOne({ bundleId: input.bundleId });
  const now = nowIso();

  if (existing) {
    if (existing.status !== "pending" && !input.forcePending) {
      return existing;
    }
    await collection.updateOne(
      { bundleId: input.bundleId },
      {
        $set: {
          status: "pending",
          title: input.title,
          format: input.format,
          priority: input.priority,
          imageUrl: input.imageUrl,
          imageAlt: input.imageAlt,
          tweetText: input.tweetText,
          replyText: input.replyText,
          captionLine1: input.captionLine1,
          captionLine2: input.captionLine2,
          updatedAt: now,
        },
        $unset: { reviewedAt: "", queueId: "" },
      },
    );
    return (await collection.findOne({ bundleId: input.bundleId }))!;
  }

  const item: VocabXReviewItem = {
    id: input.id ?? crypto.randomUUID(),
    bundleId: input.bundleId,
    status: "pending",
    title: input.title,
    format: input.format,
    priority: input.priority,
    imageUrl: input.imageUrl,
    imageAlt: input.imageAlt,
    tweetText: input.tweetText,
    replyText: input.replyText,
    captionLine1: input.captionLine1,
    captionLine2: input.captionLine2,
    createdAt: now,
    updatedAt: now,
  };
  await collection.insertOne(item);
  return item;
}

export async function listVocabXReview(status?: VocabXReviewStatus): Promise<VocabXReviewItem[]> {
  const collection = await col();
  const filter = status ? { status } : {};
  return collection.find(filter).sort({ createdAt: -1 }).limit(500).toArray();
}

export async function countVocabXReviewByStatus(): Promise<Record<VocabXReviewStatus, number>> {
  const collection = await col();
  const rows = await collection
    .aggregate<{ _id: VocabXReviewStatus; n: number }>([
      { $group: { _id: "$status", n: { $sum: 1 } } },
    ])
    .toArray();
  const out: Record<VocabXReviewStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  for (const row of rows) {
    if (row._id in out) out[row._id] = row.n;
  }
  return out;
}

export async function getVocabXReviewByBundleId(
  bundleId: string,
): Promise<VocabXReviewItem | null> {
  const collection = await col();
  return collection.findOne({ bundleId });
}

export async function markVocabXApproved(
  bundleId: string,
  queueId: string,
): Promise<VocabXReviewItem | null> {
  const collection = await col();
  const now = nowIso();
  await collection.updateOne(
    { bundleId, status: "pending" },
    {
      $set: {
        status: "approved",
        queueId,
        reviewedAt: now,
        updatedAt: now,
      },
    },
  );
  return collection.findOne({ bundleId });
}

export async function markVocabXRejected(
  bundleId: string,
): Promise<VocabXReviewItem | null> {
  const collection = await col();
  const now = nowIso();
  await collection.updateOne(
    { bundleId, status: { $in: ["pending", "approved"] } },
    {
      $set: {
        status: "rejected",
        reviewedAt: now,
        updatedAt: now,
      },
    },
  );
  return collection.findOne({ bundleId });
}

export async function reopenVocabXPending(
  bundleId: string,
): Promise<VocabXReviewItem | null> {
  const collection = await col();
  const now = nowIso();
  await collection.updateOne(
    { bundleId },
    {
      $set: {
        status: "pending",
        updatedAt: now,
      },
      $unset: { reviewedAt: "", queueId: "" },
    },
  );
  return collection.findOne({ bundleId });
}
