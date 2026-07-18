import type { KoreanQuizItem } from "./types";

/** Three grades aligned with 국어원 학습용 어휘 A/B/C. */
export const DIFFICULTY_TIER_IDS = ["A", "B", "C"] as const;

export type DifficultyTier = (typeof DIFFICULTY_TIER_IDS)[number];

export const DIFFICULTY_TIERS: ReadonlyArray<{ id: DifficultyTier; label: string }> = [
  { id: "A", label: "A" },
  { id: "B", label: "B" },
  { id: "C", label: "C" },
];

/** @deprecated use DIFFICULTY_TIERS */
export const DIFFICULTY_BUCKETS = DIFFICULTY_TIERS;

/** B+ only — skip A when picking new items. */
export const MID_PLUS_MIN_BUCKET_INDEX = 1;

export type PickDifficultyOptions = {
  /** 0=any tier, 1=B+ (B·C). */
  minBucketIndex?: number;
};

const LEGACY_FIVE_TIER_TO_GRADE: Record<string, DifficultyTier> = {
  very_easy: "A",
  easy: "A",
  mid: "B",
  hard: "C",
  very_hard: "C",
};

const LEGACY_THREE_BUCKET_TO_GRADE: Record<string, DifficultyTier> = {
  easy: "A",
  mid: "B",
  hard: "C",
};

function legacyNumberToTier(value: number): DifficultyTier {
  const v = Math.round(value);
  if (v <= 33) return "A";
  if (v <= 40) return "B";
  return "C";
}

export function normalizeDifficulty(raw: unknown): DifficultyTier {
  if (typeof raw === "string") {
    const key = raw.trim();
    const upper = key.toUpperCase();
    if (DIFFICULTY_TIER_IDS.includes(upper as DifficultyTier)) {
      return upper as DifficultyTier;
    }
    const fromFive = LEGACY_FIVE_TIER_TO_GRADE[key];
    if (fromFive) return fromFive;
    const fromThree = LEGACY_THREE_BUCKET_TO_GRADE[key];
    if (fromThree) return fromThree;
  }
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return legacyNumberToTier(raw);
  }
  return "B";
}

export function difficultyTierLabel(value: unknown): string {
  return normalizeDifficulty(value);
}

export function difficultyTierIndex(value: unknown): number {
  const tier = normalizeDifficulty(value);
  const idx = DIFFICULTY_TIERS.findIndex((row) => row.id === tier);
  return idx >= 0 ? idx : 1;
}

/** @deprecated use difficultyTierIndex */
export function difficultyBucketIndex(value: unknown): number {
  return difficultyTierIndex(value);
}

export function emptyDifficultyBucketCounts(): number[] {
  return DIFFICULTY_TIERS.map(() => 0);
}

export function countDifficultyBuckets(
  items: Pick<KoreanQuizItem, "difficulty">[],
): number[] {
  const counts = emptyDifficultyBucketCounts();
  for (const item of items) {
    counts[difficultyTierIndex(item.difficulty)] += 1;
  }
  return counts;
}

export function mergeDifficultyBucketCounts(...sets: number[][]): number[] {
  const merged = emptyDifficultyBucketCounts();
  for (const counts of sets) {
    for (let i = 0; i < merged.length; i += 1) {
      merged[i] += counts[i] ?? 0;
    }
  }
  return merged;
}

/** Default adaptive score — mid difficulty preference. */
export const DEFAULT_ADAPTIVE_SCORE = 50;

const ADAPTIVE_SCORE_MIN = 0;
const ADAPTIVE_SCORE_MAX = 100;
/** Climb slowly so Level 1 (A) stays common after a few correct answers. */
const SCORE_GAIN_ON_CORRECT = 3;
const SCORE_LOSS_ON_WRONG = 8;

/** Skew strength at score 0 / 100 (kept mild so A does not collapse). */
const ADAPTIVE_TIER_SKEW = 0.85;
const MIN_TIER_WEIGHT = 0.12;
/** Floor for A so Level 1 remains the plurality even at high scores. */
const MIN_A_TIER_WEIGHT = 0.75;

