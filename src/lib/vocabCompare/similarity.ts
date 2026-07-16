import { getKoreanQuizDb } from "@/lib/koreanQuiz/db";
import { ensureKoreanQuizIndexes } from "@/lib/koreanQuiz/store";
import { WHEN_TO_USE_MIN_EXAMPLES } from "@/lib/whenToUse/types";
import type { Filter } from "mongodb";

import {
  VOCAB_COMPARE_MIN_SCORE,
  VOCAB_COMPARE_NEIGHBORS,
} from "./types";

export type SeoEmbeddingRow = {
  id: string;
  vector: number[];
  korean: string;
  english: string;
  imageUrl: string;
  explanation: string;
  topic?: string;
  updatedAt?: string;
  comparisons: Array<{
    korean: string;
    english: string;
    contrast: string;
    quizId?: string;
  }>;
};

const CACHE_TTL_MS = 30 * 60 * 1000;

let cache: SeoEmbeddingRow[] | null = null;
let cacheLoadedAt = 0;
let cachePromise: Promise<SeoEmbeddingRow[]> | null = null;

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }
  if (normA <= 0 || normB <= 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function loadSeoEmbeddingPool(): Promise<SeoEmbeddingRow[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const filter = {
    status: "approved",
    imageUrl: { $exists: true, $nin: [null, ""] },
    wordExplanation: { $exists: true, $type: "string", $ne: "" },
    [`wordExplanationExamples.${WHEN_TO_USE_MIN_EXAMPLES - 1}`]: { $exists: true },
    meaningEmbedding: { $exists: true, $type: "array" },
  } as Filter<Record<string, unknown>>;

  const docs = await db
    .collection("korean_quiz_items")
    .find(filter, {
      projection: {
        _id: 0,
        id: 1,
        choices: 1,
        correctChoiceId: 1,
        imageUrl: 1,
        illustrationEnglish: 1,
        topic: 1,
        wordExplanation: 1,
        wordExplanationComparisons: 1,
        wordExplanationGeneratedAt: 1,
        approvedAt: 1,
        meaningEmbedding: 1,
      },
    })
    .toArray();

  const out: SeoEmbeddingRow[] = [];
  for (const doc of docs) {
    const vector = Array.isArray(doc.meaningEmbedding)
      ? (doc.meaningEmbedding as number[]).map(Number)
      : [];
    if (vector.length < 8) continue;
    const correct = (doc.choices as Array<{ id: string; label?: string; english?: string }> | undefined)?.find(
      (c) => c.id === doc.correctChoiceId,
    );
    const korean = String(correct?.label ?? "").trim();
    const illustration = String(doc.illustrationEnglish ?? "").trim();
    const english = (illustration || String(correct?.english ?? "")).trim();
    const explanation = String(doc.wordExplanation ?? "").trim();
    const imageUrl = String(doc.imageUrl ?? "").trim();
    if (!korean || !english || !explanation || !imageUrl) continue;

    out.push({
      id: String(doc.id),
      vector,
      korean,
      english,
      imageUrl,
      explanation,
      topic: typeof doc.topic === "string" ? doc.topic.trim() || undefined : undefined,
      updatedAt:
        (typeof doc.wordExplanationGeneratedAt === "string"
          ? doc.wordExplanationGeneratedAt
          : undefined) ||
        (typeof doc.approvedAt === "string" ? doc.approvedAt : undefined),
      comparisons: Array.isArray(doc.wordExplanationComparisons)
        ? (doc.wordExplanationComparisons as SeoEmbeddingRow["comparisons"])
        : [],
    });
  }
  return out;
}

export async function getSeoEmbeddingPool(): Promise<SeoEmbeddingRow[]> {
  const now = Date.now();
  if (cache && now - cacheLoadedAt < CACHE_TTL_MS) return cache;
  if (cachePromise) return cachePromise;
  cachePromise = loadSeoEmbeddingPool()
    .then((rows) => {
      cache = rows;
      cacheLoadedAt = Date.now();
      return rows;
    })
    .finally(() => {
      cachePromise = null;
    });
  return cachePromise;
}

export function topSimilarFromPool(
  pool: SeoEmbeddingRow[],
  anchorId: string,
  limit = VOCAB_COMPARE_NEIGHBORS,
  minScore = VOCAB_COMPARE_MIN_SCORE,
): Array<{ row: SeoEmbeddingRow; score: number }> {
  const anchor = pool.find((row) => row.id === anchorId);
  if (!anchor) return [];

  const scored: Array<{ row: SeoEmbeddingRow; score: number }> = [];
  for (const row of pool) {
    if (row.id === anchorId) continue;
    const score = cosineSimilarity(anchor.vector, row.vector);
    if (score < minScore) continue;
    scored.push({ row, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}

export function resolveCachedContrast(
  left: SeoEmbeddingRow,
  right: SeoEmbeddingRow,
): string | null {
  for (const row of left.comparisons) {
    if (row.quizId === right.id) return row.contrast.trim() || null;
    if (row.korean.trim() === right.korean) return row.contrast.trim() || null;
  }
  for (const row of right.comparisons) {
    if (row.quizId === left.id) return row.contrast.trim() || null;
    if (row.korean.trim() === left.korean) return row.contrast.trim() || null;
  }
  return null;
}

export function fallbackContrast(
  left: SeoEmbeddingRow,
  right: SeoEmbeddingRow,
): string {
  const clip = (text: string) => {
    const one = text.replace(/\s+/g, " ").trim();
    if (one.length <= 140) return one;
    return `${one.slice(0, 137).trimEnd()}…`;
  };
  return (
    `${left.english} (${left.korean}) and ${right.english} (${right.korean}) ` +
    `are nearby Korean vocabulary items learners often meet together. ` +
    `Use “${left.english}” when ${clip(left.explanation)} ` +
    `Use “${right.english}” when ${clip(right.explanation)}`
  );
}
