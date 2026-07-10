import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";
import {
  escapeRegex,
  guideRelatedKeys,
  rankByRelatedScore,
  scoreSlugMatch,
  scoreWordNameMatch,
} from "@/lib/grammarRelatedMatch";

export type GrammarGuideType = "meaning" | "usage" | "how-to-say";

export type GuideExample = {
  sentence: string;
  isCorrect: boolean;
  reasonKo: string;
  reasonEn: string;
  translationEn?: string;
};

export type GuideQuiz = {
  questionKo: string;
  questionEn: string;
  options: string[];
  answer: string;
  explanationKo: string;
  explanationEn: string;
};

export type GrammarGuide = {
  id: number;
  type: GrammarGuideType;
  slug: string;
  wordName: string;
  /** English phrase for how-to-say pages (batch / SEO primary key). */
  englishPhrase?: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  meaningKo: string;
  meaningEn: string;
  ruleKo: string;
  ruleEn: string;
  situationsKo: string[];
  situationsEn: string[];
  nuancesKo: string[];
  nuancesEn: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageAnswerEn?: string;
  pronunciationUrl?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  examples: GuideExample[];
  quizzes: GuideQuiz[];
};

export type GrammarGuideCard = Omit<GrammarGuide, "examples" | "quizzes">;

export type GeneratedGrammarGuidePayload = {
  type: GrammarGuideType;
  slug: string;
  wordName: string;
  englishPhrase?: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  meaningKo: string;
  meaningEn: string;
  ruleKo: string;
  ruleEn: string;
  situationsKo: string[];
  situationsEn: string[];
  nuancesKo: string[];
  nuancesEn: string[];
  examples: GuideExample[];
  quizzes: GuideQuiz[];
  capybaraQuestionEn: string;
  imageAnswerEn: string;
  imageAlt: string;
};

