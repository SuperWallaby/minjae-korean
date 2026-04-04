/**
 * Exam hub: Check my level  Beginners ~ intermediate , level tests, mock TOPIK.
 * Uses types from @/app/exams/interface.
 */

import type { Exam, ExamKind, Level } from "@/types/exam";
import examsCovers from "./examsCovers.json";

/** Slug -> cover image URL (managed via admin /api/admin/exams/covers) */
const COVERS = examsCovers as Record<string, string>;

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
  // { slug: "a1-01", kind: "level_test", title: "A1 Level Test 01", targetLevel: "A1" },
  // { slug: "a2-01", kind: "level_test", title: "A2 Level Test 01", targetLevel: "A2" },
];

/** Topic quizzes (e.g. particles, honorifics). */
export const TOPIC_QUIZ_SLUGS: ExamSummary[] = [
  {
    slug: "particles-01",
    kind: "topic_quiz",
    title: "Particles Drill 01 (조사)",
    description: "은/는, 이/가, 을/를, 에/에서 집중 연습",
  },
];

/** Mock TOPIK slugs. Extend as you add exams. */
export const MOCK_EXAM_SLUGS: ExamSummary[] = [
  // { slug: "topik-i-01", kind: "mock_topik", title: "TOPIK I Mock 01", description: "Practice TOPIK I format." },
  // { slug: "topik-ii-01", kind: "mock_topik", title: "TOPIK II Mock 01", description: "Practice TOPIK II format." },
];

export function getPlacementSummary(): ExamSummary {
  const base: ExamSummary = {
    slug: PLACEMENT_SLUG,
    kind: "placement",
    title: "Check my level  Beginners ~ intermediate ",
    description: "Find your level with a short assessment.",
    imageThumb: undefined,
  };
  const url = COVERS[PLACEMENT_SLUG];
  return { ...base, imageThumb: url?.trim() || undefined };
}

export function getLevelExamSummaries(): ExamSummary[] {
  return LEVEL_EXAM_SLUGS.map((e) => ({
    ...e,
    imageThumb: COVERS[e.slug]?.trim() || e.imageThumb,
  }));
}

export function getMockExamSummaries(): ExamSummary[] {
  return MOCK_EXAM_SLUGS.map((e) => ({
    ...e,
    imageThumb: COVERS[e.slug]?.trim() || e.imageThumb,
  }));
}

export function getTopicQuizSummaries(): ExamSummary[] {
  return TOPIC_QUIZ_SLUGS.map((e) => ({
    ...e,
    imageThumb: COVERS[e.slug]?.trim() || e.imageThumb,
  }));
}

export function getLevelExamSummary(slug: string): ExamSummary | null {
  return getLevelExamSummaries().find((e) => e.slug === slug) ?? null;
}

export function getTopicQuizSummary(slug: string): ExamSummary | null {
  return getTopicQuizSummaries().find((e) => e.slug === slug) ?? null;
}

export function getMockExamSummary(slug: string): ExamSummary | null {
  return getMockExamSummaries().find((e) => e.slug === slug) ?? null;
}

/** Full exam by kind + slug. Placement uses static data; others return null until wired. */
export async function getExam(
  kind: "placement" | "level_test" | "topic_quiz" | "mock_topik",
  slug: string
): Promise<Exam | null> {
  if (kind === "placement" && slug === PLACEMENT_SLUG) {
    const { placementExam } = await import("@/data/exams/placementExam");
    return placementExam;
  }
  if (kind === "topic_quiz" && getTopicQuizSummary(slug)) {
    if (slug === "particles-01") {
      const { particlesQuiz01Exam } = await import("./exams/particlesQuiz01");
      return particlesQuiz01Exam;
    }
    return null;
  }
  if (kind === "level_test" && getLevelExamSummary(slug)) return null;
  if (kind === "mock_topik" && getMockExamSummary(slug)) return null;
  return null;
}

const AUDIO_OVERRIDES_PATH = "src/data/examsItemAudioOverrides.json";

async function loadAudioOverrides(): Promise<Record<string, string>> {
  try {
    const { readFile } = await import("fs/promises");
    const { join } = await import("path");
    const path = join(process.cwd(), AUDIO_OVERRIDES_PATH);
    const raw = await readFile(path, "utf-8");
    return (JSON.parse(raw) as Record<string, string>) ?? {};
  } catch {
    return {};
  }
}

/** Items for an exam (e.g. placement uses static bank). Returns empty array if none. Merges audio overrides for dictation/audio_mcq. */
export async function getExamItems(
  kind: "placement" | "level_test" | "topic_quiz" | "mock_topik",
  slug: string
): Promise<import("@/types/exam").AssessmentItem[]> {
  let items: import("@/types/exam").AssessmentItem[] = [];
  if (kind === "placement" && slug === PLACEMENT_SLUG) {
    const { placementExamItems } = await import("@/data/exams/placementExam");
    items = placementExamItems;
  }
  if (kind === "topic_quiz" && slug === "particles-01") {
    const { particlesQuiz01Items } = await import("./exams/particlesQuiz01");
    items = particlesQuiz01Items;
  }
  const overrides = await loadAudioOverrides();
  if (Object.keys(overrides).length === 0) return items;
  return items.map((item) => {
    const url = overrides[item.id]?.trim();
    if (!url) return item;
    if (item.type === "dictation") {
      return {
        ...item,
        interaction: { ...item.interaction, audio: { id: item.id, kind: "audio" as const, url } },
      };
    }
    if (item.type === "audio_mcq") {
      return {
        ...item,
        interaction: { ...item.interaction, audio: { id: item.id, kind: "audio" as const, url } },
      };
    }
    return item;
  });
}
