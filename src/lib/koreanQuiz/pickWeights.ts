/** Recent wrong — boost re-selection. */
export const WRONG_REPEAT_WEIGHT = 3;

/** Each prior correct on this device multiplies weight by this factor. */
export const CORRECT_WEIGHT_FACTOR = 1 / 3;

export const BASE_PICK_WEIGHT = 1;

/** Served quiz IDs in this window cannot be picked again. */
export const QUIZ_REAPPEAR_COOLDOWN = 10;

export function quizPickWeight(params: {
  quizId: string;
  wrongIds: Set<string>;
  correctCount: number;
}): number {
  if (params.wrongIds.has(params.quizId)) {
    return WRONG_REPEAT_WEIGHT;
  }
  const n = Math.max(0, params.correctCount);
  if (n === 0) return BASE_PICK_WEIGHT;
  return BASE_PICK_WEIGHT * Math.pow(CORRECT_WEIGHT_FACTOR, n);
}

export function pickWeightedRandom<T>(
  items: T[],
  weightOf: (item: T) => number,
): T | null {
  if (items.length === 0) return null;
  let total = 0;
  const weights = items.map((item) => {
    const w = weightOf(item);
    const safe = Number.isFinite(w) && w > 0 ? w : 0;
    total += safe;
    return safe;
  });
  if (total <= 0) {
    return items[Math.floor(Math.random() * items.length)] ?? null;
  }
  let roll = Math.random() * total;
  for (let i = 0; i < items.length; i += 1) {
    roll -= weights[i]!;
    if (roll <= 0) return items[i]!;
  }
  return items[items.length - 1] ?? null;
}
