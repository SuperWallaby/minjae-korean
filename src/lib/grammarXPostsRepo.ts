import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

import type {
  ComparisonCard,
  ComparisonExample,
  ComparisonItem,
} from "@/lib/grammarComparisonsRepo";

type GrammarXPostDoc = {
  comparisonId: number;
  tweetId: string;
  tweetUrl: string;
  postedAt: string;
};

type ComparisonDoc = {
  id: number;
  slug: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  imageUrl?: string;
  imageAlt?: string;
  viewCount: number;
  itemCount?: number;
  createdAt: string;
  updatedAt: string;
};

export type ComparisonForXPost = ComparisonCard & {
  items: Pick<ComparisonItem, "wordName">[];
  examples: ComparisonExample[];
};

let indexesPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

async function xPostsCol(): Promise<Collection<GrammarXPostDoc>> {
  const db = await getMongoDb();
  const col = db.collection<GrammarXPostDoc>("grammar_x_posts");
  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await col.createIndex({ comparisonId: 1 }, { unique: true });
        await col.createIndex({ postedAt: -1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;
  return col;
}

function docToCard(doc: ComparisonDoc): ComparisonCard {
  return {
    id: doc.id,
    slug: doc.slug,
    titleKo: doc.titleKo,
    titleEn: doc.titleEn,
    summaryKo: doc.summaryKo,
    summaryEn: doc.summaryEn,
    imageUrl: doc.imageUrl,
    imageAlt: doc.imageAlt,
    viewCount: doc.viewCount ?? 0,
    itemCount: doc.itemCount ?? doc.slug.split("-vs-").length,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/** Comparisons with image + alt, not yet posted to X (oldest id first). */
export async function listComparisonsPendingXPost(
  limit = 1,
): Promise<ComparisonForXPost[]> {
  const db = await getMongoDb();
  const comparisons = db.collection<ComparisonDoc>("comparisons");
  const items = db.collection<{ comparisonId: number; wordName: string; sortOrder: number }>(
    "comparison_items",
  );
  const examples = db.collection<
    ComparisonExample & { comparisonId: number; sortOrder: number }
  >("comparison_examples");
  const xPosts = await xPostsCol();
  const postedIds = await xPosts.distinct("comparisonId");

  const readyImage = { $exists: true, $type: "string" as const, $ne: "" };

  const docs = await comparisons
    .find({
      id: { $nin: postedIds },
      imageUrl: readyImage,
      imageAlt: readyImage,
    })
    .sort({ id: 1 })
    .limit(Math.max(1, limit))
    .toArray();

  const out: ComparisonForXPost[] = [];
  for (const doc of docs) {
    const itemDocs = await items
      .find({ comparisonId: doc.id })
      .sort({ sortOrder: 1 })
      .project({ wordName: 1 })
      .toArray();
    const exampleDocs = await examples
      .find({ comparisonId: doc.id })
      .sort({ sortOrder: 1 })
      .project({ sentence: 1, isCorrect: 1, reasonKo: 1, reasonEn: 1, translationEn: 1 })
      .toArray();
    out.push({
      ...docToCard(doc),
      items: itemDocs.map((row) => ({ wordName: row.wordName })),
      examples: exampleDocs.map((row) => ({
        sentence: row.sentence,
        isCorrect: row.isCorrect,
        reasonKo: row.reasonKo,
        reasonEn: row.reasonEn,
        translationEn: row.translationEn,
      })),
    });
  }
  return out;
}

export async function countComparisonsPendingXPost(): Promise<number> {
  const db = await getMongoDb();
  const comparisons = db.collection<ComparisonDoc>("comparisons");
  const xPosts = await xPostsCol();
  const postedIds = await xPosts.distinct("comparisonId");
  const readyImage = { $exists: true, $type: "string" as const, $ne: "" };
  return comparisons.countDocuments({
    id: { $nin: postedIds },
    imageUrl: readyImage,
    imageAlt: readyImage,
  });
}

export async function getComparisonForXPost(
  comparisonId: number,
): Promise<ComparisonForXPost | null> {
  const db = await getMongoDb();
  const comparisons = db.collection<ComparisonDoc>("comparisons");
  const items = db.collection<{ comparisonId: number; wordName: string; sortOrder: number }>(
    "comparison_items",
  );
  const examples = db.collection<
    ComparisonExample & { comparisonId: number; sortOrder: number }
  >("comparison_examples");

  const readyImage = { $exists: true, $type: "string" as const, $ne: "" };
  const doc = await comparisons.findOne({
    id: comparisonId,
    imageUrl: readyImage,
    imageAlt: readyImage,
  });
  if (!doc) return null;

  const itemDocs = await items
    .find({ comparisonId: doc.id })
    .sort({ sortOrder: 1 })
    .project({ wordName: 1 })
    .toArray();
  const exampleDocs = await examples
    .find({ comparisonId: doc.id })
    .sort({ sortOrder: 1 })
    .project({ sentence: 1, isCorrect: 1, reasonKo: 1, reasonEn: 1, translationEn: 1 })
    .toArray();

  return {
    ...docToCard(doc),
    items: itemDocs.map((row) => ({ wordName: row.wordName })),
    examples: exampleDocs.map((row) => ({
      sentence: row.sentence,
      isCorrect: row.isCorrect,
      reasonKo: row.reasonKo,
      reasonEn: row.reasonEn,
      translationEn: row.translationEn,
    })),
  };
}

export async function clearGrammarXPost(comparisonId: number): Promise<void> {
  const col = await xPostsCol();
  await col.deleteOne({ comparisonId });
}

export async function recordGrammarXPost(input: {
  comparisonId: number;
  tweetId: string;
  tweetUrl: string;
}): Promise<void> {
  const col = await xPostsCol();
  await col.updateOne(
    { comparisonId: input.comparisonId },
    {
      $set: {
        comparisonId: input.comparisonId,
        tweetId: input.tweetId,
        tweetUrl: input.tweetUrl,
        postedAt: nowIso(),
      },
    },
    { upsert: true },
  );
}
