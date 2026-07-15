import { choiceEnglishGloss, illustrationEnglishBelowImage } from "@/lib/koreanQuiz/englishGloss";
import { publicUrlForR2Key, resolveQuizCdnOrigin } from "@/lib/koreanQuiz/quizMedia";
import { resolveRomanizationDisplay } from "@/lib/koreanQuiz/romanization";
import { correctLabelFromItem, ensureKoreanQuizIndexes } from "@/lib/koreanQuiz/store";
import { getKoreanQuizDb } from "@/lib/koreanQuiz/db";
import { getCachedAnswerTtsUrl } from "@/lib/koreanQuiz/tts";
import type { KoreanQuizItem } from "@/lib/koreanQuiz/types";
import type { Filter } from "mongodb";

import {
  slugifyWhenToUseEnglish,
  whenToUseTitleEn,
} from "./slug";
import type {
  SeoReadyQuizDoc,
  WhenToUseExample,
  WhenToUseListItem,
  WhenToUsePage,
} from "./types";
import { WHEN_TO_USE_MIN_EXAMPLES } from "./types";

const SEO_READY_FILTER = {
  status: "approved",
  imageUrl: { $exists: true, $nin: [null, ""] },
  wordExplanation: { $exists: true, $type: "string", $ne: "" },
  [`wordExplanationExamples.${WHEN_TO_USE_MIN_EXAMPLES - 1}`]: { $exists: true },
} as Filter<SeoReadyQuizDoc>;

function englishForDoc(doc: SeoReadyQuizDoc): string {
  const below = illustrationEnglishBelowImage(doc)?.trim();
  if (below) return below;
  const correct = doc.choices?.find((c) => c.id === doc.correctChoiceId);
  return choiceEnglishGloss(correct ?? {});
}

function exampleTtsUrl(
  doc: SeoReadyQuizDoc,
  example: { ttsR2Key?: string },
): string | undefined {
  const key = example.ttsR2Key?.trim();
  if (!key) return undefined;
  return publicUrlForR2Key(key, resolveQuizCdnOrigin(doc)) ?? undefined;
}

function mapExamples(doc: SeoReadyQuizDoc): WhenToUseExample[] {
  const rows = doc.wordExplanationExamples ?? [];
  const out: WhenToUseExample[] = [];
  for (const row of rows) {
    const korean = String(row.korean ?? "").trim();
    const english = String(row.english ?? "").trim();
    if (!korean || !english) continue;
    out.push({
      korean,
      english,
      ttsUrl: exampleTtsUrl(doc, row),
    });
  }
  return out;
}

export function isSeoReadyWhenToUseDoc(doc: SeoReadyQuizDoc): boolean {
  if (doc.status !== "approved") return false;
  if (!doc.imageUrl?.trim()) return false;
  if (!doc.wordExplanation?.trim()) return false;
  if (!englishForDoc(doc)) return false;
  if (!correctLabelFromItem(doc).trim()) return false;
  return mapExamples(doc).length >= WHEN_TO_USE_MIN_EXAMPLES;
}

export function toWhenToUseListItem(doc: SeoReadyQuizDoc): WhenToUseListItem | null {
  if (!isSeoReadyWhenToUseDoc(doc)) return null;
  const english = englishForDoc(doc);
  const korean = correctLabelFromItem(doc);
  const slug = slugifyWhenToUseEnglish(english);
  return {
    id: doc.id,
    slug,
    korean,
    english,
    titleEn: whenToUseTitleEn(english),
    imageUrl: doc.imageUrl,
    imageAlt: english || `Korean word ${korean}`,
    topic: doc.topic?.trim() || undefined,
    updatedAt: doc.wordExplanationGeneratedAt || doc.approvedAt,
  };
}

export function toWhenToUsePage(doc: SeoReadyQuizDoc): WhenToUsePage | null {
  const list = toWhenToUseListItem(doc);
  if (!list) return null;
  const examples = mapExamples(doc);
  // Sync CDN URL — avoid per-item R2 HEAD during catalog / static params.
  const answerTtsUrl = getCachedAnswerTtsUrl(doc as KoreanQuizItem);
  const romanization =
    resolveRomanizationDisplay(list.korean, doc.romanization) || undefined;
  const explanation = doc.wordExplanation!.trim();
  const description =
    explanation.length > 160
      ? `${explanation.slice(0, 157).trimEnd()}…`
      : explanation;

  return {
    ...list,
    romanization,
    description,
    explanation,
    examples,
    answerTtsUrl,
  };
}

