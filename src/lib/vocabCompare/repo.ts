import {
  slugifyWhenToUseEnglish,
  whenToUsePath,
} from "@/lib/whenToUse/slug";

import {
  fallbackContrast,
  getSeoEmbeddingPool,
  resolveCachedContrast,
  topSimilarFromPool,
  type SeoEmbeddingRow,
} from "./similarity";
import {
  orderedPairIds,
  slugifyVocabComparePair,
  vocabComparePath,
  vocabCompareTitleEn,
} from "./slug";
import type {
  VocabCompareListItem,
  VocabComparePage,
  VocabCompareSide,
} from "./types";
import { VOCAB_COMPARE_NEIGHBORS } from "./types";

function toSide(row: SeoEmbeddingRow): VocabCompareSide {
  const slug = slugifyWhenToUseEnglish(row.english);
  return {
    id: row.id,
    slug,
    korean: row.korean,
    english: row.english,
    imageUrl: row.imageUrl,
    imageAlt: row.english || `Korean word ${row.korean}`,
    explanation: row.explanation,
    whenToUsePath: whenToUsePath(row.id, slug),
  };
}

function buildPage(
  left: SeoEmbeddingRow,
  right: SeoEmbeddingRow,
): VocabComparePage {
  const cached = resolveCachedContrast(left, right);
  const contrast = cached ?? fallbackContrast(left, right);
  const titleEn = vocabCompareTitleEn(left.english, right.english);
  const description =
    contrast.length > 160 ? `${contrast.slice(0, 157).trimEnd()}…` : contrast;
  return {
    leftId: left.id,
    rightId: right.id,
    slug: slugifyVocabComparePair(left.english, right.english),
    titleEn,
    description,
    contrast,
    contrastSource: cached ? "cached" : "fallback",
    left: toSide(left),
    right: toSide(right),
    topic: left.topic || right.topic,
    updatedAt: left.updatedAt || right.updatedAt,
  };
}

type PairSeed = { a: string; b: string };

function collectPairSeeds(pool: SeoEmbeddingRow[]): PairSeed[] {
  const byId = new Map(pool.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const seeds: PairSeed[] = [];

  const add = (idA: string, idB: string) => {
    if (!byId.has(idA) || !byId.has(idB) || idA === idB) return;
    const { leftId, rightId } = orderedPairIds(idA, idB);
    const key = `${leftId}:${rightId}`;
    if (seen.has(key)) return;
    seen.add(key);
    seeds.push({ a: leftId, b: rightId });
  };

  for (const row of pool) {
    // Prefer quiz-app cached contrasts (have explicit difference copy).
    for (const comp of row.comparisons) {
      const otherId = comp.quizId?.trim();
      if (otherId) add(row.id, otherId);
    }
    // High-confidence embedding neighbors (+ same topic when both tagged).
    for (const { row: neighbor, score } of topSimilarFromPool(
      pool,
      row.id,
      VOCAB_COMPARE_NEIGHBORS,
      0.68,
    )) {
      const topicOk =
        !row.topic ||
        !neighbor.topic ||
        row.topic === neighbor.topic;
      if (topicOk && score >= 0.68) {
        add(row.id, neighbor.id);
      }
    }
  }

  return seeds;
}

const PAGES_TTL_MS = 30 * 60 * 1000;
let pagesCache: VocabComparePage[] | null = null;
let pagesCacheLoadedAt = 0;
let pagesCachePromise: Promise<VocabComparePage[]> | null = null;

async function allComparePages(): Promise<VocabComparePage[]> {
  const now = Date.now();
  if (pagesCache && now - pagesCacheLoadedAt < PAGES_TTL_MS) return pagesCache;
  if (pagesCachePromise) return pagesCachePromise;

  pagesCachePromise = (async () => {
    const pool = await getSeoEmbeddingPool();
    const byId = new Map(pool.map((row) => [row.id, row]));
    const pages: VocabComparePage[] = [];
    for (const seed of collectPairSeeds(pool)) {
      const left = byId.get(seed.a);
      const right = byId.get(seed.b);
      if (!left || !right) continue;
      pages.push(buildPage(left, right));
    }
    pages.sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
    pagesCache = pages;
    pagesCacheLoadedAt = Date.now();
    return pages;
  })().finally(() => {
    pagesCachePromise = null;
  });

  return pagesCachePromise;
}

function toListItem(page: VocabComparePage): VocabCompareListItem {
  return {
    leftId: page.leftId,
    rightId: page.rightId,
    slug: page.slug,
    titleEn: page.titleEn,
    left: {
      korean: page.left.korean,
      english: page.left.english,
      imageUrl: page.left.imageUrl,
      imageAlt: page.left.imageAlt,
    },
    right: {
      korean: page.right.korean,
      english: page.right.english,
      imageUrl: page.right.imageUrl,
      imageAlt: page.right.imageAlt,
    },
    updatedAt: page.updatedAt,
  };
}

export async function listVocabComparePages(options?: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: VocabCompareListItem[]; total: number }> {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, options?.pageSize ?? 24));
  const all = await allComparePages();
  const start = (page - 1) * pageSize;
  return {
    items: all.slice(start, start + pageSize).map(toListItem),
    total: all.length,
  };
}

