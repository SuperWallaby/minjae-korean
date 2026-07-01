import { ensureKoreanQuizIndexes } from "./store";
import { getKoreanQuizDb } from "./db";
import { normalizeDifficulty } from "./difficulty";
import type { DifficultyTier, KoreanQuizItem } from "./types";

/** Fields required to build / refill the per-device quiz queue. */
export type KoreanQuizQueuePick = {
  id: string;
  topic?: string;
  difficulty: DifficultyTier;
};

const DEFAULT_CACHE_TTL_MS = 3 * 60 * 60 * 1000;

function approvedCacheTtlMs(): number {
  const raw = process.env.KOREAN_QUIZ_APPROVED_CACHE_TTL_MS;
  if (!raw) return DEFAULT_CACHE_TTL_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_CACHE_TTL_MS;
}

const QUEUE_PICK_PROJECTION = {
  _id: 0,
  id: 1,
  topic: 1,
  difficulty: 1,
} as const;

let cached: { items: KoreanQuizQueuePick[]; loadedAt: number } | null = null;
let refreshPromise: Promise<KoreanQuizQueuePick[]> | null = null;

function toQueuePick(
  item: Pick<KoreanQuizItem, "id" | "topic" | "difficulty">,
): KoreanQuizQueuePick {
  return {
    id: item.id,
    topic: item.topic,
    difficulty: normalizeDifficulty(item.difficulty),
  };
}

async function loadApprovedPicksFromDb(): Promise<KoreanQuizQueuePick[]> {
  await ensureKoreanQuizIndexes();
  const db = await getKoreanQuizDb();
  const rows = await db
    .collection<KoreanQuizItem>("korean_quiz_items")
    .find({ status: "approved" }, { projection: QUEUE_PICK_PROJECTION })
    .toArray();
  return rows.map(toQueuePick);
}

async function refreshCache(): Promise<KoreanQuizQueuePick[]> {
  const items = await loadApprovedPicksFromDb();
  cached = { items, loadedAt: Date.now() };
  return items;
}

function scheduleCacheRefresh(): void {
  if (refreshPromise) return;
  refreshPromise = refreshCache()
    .catch((error) => {
      console.error(
        "[korean-quiz] approved pick cache refresh failed:",
        error instanceof Error ? error.message : error,
      );
      return cached?.items ?? [];
    })
    .finally(() => {
      refreshPromise = null;
    });
}

/** Stale-while-revalidate: refresh in background; keep serving the previous list. */
export function invalidateApprovedQuizCache(): void {
  if (cached) {
    scheduleCacheRefresh();
  }
}

export async function listApprovedKoreanQuizzesForQueue(): Promise<KoreanQuizQueuePick[]> {
  const now = Date.now();
  const ttl = approvedCacheTtlMs();

  if (cached) {
    if (now - cached.loadedAt < ttl) {
      return cached.items;
    }
    scheduleCacheRefresh();
    return cached.items;
  }

  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = refreshCache().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