type GuideDoc = {
  _id: number;
  id: number;
  type: GrammarGuideType;
  slug: string;
  wordName: string;
  englishPhrase?: string;
  titleKo: string;
  titleEn: string;
  summaryKo: string;
  summaryEn: string;
  meaningKo: string;
  meaningEn: string;
  ruleKo: string;
  ruleEn: string;
  situationsKo: string[];
  situationsEn: string[];
  nuancesKo: string[];
  nuancesEn: string[];
  imageUrl?: string;
  imageAlt?: string;
  imageAnswerEn?: string;
  pronunciationUrl?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

type GuideExampleDoc = GuideExample & {
  _id?: unknown;
  guideId: number;
  sortOrder: number;
};

type GuideQuizDoc = GuideQuiz & {
  _id?: unknown;
  guideId: number;
  sortOrder: number;
};

type CounterDoc = { _id: string; seq: number };

type Collections = {
  guides: Collection<GuideDoc>;
  examples: Collection<GuideExampleDoc>;
  quizzes: Collection<GuideQuizDoc>;
  counters: Collection<CounterDoc>;
};

const COUNTER_KEYS: Record<GrammarGuideType, string> = {
  meaning: "grammar_meaning_id",
  usage: "grammar_usage_id",
  "how-to-say": "grammar_how_to_say_id",
};

const INITIAL_IDS: Record<GrammarGuideType, number> = {
  meaning: 5000,
  usage: 6000,
  "how-to-say": 7000,
};

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
  const guides = db.collection<GuideDoc>("grammar_guides");
  const examples = db.collection<GuideExampleDoc>("grammar_guide_examples");
  const quizzes = db.collection<GuideQuizDoc>("grammar_guide_quizzes");
  const counters = db.collection<CounterDoc>("counters");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await guides.createIndex({ id: 1 }, { unique: true });
        await guides.createIndex({ type: 1, slug: 1 }, { unique: true });
        await guides.createIndex({ type: 1, viewCount: -1, createdAt: -1 });
        await guides.createIndex(
          { type: 1, englishPhrase: 1 },
          { sparse: true },
        );
        await examples.createIndex({ guideId: 1, sortOrder: 1 });
        await quizzes.createIndex({ guideId: 1, sortOrder: 1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { guides, examples, quizzes, counters };
}

async function nextGuideId(
  counters: Collection<CounterDoc>,
  type: GrammarGuideType,
): Promise<number> {
  const key = COUNTER_KEYS[type];
  const initial = INITIAL_IDS[type];
  const doc = await counters.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  const seq = doc?.seq ?? initial;
  if (seq < initial) {
    await counters.updateOne(
      { _id: key },
      { $set: { seq: initial } },
      { upsert: true },
    );
    return initial;
  }
  return seq;
}

function docToCard(doc: GuideDoc): GrammarGuideCard {
  return {
    id: doc.id,
    type: doc.type,
    slug: doc.slug,
    wordName: doc.wordName,
    englishPhrase: doc.englishPhrase?.trim() || undefined,
    titleKo: doc.titleKo,
    titleEn: doc.titleEn,
    summaryKo: doc.summaryKo,
    summaryEn: doc.summaryEn,
    meaningKo: doc.meaningKo,
    meaningEn: doc.meaningEn,
    ruleKo: doc.ruleKo,
    ruleEn: doc.ruleEn,
    situationsKo: normalizeStrings(doc.situationsKo),
    situationsEn: normalizeStrings(doc.situationsEn),
    nuancesKo: normalizeStrings(doc.nuancesKo),
    nuancesEn: normalizeStrings(doc.nuancesEn),
    imageUrl: doc.imageUrl,
    imageAlt: doc.imageAlt,
    imageAnswerEn: doc.imageAnswerEn,
    pronunciationUrl: doc.pronunciationUrl,
    viewCount: doc.viewCount ?? 0,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function getGrammarGuideById(
  id: number,
): Promise<GrammarGuide | null> {
  if (!Number.isFinite(id) || id <= 0) return null;
  const { guides, examples, quizzes } = await cols();
  const doc = await guides.findOne({ id });
  if (!doc) return null;

  const [exampleDocs, quizDocs] = await Promise.all([
    examples.find({ guideId: id }).sort({ sortOrder: 1 }).toArray(),
    quizzes.find({ guideId: id }).sort({ sortOrder: 1 }).toArray(),
  ]);

  return {
    ...docToCard(doc),
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

export async function getGrammarGuideBySlug(
  type: GrammarGuideType,
  slug: string,
): Promise<GrammarGuide | null> {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  const { guides } = await cols();
  const doc = await guides.findOne({ type, slug: trimmed });
  if (!doc) return null;
  return getGrammarGuideById(doc.id);
}

export async function getGrammarGuideByWord(
  type: GrammarGuideType,
  wordName: string,
): Promise<GrammarGuide | null> {
  const trimmed = wordName.trim();
  if (!trimmed) return null;
  const { guides } = await cols();
  const doc = await guides.findOne({ type, wordName: trimmed });
  if (!doc) return null;
  return getGrammarGuideById(doc.id);
}

/** Lookup how-to-say (or any type) by English phrase key. */
export async function getGrammarGuideByEnglishPhrase(
  type: GrammarGuideType,
  englishPhrase: string,
): Promise<GrammarGuide | null> {
  const trimmed = englishPhrase.trim();
  if (!trimmed) return null;
  const { guides } = await cols();
  const doc = await guides.findOne({
    type,
    englishPhrase: { $regex: `^${escapeRegex(trimmed)}$`, $options: "i" },
  });
  if (!doc) return null;
  return getGrammarGuideById(doc.id);
}

/** Batch skip-existing: wordName for meaning/usage, englishPhrase for how-to-say. */
export async function getGrammarGuideByBatchKey(
  type: GrammarGuideType,
  key: string,
): Promise<GrammarGuide | null> {
  if (type === "how-to-say") {
    return getGrammarGuideByEnglishPhrase(type, key);
  }
  return getGrammarGuideByWord(type, key);
}

export async function listTopGuidesForStaticParams(
  type: GrammarGuideType,
  limit = 200,
): Promise<GrammarGuideCard[]> {
  const { guides } = await cols();
  const docs = await guides
    .find({ type })
    .sort({ id: -1 })
    .limit(Math.max(1, limit))
    .toArray();
  return docs.map(docToCard);
}

export async function listGrammarGuides(
  type: GrammarGuideType,
  opts?: { page?: number; pageSize?: number },
): Promise<{ items: GrammarGuideCard[]; total: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, opts?.pageSize ?? 24));
  const skip = (page - 1) * pageSize;
  const filter = { type };
  const { guides } = await cols();
  const [docs, total] = await Promise.all([
    guides
      .find(filter)
      .sort({ id: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    guides.countDocuments(filter),
  ]);
  return { items: docs.map(docToCard), total };
}

async function listRelatedGrammarGuidesById(
  type: GrammarGuideType,
  currentId: number,
  cap: number,
): Promise<GrammarGuideCard[]> {
  const { guides } = await cols();

  const beforeCount = Math.floor(cap / 2);
  const afterCount = cap - beforeCount;

  const fetchBefore = (n: number) =>
    guides
      .find({ type, id: { $lt: currentId } })
      .sort({ id: -1 })
      .limit(n)
      .toArray();

  const fetchAfter = (n: number) =>
    guides
      .find({ type, id: { $gt: currentId } })
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

/** Guides that share wordName or slug tokens with the current page. */
export async function listRelatedGrammarGuides(
  type: GrammarGuideType,
  currentId: number,
  limit = 8,
): Promise<GrammarGuideCard[]> {
  const cap = Math.max(1, Math.min(limit, 12));
  const current = await getGrammarGuideById(currentId);
  if (!current || current.type !== type) {
    return listRelatedGrammarGuidesById(type, currentId, cap);
  }

  const keys = guideRelatedKeys(
    current.wordName,
    current.slug,
    current.titleEn,
    current.englishPhrase ?? "",
  );
  const hangulKeys = keys.filter((key) => /[\uac00-\ud7a3]/.test(key)).slice(0, 6);
  const slugKeys = keys.filter((key) => key.length >= 2).slice(0, 8);
  if (hangulKeys.length === 0 && slugKeys.length === 0) {
    return listRelatedGrammarGuidesById(type, currentId, cap);
  }

  const { guides } = await cols();
  const orClauses: Record<string, unknown>[] = [];
  if (hangulKeys.length > 0) {
    orClauses.push({ wordName: { $in: hangulKeys } });
  }
  for (const key of slugKeys) {
    orClauses.push({ slug: { $regex: escapeRegex(key), $options: "i" } });
    orClauses.push({ wordName: { $regex: escapeRegex(key), $options: "i" } });
    orClauses.push({
      englishPhrase: { $regex: escapeRegex(key), $options: "i" },
    });
  }

  const candidates = await guides
    .find({ type, id: { $ne: currentId }, $or: orClauses })
    .limit(80)
    .toArray();

  const scored = candidates
    .map((doc) => ({
      doc,
      id: doc.id,
      score:
        scoreWordNameMatch(doc.wordName, keys) + scoreSlugMatch(doc.slug, keys),
    }))
    .filter((item) => item.score > 0);

  const semantic = rankByRelatedScore(scored, cap).map((item) => docToCard(item.doc));
  if (semantic.length >= cap) return semantic;

  const usedIds = new Set([currentId, ...semantic.map((item) => item.id)]);
  const fallback = await listRelatedGrammarGuidesById(type, currentId, cap);
  const merged = [...semantic];
  for (const item of fallback) {
    if (merged.length >= cap) break;
    if (!usedIds.has(item.id)) {
      merged.push(item);
      usedIds.add(item.id);
    }
  }
  return merged.slice(0, cap);
}

export async function upsertGrammarGuideFromGenerated(
  payload: GeneratedGrammarGuidePayload,
): Promise<{ id: number; slug: string; created: boolean }> {
  const slug = payload.slug.trim();
  if (!slug) throw new Error("slug is required");

  const { guides, examples, quizzes, counters } = await cols();
  const existing = await guides.findOne({ type: payload.type, slug });
  const now = nowIso();
  const id = existing?.id ?? (await nextGuideId(counters, payload.type));
  const created = !existing;

  const master: GuideDoc = {
    _id: id,
    id,
    type: payload.type,
    slug,
    wordName: payload.wordName.trim(),
    englishPhrase: payload.englishPhrase?.trim() || undefined,
    titleKo: payload.titleKo.trim(),
    titleEn: payload.titleEn.trim(),
    summaryKo: payload.summaryKo.trim(),
    summaryEn: payload.summaryEn.trim(),
    meaningKo: payload.meaningKo.trim(),
    meaningEn: payload.meaningEn.trim(),
    ruleKo: payload.ruleKo.trim(),
    ruleEn: payload.ruleEn.trim(),
    situationsKo: normalizeStrings(payload.situationsKo),
    situationsEn: normalizeStrings(payload.situationsEn),
    nuancesKo: normalizeStrings(payload.nuancesKo),
    nuancesEn: normalizeStrings(payload.nuancesEn),
    imageAnswerEn: payload.imageAnswerEn.trim(),
    imageAlt: payload.imageAlt.trim(),
    viewCount: existing?.viewCount ?? 0,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  await guides.updateOne({ id }, { $set: master }, { upsert: true });

  await Promise.all([
    examples.deleteMany({ guideId: id }),
    quizzes.deleteMany({ guideId: id }),
  ]);

  if (payload.examples.length > 0) {
    await examples.insertMany(
      payload.examples.map((ex, sortOrder) => ({
        guideId: id,
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
        guideId: id,
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

export async function updateGrammarGuideImage(
  id: number,
  imageUrl: string,
  imageAlt: string,
): Promise<void> {
  const { guides } = await cols();
  await guides.updateOne(
    { id },
    { $set: { imageUrl: imageUrl.trim(), imageAlt: imageAlt.trim(), updatedAt: nowIso() } },
  );
}

export async function updateGrammarGuidePronunciation(
  id: number,
  pronunciationUrl: string,
): Promise<void> {
  const { guides } = await cols();
  await guides.updateOne(
    { id },
    {
      $set: {
        pronunciationUrl: pronunciationUrl.trim(),
        updatedAt: nowIso(),
      },
    },
  );
}

export async function incrementGrammarGuideViewCount(id: number): Promise<void> {
  if (!Number.isFinite(id) || id <= 0) return;
  const { guides } = await cols();
  await guides.updateOne({ id }, { $inc: { viewCount: 1 } });
}

export function guideBasePath(type: GrammarGuideType): string {
  if (type === "meaning") return "/grammar/meaning";
  if (type === "usage") return "/grammar/usage";
  return "/grammar/how-to-say";
}

export function guideCanonicalUrl(
  baseUrl: string,
  guide: Pick<GrammarGuideCard, "type" | "id" | "slug">,
): string {
  const base = baseUrl.replace(/\/+$/, "");
  return `${base}${guideBasePath(guide.type)}/${guide.id}/${encodeURIComponent(guide.slug)}`;
}
