/**
 * Example placement exam: a few items to demonstrate the exam engine.
 * Used by getExam("placement", "placement") and getExamItems().
 */

import type {
  Exam,
  AssessmentItem,
  MCQItem,
  ShortAnswerItem,
  TrueFalseItem,
} from "@/types/exam";

const EXAM_ID = "exam-placement-01";
const SECTION_ID = "section-placement-01";

const ITEM_IDS = {
  mcq1: "item-placement-mcq1",
  mcq2: "item-placement-mcq2",
  short1: "item-placement-short1",
  trueFalse1: "item-placement-tf1",
} as const;

/** Items for this exam (inline bank) */
export const placementExamItems: AssessmentItem[] = [
  {
    id: ITEM_IDS.mcq1,
    type: "mcq",
    level: "A0",
    skill: "vocab",
    stem: {
      instruction: { default: "What does “안녕하세요” mean?" },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-hello" },
    },
    interaction: {
      options: [
        { id: "opt-hello", text: { default: "Hello" } },
        { id: "opt-bye", text: { default: "Goodbye" } },
        { id: "opt-thanks", text: { default: "Thank you" } },
      ],
    },
  } as MCQItem,
  {
    id: ITEM_IDS.mcq2,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct particle: 저___ 학교에 가요." },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-eun" },
    },
    interaction: {
      options: [
        { id: "opt-eun", text: { default: "는" } },
        { id: "opt-eul", text: { default: "를" } },
        { id: "opt-e", text: { default: "에" } },
      ],
    },
  } as MCQItem,
  {
    id: ITEM_IDS.short1,
    type: "short_answer",
    level: "A0",
    skill: "vocab",
    stem: {
      instruction: { default: "Write “water” in Korean (one word)." },
    },
    interaction: {
      placeholder: { default: "Type here..." },
      inputMode: "hangul",
      maxLength: 10,
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: {
        kind: "short_answer",
        accepted: ["물", "물 "],
        normalize: { trim: true, collapseSpaces: true },
      },
    },
  } as ShortAnswerItem,
  {
    id: ITEM_IDS.trueFalse1,
    type: "true_false",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Is the following statement true or false?" },
    },
    interaction: {
      statement: {
        default:
          "In Korean, the subject particle after a consonant is “이” and after a vowel is “가”.",
      },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "true_false", correct: true },
    },
  } as TrueFalseItem,
];

/** Placement exam definition */
export const placementExam: Exam = {
  id: EXAM_ID,
  slug: "placement",
  title: "Placement (등급 받기)",
  description: "A short assessment to find your level (A0–B2).",
  kind: "placement",
  uiLocale: "en",
  blueprint: {
    timeLimitSec: 600, // 10 min
    sections: [
      {
        id: SECTION_ID,
        title: "Part 1",
        description: "Vocabulary and grammar",
        shuffleItems: false,
        source: {
          type: "explicit",
          itemIds: [
            ITEM_IDS.mcq1,
            ITEM_IDS.mcq2,
            ITEM_IDS.short1,
            ITEM_IDS.trueFalse1,
          ],
        },
      },
    ],
    placementRule: {
      byTotalPercent: [
        { minInclusive: 75, level: "B2" },
        { minInclusive: 60, level: "B1" },
        { minInclusive: 45, level: "A2" },
        { minInclusive: 30, level: "A1" },
        { minInclusive: 0, level: "A0" },
      ],
    },
    gradingRule: {
      showPercent: true,
      bands: [
        { label: "A0", minScoreInclusive: 0 },
        { label: "A1", minScoreInclusive: 1 },
        { label: "A2", minScoreInclusive: 2 },
        { label: "B1", minScoreInclusive: 3 },
        { label: "B2", minScoreInclusive: 4 },
      ],
    },
  },
  createdAt: "2026-02-27T00:00:00Z",
  updatedAt: "2026-02-27T00:00:00Z",
  version: 1,
};
