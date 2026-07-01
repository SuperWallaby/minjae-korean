import {
  DEFAULT_ADAPTIVE_SCORE,
  emptyDifficultyBucketCounts,
  mergeDifficultyBucketCounts,
  normalizeDifficulty,
  pickTierByAdaptiveScore,
} from "./difficulty";
import { isExcludedQuizTopic, queueEntryFromItem } from "./category";
import {
  pickWeightedRandom,
  QUIZ_REAPPEAR_COOLDOWN,
  quizPickWeight,
} from "./pickWeights";
import type { DifficultyPreference, DifficultyTier, KoreanQuizQueueEntry } from "./types";
import type { KoreanQuizQueuePick } from "./approvedCache";

export { mergeDifficultyBucketCounts, emptyDifficultyBucketCounts };

export function filterPoolByDifficultyPreference(
  pool: KoreanQuizQueuePick[],
  preference: DifficultyPreference,
): KoreanQuizQueuePick[] {
  if (preference === "auto") return pool;
  const filtered = pool.filter(
    (item) => normalizeDifficulty(item.difficulty) === preference,
  );
  return filtered.length > 0 ? filtered : pool;
}

function weightedPickFromPool(
  pool: KoreanQuizQueuePick[],
  count: number,
  wrongIds: Set<string>,
  correctCounts: Map<string, number>,
  adaptiveScore: number,
  fixedTier?: DifficultyTier,
): KoreanQuizQueueEntry[] {
  const picked: KoreanQuizQueueEntry[] = [];
  const used = new Set<string>();

  const weightOf = (item: KoreanQuizQueuePick) =>
    quizPickWeight({
      quizId: item.id,
      wrongIds,
      correctCount: correctCounts.get(item.id) ?? 0,
    });

  while (picked.length < count && used.size < pool.length) {
    const tier = fixedTier ?? pickTierByAdaptiveScore(adaptiveScore);

    let candidates = pool.filter(
      (item) =>
        !used.has(item.id) &&
        normalizeDifficulty(item.difficulty) === tier,
    );

    if (candidates.length === 0) {
      candidates = pool.filter((item) => !used.has(item.id));
      if (candidates.length === 0) break;
    }

    const choice = pickWeightedRandom(candidates, weightOf);
    if (!choice) break;
    used.add(choice.id);
    picked.push(queueEntryFromItem(choice));
  }

  return picked;
}

function filterWithExcludes(
  approved: KoreanQuizQueuePick[],
  excludeIds: Set<string>,
  cooldownIds: string[],
  applyCooldown: boolean,
): KoreanQuizQueuePick[] {
  const exclude = new Set(excludeIds);
  if (applyCooldown) {
    for (const id of cooldownIds.slice(-QUIZ_REAPPEAR_COOLDOWN)) {
      exclude.add(id);
    }
  }
  return approved.filter(
    (item) => !isExcludedQuizTopic(item) && !exclude.has(item.id),
  );
}

async function filterQuizPool(params: {
  excludeIds: Set<string>;
  cooldownIds: string[];
  listApproved: () => Promise<KoreanQuizQueuePick[]>;
}): Promise<KoreanQuizQueuePick[]> {
  const approved = await params.listApproved();
  let pool = filterWithExcludes(
    approved,
    params.excludeIds,
    params.cooldownIds,
    true,
  );
  if (pool.length === 0) {
    pool = filterWithExcludes(
      approved,
      params.excludeIds,
      params.cooldownIds,
      false,
    );
  }
  return pool;
}

/** Weighted random picks from the full approved pool (after cooldown / queue excludes). */
export async function buildWeightedQueueEntries(params: {
  count: number;
  excludeIds: Set<string>;
  cooldownIds: string[];
  wrongIds: Set<string>;
  correctCounts: Map<string, number>;
  difficultyPreference?: DifficultyPreference;
  adaptiveScore?: number;
  listApproved: () => Promise<KoreanQuizQueuePick[]>;
}): Promise<KoreanQuizQueueEntry[]> {
  if (params.count <= 0) return [];

  const preference = params.difficultyPreference ?? "auto";
  const adaptiveScore = params.adaptiveScore ?? DEFAULT_ADAPTIVE_SCORE;
  const fixedTier =
    preference === "auto" ? undefined : normalizeDifficulty(preference);

  const pool = filterPoolByDifficultyPreference(
    await filterQuizPool({
      excludeIds: params.excludeIds,
      cooldownIds: params.cooldownIds,
      listApproved: params.listApproved,
    }),
    preference,
  );
  if (pool.length === 0) return [];

  return weightedPickFromPool(
    pool,
    params.count,
    params.wrongIds,
    params.correctCounts,
    adaptiveScore,
    fixedTier,
  );
}

/** @deprecated Use buildWeightedQueueEntries — topic blocks removed. */
export const buildCategoryAwareQueueEntries = buildWeightedQueueEntries;