export function clampAdaptiveScore(raw: unknown): number {
  if (typeof raw !== "number" || !Number.isFinite(raw)) {
    return DEFAULT_ADAPTIVE_SCORE;
  }
  return Math.min(ADAPTIVE_SCORE_MAX, Math.max(ADAPTIVE_SCORE_MIN, Math.round(raw)));
}

export function nextAdaptiveScore(current: number, correct: boolean): number {
  const base = clampAdaptiveScore(current);
  const delta = correct ? SCORE_GAIN_ON_CORRECT : -SCORE_LOSS_ON_WRONG;
  return clampAdaptiveScore(base + delta);
}

/** At 50: A heavy by default; B/C scaled down so easy words dominate. */
export function tierWeightsFromAdaptiveScore(
  score: number,
  options?: { bWeightScale?: number; cWeightScale?: number },
): Record<DifficultyTier, number> {
  const clamped = clampAdaptiveScore(score);
  const t = (clamped - DEFAULT_ADAPTIVE_SCORE) / DEFAULT_ADAPTIVE_SCORE;
  const bScale =
    typeof options?.bWeightScale === "number" && Number.isFinite(options.bWeightScale)
      ? Math.max(0, options.bWeightScale)
      : DEFAULT_B_TIER_WEIGHT_SCALE;
  const cScale =
    typeof options?.cWeightScale === "number" && Number.isFinite(options.cWeightScale)
      ? Math.max(0, options.cWeightScale)
      : DEFAULT_C_TIER_WEIGHT_SCALE;
  return {
    A: Math.max(MIN_A_TIER_WEIGHT, 1 - ADAPTIVE_TIER_SKEW * t),
    B: Math.max(MIN_TIER_WEIGHT, 1 * bScale),
    C: Math.max(MIN_TIER_WEIGHT, (1 + ADAPTIVE_TIER_SKEW * t) * cScale),
  };
}

/** Default web quiz: B less often, C much less often. */
export const DEFAULT_B_TIER_WEIGHT_SCALE = 0.32;
export const DEFAULT_C_TIER_WEIGHT_SCALE = 0.12;

/** Studio: B a bit less, C even rarer. */
export const STUDIO_B_TIER_WEIGHT_SCALE = 0.28;
/** @deprecated use STUDIO + DEFAULT scales via pick options */
export const STUDIO_C_TIER_WEIGHT_SCALE = 0.08;

export function pickTierByAdaptiveScore(
  score: number,
  options?: { bWeightScale?: number; cWeightScale?: number },
): DifficultyTier {
  const weights = tierWeightsFromAdaptiveScore(score, options);
  const total = weights.A + weights.B + weights.C;
  let roll = Math.random() * total;
  for (const tier of DIFFICULTY_TIER_IDS) {
    roll -= weights[tier];
    if (roll <= 0) return tier;
  }
  return "B";
}

export function pickUnderfilledDifficultyBucket(
  counts: number[],
  minBucketIndex = 0,
): number {
  const start = Math.min(
    Math.max(0, minBucketIndex),
    DIFFICULTY_TIERS.length - 1,
  );
  const slice = counts.slice(start);
  const min = Math.min(...slice);
  const candidates = slice
    .map((count, offset) => (count === min ? start + offset : -1))
    .filter((index) => index >= 0);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? start;
}

export function pickTargetDifficultyFromCounts(
  counts: number[],
  minBucketIndex = 0,
): DifficultyTier {
  const bucketIndex = pickUnderfilledDifficultyBucket(counts, minBucketIndex);
  return DIFFICULTY_TIERS[bucketIndex]?.id ?? "B";
}

/** Balance tiers and return the least-filled tier id — mutates counts. */
export function pickDifficultyForNewItem(
  bucketCounts: number[],
  options?: PickDifficultyOptions,
): DifficultyTier {
  const minBucketIndex = options?.minBucketIndex ?? 0;
  const bucketIndex = pickUnderfilledDifficultyBucket(bucketCounts, minBucketIndex);
  bucketCounts[bucketIndex] = (bucketCounts[bucketIndex] ?? 0) + 1;
  return DIFFICULTY_TIERS[bucketIndex]?.id ?? "B";
}
