/**
 * Client-side grading for exam attempts.
 * Uses scoring keys from AssessmentItem and placement rules from ExamBlueprint.
 */

import type {
  AssessmentItem,
  Attempt,
  AttemptGrading,
  ItemResponse,
  PlacementRule,
  MCQKey,
  MultiSelectKey,
  ShortAnswerKey,
  TrueFalseKey,
  ID,
} from "@/types/exam";

function normalizeShortAnswer(
  text: string,
  opts?: { trim?: boolean; collapseSpaces?: boolean; caseFold?: boolean }
): string {
  let s = text;
  if (opts?.trim) s = s.trim();
  if (opts?.collapseSpaces) s = s.replace(/\s+/g, " ");
  if (opts?.caseFold) s = s.toLowerCase();
  return s;
}

function gradeItem(
  item: AssessmentItem,
  response: ItemResponse | undefined
): { earned: number; max: number; correct: boolean } {
  const max = item.scoring.points;
  if (!response) return { earned: 0, max, correct: false };

  switch (item.type) {
    case "mcq":
    case "audio_mcq": {
      if (response.type !== "mcq" && response.type !== "audio_mcq") break;
      const key = item.scoring.key as MCQKey;
      const correct = response.optionId === key.correctOptionId;
      return { earned: correct ? max : 0, max, correct };
    }
    case "multi_select": {
      if (response.type !== "multi_select") break;
      const key = item.scoring.key as MultiSelectKey;
      const correctIds = new Set(key.correctOptionIds);
      const chosen = new Set(response.optionIds);
      let earned = 0;
      if (correctIds.size === 0) break;
      const hit = [...chosen].filter((id) => correctIds.has(id)).length;
      const miss = [...chosen].filter((id) => !correctIds.has(id)).length;
      const penalty = key.wrongPenalty ?? 0;
      earned = Math.max(
        0,
        (hit / correctIds.size) * max - miss * penalty * (max / correctIds.size)
      );
      const correct = miss === 0 && hit === correctIds.size;
      return { earned: Math.round(earned * 100) / 100, max, correct };
    }
    case "short_answer": {
      if (response.type !== "short_answer") break;
      const key = item.scoring.key as ShortAnswerKey;
      const norm = normalizeShortAnswer(response.text, key.normalize);
      const accepted = key.accepted.map((a) =>
        normalizeShortAnswer(a, key.normalize)
      );
      const correct = accepted.some((a) => a === norm);
      return { earned: correct ? max : 0, max, correct };
    }
    case "true_false": {
      if (response.type !== "true_false") break;
      const key = item.scoring.key as TrueFalseKey;
      const correct = response.value === key.correct;
      return { earned: correct ? max : 0, max, correct };
    }
    default:
      return { earned: 0, max, correct: false };
  }
  return { earned: 0, max, correct: false };
}

export function gradeAttempt(
  attempt: Attempt,
  itemsMap: Map<ID, AssessmentItem>,
  placementRule?: PlacementRule | null
): AttemptGrading {
  let totalPoints = 0;
  let earnedPoints = 0;
  const byItem: AttemptGrading["byItem"] = {};

  for (const [itemId, item] of itemsMap) {
    const resp = attempt.responses[itemId];
    const { earned, max, correct } = gradeItem(item, resp);
    totalPoints += max;
    earnedPoints += earned;
    byItem[itemId] = { earned, max, correct };
  }

  const percent =
    totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  let placement: AttemptGrading["placement"] | undefined;
  if (placementRule?.byTotalPercent?.length && percent >= 0) {
    const sorted = [...placementRule.byTotalPercent].sort(
      (a, b) => b.minInclusive - a.minInclusive
    );
    for (const band of sorted) {
      if (percent >= band.minInclusive) {
        placement = { level: band.level };
        break;
      }
    }
  }

  let bandLabel: string | undefined;
  if (placement) bandLabel = placement.level;

  return {
    totalPoints,
    earnedPoints,
    percent,
    placement,
    byItem,
    bandLabel,
  };
}
