/**
 * Topic quiz: Particles drill (조사)
 * - Focus: 은/는, 이/가, 을/를, 에/에서, 와/과
 * - Keeps item types simple and renderer-friendly: mcq / cloze / short_answer / true_false
 */

import type {
  AssessmentItem,
  ClozeItem,
  Exam,
  MCQItem,
  ShortAnswerItem,
  TrueFalseItem,
} from "@/types/exam";

const EXAM_ID = "exam-topic-particles-01";
const SECTION_ID = "section-topic-particles-01";

const ITEM_IDS = {
  mcq_topic: "item-topic-particles-01-mcq-topic",
  mcq_subject: "item-topic-particles-01-mcq-subject",
  mcq_object: "item-topic-particles-01-mcq-object",
  cloze_place: "item-topic-particles-01-cloze-place",
  cloze_from_to: "item-topic-particles-01-cloze-from-to",
  short_pair: "item-topic-particles-01-short-pair",
  tf_rule: "item-topic-particles-01-tf-rule",
} as const;

export const particlesQuiz01Items: AssessmentItem[] = [
  {
    id: ITEM_IDS.mcq_topic,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct particle: 저는 학생___." },
    },
    interaction: {
      options: [
        { id: "opt-eun", text: { default: "은" } },
        { id: "opt-neun", text: { default: "는" } },
        { id: "opt-i", text: { default: "이" } },
        { id: "opt-ga", text: { default: "가" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-neun" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq_subject,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct subject particle: 사과___ 맛있어요." },
    },
    interaction: {
      options: [
        { id: "opt-eun", text: { default: "은" } },
        { id: "opt-neun", text: { default: "는" } },
        { id: "opt-i", text: { default: "이" } },
        { id: "opt-ga", text: { default: "가" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-ga" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq_object,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct object particle: 커피___ 마셔요." },
    },
    interaction: {
      options: [
        { id: "opt-reul", text: { default: "를" } },
        { id: "opt-eul", text: { default: "을" } },
        { id: "opt-e", text: { default: "에" } },
        { id: "opt-eseo", text: { default: "에서" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-reul" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.cloze_place,
    type: "cloze",
    level: "A2",
    skill: "grammar",
    stem: {
      instruction: {
        default:
          "Fill in the blanks with 에 / 에서.\n\n저는 집___ 공부해요. 내일 학교___ 가요.",
      },
    },
    interaction: {
      blanks: [
        { id: "b1", label: "1", options: ["에", "에서"] },
        { id: "b2", label: "2", options: ["에", "에서"] },
      ],
    },
    scoring: {
      points: 2,
      autoGrade: true,
      key: {
        kind: "cloze",
        answersByBlankId: { b1: ["에서"], b2: ["에"] },
      },
    },
  } as ClozeItem,

  {
    id: ITEM_IDS.cloze_from_to,
    type: "cloze",
    level: "A2",
    skill: "grammar",
    stem: {
      instruction: {
        default:
          "Fill in the blanks with 에서 / 까지.\n\n집___ 회사___ 지하철로 가요.",
      },
    },
    interaction: {
      blanks: [
        { id: "b1", label: "1", options: ["에서", "까지"] },
        { id: "b2", label: "2", options: ["에서", "까지"] },
      ],
    },
    scoring: {
      points: 2,
      autoGrade: true,
      key: {
        kind: "cloze",
        answersByBlankId: { b1: ["에서"], b2: ["까지"] },
      },
    },
  } as ClozeItem,

  {
    id: ITEM_IDS.short_pair,
    type: "short_answer",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: {
        default:
          "Write BOTH correct particles (2 chars total) for this pattern:\n\n책___ 읽어요. (object)\n저___ 학생이에요. (topic)",
      },
    },
    interaction: {
      placeholder: { default: "예: 를는" },
      inputMode: "hangul",
      maxLength: 6,
    },
    scoring: {
      points: 2,
      autoGrade: true,
      key: {
        kind: "short_answer",
        accepted: ["을는", "를는"],
        normalize: { trim: true, collapseSpaces: true },
      },
    },
  } as ShortAnswerItem,

  {
    id: ITEM_IDS.tf_rule,
    type: "true_false",
    level: "A1",
    skill: "grammar",
    stem: { instruction: { default: "True or False?" } },
    interaction: {
      statement: {
        default:
          "After a consonant, the object particle is “을”, and after a vowel, it is “를”.",
      },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "true_false", correct: true },
    },
  } as TrueFalseItem,
];

export const particlesQuiz01Exam: Exam = {
  id: EXAM_ID,
  slug: "particles-01",
  title: "Particles Drill 01 (조사)",
  description: "Practice core Korean particles with short drills.",
  kind: "topic_quiz",
  uiLocale: "en",
  blueprint: {
    timeLimitSec: 900,
    sections: [
      {
        id: SECTION_ID,
        title: "Particles",
        description: "은/는, 이/가, 을/를, 에/에서",
        shuffleItems: true,
        source: {
          type: "explicit",
          itemIds: [
            ITEM_IDS.mcq_topic,
            ITEM_IDS.mcq_subject,
            ITEM_IDS.mcq_object,
            ITEM_IDS.cloze_place,
            ITEM_IDS.cloze_from_to,
            ITEM_IDS.short_pair,
            ITEM_IDS.tf_rule,
          ],
        },
      },
    ],
    gradingRule: {
      showPercent: true,
      bands: [
        { label: "Needs review", minScoreInclusive: 0 },
        { label: "Good", minScoreInclusive: 6 },
        { label: "Great", minScoreInclusive: 8 },
      ],
    },
  },
  createdAt: "2026-03-16T00:00:00Z",
  updatedAt: "2026-03-16T00:00:00Z",
  version: 1,
};

