import {
  DEFAULT_ADAPTIVE_SCORE,
  emptyDifficultyBucketCounts,
  mergeDifficultyBucketCounts,
  normalizeDifficulty,
  pickTierByAdaptiveScore,
  STUDIO_C_TIER_WEIGHT_SCALE,
} from "./difficulty";
import { isExcludedQuizTopic, queueEntryFromItem } from "./category";
import { isStudioQuizItem } from "./store";
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
  studio?: boolean,
): KoreanQuizQueueEntry[] {
  const picked: KoreanQuizQueueEntry[] = [];
  const used = new Set<string>();
  const tierOptions = studio
    ? { cWeightScale: STUDIO_C_TIER_WEIGHT_SCALE }
    : undefined;

  const weightOf = (item: KoreanQuizQueuePick) =>
    quizPickWeight({
      quizId: item.id,
      wrongIds,
      correctCount: correctCounts.get(item.id) ?? 0,
    });

  while (picked.length < count && used.size < pool.length) {
    const tier = fixedTier ?? pickTierByAdaptiveScore(adaptiveScore, tierOptions);

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
  studio?: boolean,
): KoreanQuizQueuePick[] {
  const exclude = new Set(excludeIds);
  if (applyCooldown) {
    for (const id of cooldownIds.slice(-QUIZ_REAPPEAR_COOLDOWN)) {
      exclude.add(id);
    }
  }
  return approved.filter((item) => {
    if (isExcludedQuizTopic(item)) return false;
    if (exclude.has(item.id)) return false;
    if (studio && !isStudioQuizItem(item)) return false;
    return true;
  });
}

async function filterQuizPool(params: {
  excludeIds: Set<string>;
  cooldownIds: string[];
  listApproved: () => Promise<KoreanQuizQueuePick[]>;
  studio?: boolean;
}): Promise<KoreanQuizQueuePick[]> {
  const approved = await params.listApproved();
  let pool = filterWithExcludes(
    approved,
    params.excludeIds,
    params.cooldownIds,
    true,
    params.studio,
  );
  if (pool.length === 0) {
    pool = filterWithExcludes(
      approved,
      params.excludeIds,
      params.cooldownIds,
      false,
      params.studio,
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
  studio?: boolean;
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
      studio: params.studio,
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
    params.studio,
  );
}

/** @deprecated Use buildWeightedQueueEntries — topic blocks removed. */
export const buildCategoryAwareQueueEntries = buildWeightedQueueEntries;
