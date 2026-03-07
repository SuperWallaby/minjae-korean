/**
 * Exam hub: placement (등급 받기), level tests, mock TOPIK.
 * Uses types from @/app/exams/interface.
 */

import type { Exam, ExamKind, Level } from "@/types/exam";

/** Slug-only summary for hub listing */
export type ExamSummary = {
  slug: string;
  kind: ExamKind;
  title: string;
  description?: string;
  targetLevel?: Level;
  /** Thumbnail image URL for hub card (optional, fill in later) */
  imageThumb?: string;
};

/** Placement exam: single fixed slug "placement" */
export const PLACEMENT_SLUG = "placement";

/** Level exam slugs (e.g. a1-01, a2-01). Extend as you add exams. */
export const LEVEL_EXAM_SLUGS: ExamSummary[] = [
  { slug: "a1-01", kind: "level_test", title: "A1 Level Test 01", targetLevel: "A1" },
  { slug: "a2-01", kind: "level_test", title: "A2 Level Test 01", targetLevel: "A2" },
];

/** Mock TOPIK slugs. Extend as you add exams. */
export const MOCK_EXAM_SLUGS: ExamSummary[] = [
  { slug: "topik-i-01", kind: "mock_topik", title: "TOPIK I Mock 01", description: "Practice TOPIK I format." },
  { slug: "topik-ii-01", kind: "mock_topik", title: "TOPIK II Mock 01", description: "Practice TOPIK II format." },
];

export function getPlacementSummary(): ExamSummary {
  return {
    slug: PLACEMENT_SLUG,
    kind: "placement",
    title: "Placement (등급 받기)",
    description: "Find your level with a short assessment.",
    imageThumb: undefined,
  };
}

export function getLevelExamSummary(slug: string): ExamSummary | null {
  return LEVEL_EXAM_SLUGS.find((e) => e.slug === slug) ?? null;
}

export function getMockExamSummary(slug: string): ExamSummary | null {
  return MOCK_EXAM_SLUGS.find((e) => e.slug === slug) ?? null;
}

/** Full exam by kind + slug. Placement uses static data; others return null until wired. */
export async function getExam(
  kind: "placement" | "level_test" | "mock_topik",
  slug: string
): Promise<Exam | null> {
  if (kind === "placement" && slug === PLACEMENT_SLUG) {
    const { placementExam } = await import("@/data/exams/placementExam");
    return placementExam;
  }
  if (kind === "level_test" && getLevelExamSummary(slug)) return null;
  if (kind === "mock_topik" && getMockExamSummary(slug)) return null;
  return null;
}

/** Items for an exam (e.g. placement uses static bank). Returns empty array if none. */
export async function getExamItems(
  kind: "placement" | "level_test" | "mock_topik",
  slug: string
): Promise<import("@/types/exam").AssessmentItem[]> {
  if (kind === "placement" && slug === PLACEMENT_SLUG) {
    const { placementExamItems } = await import("@/data/exams/placementExam");
    return placementExamItems;
  }
  return [];
}
