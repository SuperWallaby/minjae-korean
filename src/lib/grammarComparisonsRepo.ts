import type { Collection } from "mongodb";

import {
  COMPARISON_THREE_WAY_SLUG_REGEX,
  comparisonWordCountFromSlug,
} from "@/lib/grammarComparisonSlug";
import { getMongoDb } from "@/lib/mongo";

export type ComparisonItem = {
  wordName: string;
  meaningKo: string;
  meaningEn: string;
  ruleKo: string;
  ruleEn: string;
  situationsKo: string[];
  situationsEn: string[];
};

export type ComparisonExample = {
  sentence: string;
  isCorrect: boolean;
  reasonKo: string;
  reasonEn: string;
  /** Natural English translation of sentence (X posts prefer this over reasonEn). */
  translationEn?: string;
};

export type ComparisonQuiz = {
  questionKo: string;
  questionEn: string;
  options: string[];
  answer: string;
  explanationKo: string;
  explanationEn: string;
};

export type Comparison = {
  id: number;
  slug: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  imageUrl?: string;
  imageAlt?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  items: ComparisonItem[];
  examples: ComparisonExample[];
  quizzes: ComparisonQuiz[];
};

export type ComparisonCard = Omit<Comparison, "items" | "examples" | "quizzes"> & {
  itemCount: number;
};

export type GeneratedComparisonPayload = {
  slug: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  items: ComparisonItem[];
  examples: ComparisonExample[];
  quizzes: ComparisonQuiz[];
  capybaraQuestionEn: string;
  imageAlt: string;
};

