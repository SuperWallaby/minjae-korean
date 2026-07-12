import { enqueueGrammarXManual } from "@/lib/grammarXQueueRepo";
import {
  getVocabXReviewByBundleId,
  markVocabXApproved,
  markVocabXRejected,
  reopenVocabXPending,
  type VocabXReviewItem,
} from "@/lib/vocabXReviewRepo";

export async function approveVocabXReview(
  bundleId: string,
): Promise<{ item: VocabXReviewItem; queueId: string }> {
  const pending = await getVocabXReviewByBundleId(bundleId);
  if (!pending) throw new Error(`Review item not found: ${bundleId}`);
  if (pending.status !== "pending") {
    throw new Error(`Not pending (status=${pending.status}): ${bundleId}`);
  }

  const queueItem = await enqueueGrammarXManual({
    tweetText: pending.tweetText,
    imageUrl: pending.imageUrl,
    imageAlt: pending.imageAlt,
    replyText: pending.replyText,
    note: `vocab-infographic:${pending.bundleId}`,
  });

  const item = await markVocabXApproved(bundleId, queueItem.id);
  if (!item) throw new Error(`Failed to mark approved: ${bundleId}`);
  return { item, queueId: queueItem.id };
}

export async function rejectVocabXReview(bundleId: string): Promise<VocabXReviewItem> {
  const item = await markVocabXRejected(bundleId);
  if (!item) throw new Error(`Review item not found or not rejectable: ${bundleId}`);
  return item;
}

export async function reopenVocabXReview(bundleId: string): Promise<VocabXReviewItem> {
  const item = await reopenVocabXPending(bundleId);
  if (!item) throw new Error(`Review item not found: ${bundleId}`);
  return item;
}