async function fetchSeoReadyDocs(limit?: number): Promise<SeoReadyQuizDoc[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const cursor = db
    .collection<SeoReadyQuizDoc>("korean_quiz_items")
    .find(SEO_READY_FILTER, {
      projection: {
        _id: 0,
        id: 1,
        status: 1,
        choices: 1,
        correctChoiceId: 1,
        imageUrl: 1,
        imageR2Key: 1,
        illustrationEnglish: 1,
        answerTtsR2Key: 1,
        answerTtsUpdatedAt: 1,
        romanization: 1,
        topic: 1,
        wordExplanation: 1,
        wordExplanationExamples: 1,
        wordExplanationGeneratedAt: 1,
        wordExplanationExamplesReviewed: 1,
        approvedAt: 1,
      },
    })
    .sort({ approvedAt: -1, wordExplanationGeneratedAt: -1 });

  if (limit && limit > 0) cursor.limit(limit);
  return cursor.toArray();
}

export async function listWhenToUsePages(options?: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: WhenToUseListItem[]; total: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 24));
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();

  const filter = SEO_READY_FILTER;
  const coll = db.collection<SeoReadyQuizDoc>("korean_quiz_items");
  const [total, docs] = await Promise.all([
    coll.countDocuments(filter),
    coll
      .find(filter, {
        projection: {
          _id: 0,
          id: 1,
          status: 1,
          choices: 1,
          correctChoiceId: 1,
          imageUrl: 1,
          illustrationEnglish: 1,
          topic: 1,
          wordExplanation: 1,
          wordExplanationExamples: 1,
          wordExplanationGeneratedAt: 1,
          approvedAt: 1,
        },
      })
      .sort({ approvedAt: -1, wordExplanationGeneratedAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .toArray(),
  ]);

  const items = docs
    .map((doc) => toWhenToUseListItem(doc))
    .filter((row): row is WhenToUseListItem => Boolean(row));

  return { items, total };
}

export async function listTopWhenToUseForStaticParams(
  limit = 2000,
): Promise<Array<{ id: string; slug: string; updatedAt?: string }>> {
  const docs = await fetchSeoReadyDocs(limit);
  const out: Array<{ id: string; slug: string; updatedAt?: string }> = [];
  for (const doc of docs) {
    const item = toWhenToUseListItem(doc);
    if (!item) continue;
    out.push({
      id: item.id,
      slug: item.slug,
      updatedAt: item.updatedAt,
    });
  }
  return out;
}

export async function getWhenToUsePageById(
  id: string,
): Promise<WhenToUsePage | null> {
  const trimmed = id.trim();
  if (!trimmed) return null;
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const doc = await db.collection<SeoReadyQuizDoc>("korean_quiz_items").findOne(
    { id: trimmed, ...SEO_READY_FILTER },
    {
      projection: {
        _id: 0,
        id: 1,
        status: 1,
        choices: 1,
        correctChoiceId: 1,
        imageUrl: 1,
        imageR2Key: 1,
        illustrationEnglish: 1,
        answerTtsR2Key: 1,
        answerTtsUpdatedAt: 1,
        romanization: 1,
        topic: 1,
        wordExplanation: 1,
        wordExplanationExamples: 1,
        wordExplanationGeneratedAt: 1,
        wordExplanationExamplesReviewed: 1,
        approvedAt: 1,
      },
    },
  );
  if (!doc) return null;
  return toWhenToUsePage(doc);
}

/** Full catalog for pipeline scripts (URLs + fields). */
export async function buildWhenToUseCatalog(limit = 5000): Promise<WhenToUsePage[]> {
  const docs = await fetchSeoReadyDocs(limit);
  const pages: WhenToUsePage[] = [];
  for (const doc of docs) {
    const page = toWhenToUsePage(doc);
    if (page) pages.push(page);
  }
  return pages;
}