type ComparisonDoc = {
  _id: number;
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

type ComparisonItemDoc = ComparisonItem & {
  _id?: unknown;
  comparisonId: number;
  sortOrder: number;
};

type ComparisonExampleDoc = ComparisonExample & {
  _id?: unknown;
  comparisonId: number;
  sortOrder: number;
};

type ComparisonQuizDoc = ComparisonQuiz & {
  _id?: unknown;
  comparisonId: number;
  sortOrder: number;
};

type CounterDoc = { _id: string; seq: number };

type Collections = {
  comparisons: Collection<ComparisonDoc>;
  items: Collection<ComparisonItemDoc>;
  examples: Collection<ComparisonExampleDoc>;
  quizzes: Collection<ComparisonQuizDoc>;
  counters: Collection<CounterDoc>;
};

const COUNTER_KEY = "comparison_id";
const INITIAL_ID = 1000;

let indexesPromise: Promise<void> | null = null;

function nowIso() {
  return new Date().toISOString();
}

function normalizeStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => String(x ?? "").trim())
    .filter(Boolean);
}

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const comparisons = db.collection<ComparisonDoc>("comparisons");
  const items = db.collection<ComparisonItemDoc>("comparison_items");
  const examples = db.collection<ComparisonExampleDoc>("comparison_examples");
  const quizzes = db.collection<ComparisonQuizDoc>("comparison_quizzes");
  const counters = db.collection<CounterDoc>("counters");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await comparisons.createIndex({ id: 1 }, { unique: true });
        await comparisons.createIndex({ slug: 1 }, { unique: true });
        await comparisons.createIndex({ viewCount: -1, createdAt: -1 });
        await items.createIndex({ comparisonId: 1, sortOrder: 1 });
        await examples.createIndex({ comparisonId: 1, sortOrder: 1 });
        await quizzes.createIndex({ comparisonId: 1, sortOrder: 1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { comparisons, items, examples, quizzes, counters };
}

async function nextComparisonId(
  counters: Collection<CounterDoc>,
): Promise<number> {
  const doc = await counters.findOneAndUpdate(
    { _id: COUNTER_KEY },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = doc?.seq ?? INITIAL_ID;
  if (seq < INITIAL_ID) {
    await counters.updateOne(
      { _id: COUNTER_KEY },
      { $set: { seq: INITIAL_ID } },
      { upsert: true },
    );
    return INITIAL_ID;
  }
  return seq;
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
    itemCount: doc.itemCount ?? comparisonWordCountFromSlug(doc.slug),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function comparisonListFilter(ways?: 2 | 3): Record<string, unknown> | undefined {
  if (ways === 3) {
    return {
      $or: [
        { itemCount: { $gte: 3 } },
        { itemCount: { $exists: false }, slug: COMPARISON_THREE_WAY_SLUG_REGEX },
      ],
    };
  }
  if (ways === 2) {
    return {
      $or: [
        { itemCount: 2 },
        {
          itemCount: { $exists: false },
          slug: { $not: COMPARISON_THREE_WAY_SLUG_REGEX },
        },
      ],
    };
  }
  return undefined;
}

export async function getComparisonById(
  id: number,
): Promise<Comparison | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const { comparisons, items, examples, quizzes } = await cols();
  const doc = await comparisons.findOne({ id });
  if (!doc) return null;

  const [itemDocs, exampleDocs, quizDocs] = await Promise.all([
    items.find({ comparisonId: id }).sort({ sortOrder: 1 }).toArray(),
    examples.find({ comparisonId: id }).sort({ sortOrder: 1 }).toArray(),
    quizzes.find({ comparisonId: id }).sort({ sortOrder: 1 }).toArray(),
  ]);

  return {
    ...docToCard(doc),
    items: itemDocs.map(({ wordName, meaningKo, meaningEn, ruleKo, ruleEn, situationsKo, situationsEn }) => ({
      wordName,
      meaningKo,
      meaningEn,
      ruleKo,
      ruleEn,
      situationsKo: normalizeStrings(situationsKo),
      situationsEn: normalizeStrings(situationsEn),
    })),
    examples: exampleDocs.map(({ sentence, isCorrect, reasonKo, reasonEn, translationEn }) => ({
      sentence,
      isCorrect: Boolean(isCorrect),
      reasonKo,
      reasonEn,
      translationEn,
    })),
    quizzes: quizDocs.map(
      ({
        questionKo,
        questionEn,
        options,
        answer,
        explanationKo,
        explanationEn,
      }) => ({
        questionKo,
        questionEn,
        options: normalizeStrings(options),
        answer: String(answer ?? "").trim(),
        explanationKo,
        explanationEn,
      }),
    ),
  };
}

export async function getComparisonBySlug(
  slug: string,
): Promise<Comparison | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const { comparisons } = await cols();
  const doc = await comparisons.findOne({ slug: trimmed });
  if (!doc) return null;
  return getComparisonById(doc.id);
}

export async function listTopComparisonsForStaticParams(
  limit = 200,
): Promise<ComparisonCard[]> {
  const { comparisons } = await cols();
  const docs = await comparisons
    .find({})
    .sort({ id: -1 })
    .limit(Math.max(1, limit))
    .toArray();
  return docs.map(docToCard);
}

export async function listComparisons(
  opts?: { page?: number; pageSize?: number; ways?: 2 | 3 },
): Promise<{ items: ComparisonCard[]; total: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 24));
  const skip = (page - 1) * pageSize;
  const filter = comparisonListFilter(opts?.ways) ?? {};
  const { comparisons } = await cols();
  const [docs, total] = await Promise.all([
    comparisons
      .find(filter)
      .sort({ id: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    comparisons.countDocuments(filter),
  ]);
  return { items: docs.map(docToCard), total };
}

/** Comparisons before/after `currentId` (sorted by id) for prev/next exploration. */
export async function listRelatedComparisons(
  currentId: number,
  limit = 8,
): Promise<ComparisonCard[]> {
  const cap = Math.max(1, Math.min(limit, 12));
  const { comparisons } = await cols();

  const beforeCount = Math.floor(cap / 2);
  const afterCount = cap - beforeCount;

  const fetchBefore = (n: number) =>
    comparisons
      .find({ id: { $lt: currentId } })
      .sort({ id: -1 })
      .limit(n)
      .toArray();

  const fetchAfter = (n: number) =>
    comparisons
      .find({ id: { $gt: currentId } })
      .sort({ id: 1 })
      .limit(n)
      .toArray();

  let beforeDocs = await fetchBefore(beforeCount);
  let afterDocs = await fetchAfter(afterCount);

  if (beforeDocs.length < beforeCount) {
    afterDocs = await fetchAfter(afterCount + (beforeCount - beforeDocs.length));
  } else if (afterDocs.length < afterCount) {
    beforeDocs = await fetchBefore(beforeCount + (afterCount - afterDocs.length));
  }

  return [...beforeDocs.reverse(), ...afterDocs].slice(0, cap).map(docToCard);
}

export async function upsertComparisonFromGenerated(
  payload: GeneratedComparisonPayload,
): Promise<{ id: number; slug: string; created: boolean }> {
  const slug = payload.slug.trim();
  if (!slug) throw new Error("slug is required");

  const { comparisons, items, examples, quizzes, counters } = await cols();
  const existing = await comparisons.findOne({ slug });
  const now = nowIso();
  const id = existing?.id ?? (await nextComparisonId(counters));
  const created = !existing;

  const itemCount = payload.items.length;
  const master: ComparisonDoc = {
    _id: id,
    id,
    slug,
    titleKo: payload.titleKo.trim(),
    titleEn: payload.titleEn.trim(),
    summaryKo: payload.summaryKo.trim(),
    summaryEn: payload.summaryEn.trim(),
    imageAlt: payload.imageAlt.trim(),
    viewCount: existing?.viewCount ?? 0,
    itemCount,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await comparisons.updateOne({ id }, { $set: master }, { upsert: true });

  await Promise.all([
    items.deleteMany({ comparisonId: id }),
    examples.deleteMany({ comparisonId: id }),
    quizzes.deleteMany({ comparisonId: id }),
  ]);

  if (payload.items.length > 0) {
    await items.insertMany(
      payload.items.map((item, sortOrder) => ({
        comparisonId: id,
        sortOrder,
        wordName: item.wordName.trim(),
        meaningKo: item.meaningKo.trim(),
        meaningEn: item.meaningEn.trim(),
        ruleKo: item.ruleKo.trim(),
        ruleEn: item.ruleEn.trim(),
        situationsKo: normalizeStrings(item.situationsKo),
        situationsEn: normalizeStrings(item.situationsEn),
      })),
    );
  }

  if (payload.examples.length > 0) {
    await examples.insertMany(
      payload.examples.map((ex, sortOrder) => ({
        comparisonId: id,
        sortOrder,
        sentence: ex.sentence.trim(),
        translationEn: ex.translationEn?.trim() || undefined,
        isCorrect: Boolean(ex.isCorrect),
        reasonKo: ex.reasonKo.trim(),
        reasonEn: ex.reasonEn.trim(),
      })),
    );
  }

  if (payload.quizzes.length > 0) {
    await quizzes.insertMany(
      payload.quizzes.map((quiz, sortOrder) => ({
        comparisonId: id,
        sortOrder,
        questionKo: quiz.questionKo.trim(),
        questionEn: quiz.questionEn.trim(),
        options: normalizeStrings(quiz.options),
        answer: quiz.answer.trim(),
        explanationKo: quiz.explanationKo.trim(),
        explanationEn: quiz.explanationEn.trim(),
      })),
    );
  }

  return { id, slug, created };
}

export async function updateComparisonImage(
  id: number,
  imageUrl: string,
  imageAlt: string,
): Promise<void> {
  const { comparisons } = await cols();
  await comparisons.updateOne(
    { id },
    { $set: { imageUrl: imageUrl.trim(), imageAlt: imageAlt.trim(), updatedAt: nowIso() } },
  );
}

/** All comparison ids sorted ascending (for batch image refresh). */
export async function listAllComparisonIds(): Promise<number[]> {
  const { comparisons } = await cols();
  const docs = await comparisons
    .find({}, { projection: { id: 1 } })
    .sort({ id: 1 })
    .toArray();
  return docs.map((doc) => doc.id).filter((id) => Number.isFinite(id) && id > 0);
}

export async function incrementViewCount(id: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) return;
  const { comparisons } = await cols();
  await comparisons.updateOne({ id }, { $inc: { viewCount: 1 } });
}

/** Delete comparison and all child rows (items, examples, quizzes). */
export async function deleteComparisonById(id: number): Promise<boolean> {
  if (!Number.isFinite(id) || id <= 0) return false;
  const { comparisons, items, examples, quizzes } = await cols();
  const doc = await comparisons.findOne({ id });
  if (!doc) return false;
  await Promise.all([
    comparisons.deleteOne({ id }),
    items.deleteMany({ comparisonId: id }),
    examples.deleteMany({ comparisonId: id }),
    quizzes.deleteMany({ comparisonId: id }),
  ]);
  return true;
}

export async function listAllComparisonSlugs(): Promise<
  Array<{ id: number; slug: string; titleKo: string; titleEn: string }>
> {
  const { comparisons } = await cols();
  const docs = await comparisons
    .find({}, { projection: { id: 1, slug: 1, titleKo: 1, titleEn: 1 } })
    .sort({ id: 1 })
    .toArray();
  return docs.map((doc) => ({
    id: doc.id,
    slug: doc.slug,
    titleKo: doc.titleKo,
    titleEn: doc.titleEn,
  }));
}