export async function listTopVocabCompareForStaticParams(
  limit = 1000,
): Promise<
  Array<{ leftId: string; rightId: string; slug: string; updatedAt?: string }>
> {
  const all = await allComparePages();
  return all.slice(0, limit).map((page) => ({
    leftId: page.leftId,
    rightId: page.rightId,
    slug: page.slug,
    updatedAt: page.updatedAt,
  }));
}

export async function getVocabComparePage(
  leftId: string,
  rightId: string,
): Promise<VocabComparePage | null> {
  const a = leftId.trim();
  const b = rightId.trim();
  if (!a || !b) return null;
  const { leftId: L, rightId: R } = orderedPairIds(a, b);
  const pool = await getSeoEmbeddingPool();
  const left = pool.find((row) => row.id === L);
  const right = pool.find((row) => row.id === R);
  if (!left || !right) return null;
  return buildPage(left, right);
}

export async function buildVocabCompareCatalog(
  limit = 5000,
): Promise<VocabComparePage[]> {
  const all = await allComparePages();
  return all.slice(0, limit);
}

/** Related SEO-ready quizzes with images for a when-to-use detail page. */
export async function listRelatedVocabForQuiz(
  quizId: string,
  limit = 6,
): Promise<
  Array<{
    id: string;
    slug: string;
    korean: string;
    english: string;
    imageUrl: string;
    imageAlt: string;
    comparePath?: string;
  }>
> {
  const pool = await getSeoEmbeddingPool();
  const anchor = pool.find((row) => row.id === quizId);
  const similar = topSimilarFromPool(pool, quizId, limit);
  if (!anchor) {
    return similar.map(({ row }) => {
      const slug = slugifyWhenToUseEnglish(row.english);
      return {
        id: row.id,
        slug,
        korean: row.korean,
        english: row.english,
        imageUrl: row.imageUrl,
        imageAlt: row.english || `Korean word ${row.korean}`,
      };
    });
  }

  return similar.map(({ row }) => {
    const slug = slugifyWhenToUseEnglish(row.english);
    const { leftId, rightId } = orderedPairIds(anchor.id, row.id);
    const leftEn = leftId === anchor.id ? anchor.english : row.english;
    const rightEn = rightId === anchor.id ? anchor.english : row.english;
    return {
      id: row.id,
      slug,
      korean: row.korean,
      english: row.english,
      imageUrl: row.imageUrl,
      imageAlt: row.english || `Korean word ${row.korean}`,
      comparePath: vocabComparePath(
        leftId,
        rightId,
        slugifyVocabComparePair(leftEn, rightEn),
      ),
    };
  });
}
