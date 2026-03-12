/**
 * Placement exam
 * - Broader coverage from A0 to B2
 * - More stable score distribution
 * - Still uses only safe item types already proven in the current renderer:
 *   mcq / short_answer / true_false
 */

import type {
  Exam,
  AssessmentItem,
  MCQItem,
  ShortAnswerItem,
  TrueFalseItem,
} from "@/types/exam";

const EXAM_ID = "exam-placement-02";
const SECTION_ID_BASICS = "section-placement-basics-01";
const SECTION_ID_GRAMMAR = "section-placement-grammar-01";
const SECTION_ID_READING = "section-placement-reading-01";

const ITEM_IDS = {
  // Basics
  mcq1: "item-placement-basics-mcq1",
  mcq2: "item-placement-basics-mcq2",
  mcq3: "item-placement-basics-mcq3",
  mcq4: "item-placement-basics-mcq4",
  short1: "item-placement-basics-short1",
  short2: "item-placement-basics-short2",

  // Grammar
  mcq5: "item-placement-grammar-mcq5",
  mcq6: "item-placement-grammar-mcq6",
  mcq7: "item-placement-grammar-mcq7",
  mcq8: "item-placement-grammar-mcq8",
  mcq9: "item-placement-grammar-mcq9",
  tf1: "item-placement-grammar-tf1",
  tf2: "item-placement-grammar-tf2",
  short3: "item-placement-grammar-short3",

  // Reading / interpretation
  mcq10: "item-placement-reading-mcq10",
  mcq11: "item-placement-reading-mcq11",
  mcq12: "item-placement-reading-mcq12",
  tf3: "item-placement-reading-tf3",
} as const;

export const placementExamItems: AssessmentItem[] = [
  /**
   * SECTION 1: Basics (A0~A1)
   */
  {
    id: ITEM_IDS.mcq1,
    type: "mcq",
    level: "A0",
    skill: "vocab",
    stem: {
      instruction: { default: "What does “안녕하세요” mean?" },
    },
    interaction: {
      options: [
        { id: "opt-hello", text: { default: "Hello" } },
        { id: "opt-goodnight", text: { default: "Good night" } },
        { id: "opt-thanks", text: { default: "Thank you" } },
        { id: "opt-sorry", text: { default: "Sorry" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-hello" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq2,
    type: "mcq",
    level: "A0",
    skill: "vocab",
    stem: {
      instruction: { default: "Choose the correct meaning of “학생”." },
    },
    interaction: {
      options: [
        { id: "opt-teacher", text: { default: "teacher" } },
        { id: "opt-student", text: { default: "student" } },
        { id: "opt-friend", text: { default: "friend" } },
        { id: "opt-office", text: { default: "office" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-student" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq3,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct particle: 저는 한국___ 살아요." },
    },
    interaction: {
      options: [
        { id: "opt-e", text: { default: "에" } },
        { id: "opt-reul", text: { default: "를" } },
        { id: "opt-eun", text: { default: "은" } },
        { id: "opt-wa", text: { default: "와" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-e" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq4,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the natural sentence." },
    },
    interaction: {
      options: [
        { id: "opt-1", text: { default: "저는 아침에 밥을 먹어요." } },
        { id: "opt-2", text: { default: "저는 아침에 밥이 먹어요." } },
        { id: "opt-3", text: { default: "저는 아침에 밥에 먹어요." } },
        { id: "opt-4", text: { default: "저는 아침에 밥은 먹어요." } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-1" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.short1,
    type: "short_answer",
    level: "A0",
    skill: "vocab",
    stem: {
      instruction: { default: 'Write “water” in Korean (one word).' },
    },
    interaction: {
      placeholder: { default: "Type in Korean..." },
      inputMode: "hangul",
      maxLength: 10,
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: {
        kind: "short_answer",
        accepted: ["물"],
        normalize: { trim: true, collapseSpaces: true },
      },
    },
  } as ShortAnswerItem,

  {
    id: ITEM_IDS.short2,
    type: "short_answer",
    level: "A1",
    skill: "vocab",
    stem: {
      instruction: { default: 'Write “teacher” in Korean (one word).' },
    },
    interaction: {
      placeholder: { default: "Type in Korean..." },
      inputMode: "hangul",
      maxLength: 10,
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: {
        kind: "short_answer",
        accepted: ["선생님"],
        normalize: { trim: true, collapseSpaces: true },
      },
    },
  } as ShortAnswerItem,

  /**
   * SECTION 2: Grammar (A1~B1)
   */
  {
    id: ITEM_IDS.mcq5,
    type: "mcq",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Choose the correct ending: 지금 숙제하___." },
    },
    interaction: {
      options: [
        { id: "opt-go", text: { default: "고 있어요" } },
        { id: "opt-get", text: { default: "겠어요" } },
        { id: "opt-seyo", text: { default: "세요" } },
        { id: "opt-neyo", text: { default: "네요" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-go" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq6,
    type: "mcq",
    level: "A2",
    skill: "grammar",
    stem: {
      instruction: {
        default: "Choose the best connector: 비가 왔어요. ___ 우산을 가져갔어요.",
      },
    },
    interaction: {
      options: [
        { id: "opt-and", text: { default: "그래서" } },
        { id: "opt-but", text: { default: "하지만" } },
        { id: "opt-or", text: { default: "아니면" } },
        { id: "opt-then", text: { default: "그리고" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-and" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq7,
    type: "mcq",
    level: "A2",
    skill: "grammar",
    stem: {
      instruction: {
        default: "Choose the correct form: 시간이 없___ 택시를 탔어요.",
      },
    },
    interaction: {
      options: [
        { id: "opt-neunde", text: { default: "는데" } },
        { id: "opt-seo", text: { default: "어서" } },
        { id: "opt-jiman", text: { default: "지만" } },
        { id: "opt-go", text: { default: "고" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-seo" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq8,
    type: "mcq",
    level: "B1",
    skill: "grammar",
    stem: {
      instruction: {
        default: "Choose the most natural sentence.",
      },
    },
    interaction: {
      options: [
        { id: "opt-1", text: { default: "한국에 오기 전에 한국어를 조금 배웠어요." } },
        { id: "opt-2", text: { default: "한국에 오기 전에는 한국어를 조금 배우고 있어요." } },
        { id: "opt-3", text: { default: "한국에 오기 전에 한국어를 조금 배우겠어요." } },
        { id: "opt-4", text: { default: "한국에 오기 전에 한국어를 조금 배우세요." } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-1" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq9,
    type: "mcq",
    level: "B1",
    skill: "grammar",
    stem: {
      instruction: {
        default:
          "Choose the best expression: 내일 중요한 시험이 있어서 오늘은 일찍 ___.",
      },
    },
    interaction: {
      options: [
        { id: "opt-sleep", text: { default: "잘 거예요" } },
        { id: "opt-slept", text: { default: "잤어요" } },
        { id: "opt-sleeping", text: { default: "자고 있어요" } },
        { id: "opt-sleeped", text: { default: "잘래요 어제" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-sleep" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.tf1,
    type: "true_false",
    level: "A1",
    skill: "grammar",
    stem: {
      instruction: { default: "Is the following statement true or false?" },
    },
    interaction: {
      statement: {
        default:
          "In Korean, the topic particle after a consonant is “은” and after a vowel is “는”.",
      },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "true_false", correct: true },
    },
  } as TrueFalseItem,

  {
    id: ITEM_IDS.tf2,
    type: "true_false",
    level: "B1",
    skill: "grammar",
    stem: {
      instruction: { default: "Is the following statement true or false?" },
    },
    interaction: {
      statement: {
        default:
          "The expression “-고 싶어요” is commonly used to talk about what the speaker wants to do.",
      },
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "true_false", correct: true },
    },
  } as TrueFalseItem,

  {
    id: ITEM_IDS.short3,
    type: "short_answer",
    level: "A2",
    skill: "grammar",
    stem: {
      instruction: {
        default:
          'Fill in the blank with one Korean word: 어제는 피곤해서 집에서 ___.',
      },
    },
    interaction: {
      placeholder: { default: "Type one verb phrase..." },
      inputMode: "hangul",
      maxLength: 20,
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: {
        kind: "short_answer",
        accepted: ["쉬었어요", "잤어요"],
        normalize: { trim: true, collapseSpaces: true },
      },
    },
  } as ShortAnswerItem,

  /**
   * SECTION 3: Reading / interpretation (A2~B2)
   */
  {
    id: ITEM_IDS.mcq10,
    type: "mcq",
    level: "A2",
    skill: "reading",
    stem: {
      instruction: {
        default:
          "Read and choose the correct answer.\n\n저는 주말마다 도서관에 갑니다. 책을 읽거나 숙제를 합니다. 가끔 친구도 만납니다.\n\nWhere does the speaker usually go on weekends?",
      },
    },
    interaction: {
      options: [
        { id: "opt-library", text: { default: "The library" } },
        { id: "opt-school", text: { default: "The school" } },
        { id: "opt-hospital", text: { default: "The hospital" } },
        { id: "opt-office", text: { default: "The office" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-library" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq11,
    type: "mcq",
    level: "B1",
    skill: "reading",
    stem: {
      instruction: {
        default:
          "Read and choose the best answer.\n\n민수 씨는 회사가 멀어서 매일 아침 6시에 일어납니다. 원래 아침을 잘 안 먹었지만, 요즘은 건강 때문에 꼭 먹으려고 합니다.\n\nWhy does Minsu try to eat breakfast these days?",
      },
    },
    interaction: {
      options: [
        { id: "opt-health", text: { default: "Because of his health" } },
        { id: "opt-price", text: { default: "Because breakfast is cheap" } },
        { id: "opt-boss", text: { default: "Because his boss told him to" } },
        { id: "opt-friends", text: { default: "Because his friends asked him to" } },
      ],
    },
    scoring: {
      points: 1,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-health" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.mcq12,
    type: "mcq",
    level: "B2",
    skill: "reading",
    stem: {
      instruction: {
        default:
          "Read and choose the most appropriate answer.\n\n최근에는 직접 가게에 가지 않아도 휴대전화로 필요한 물건을 쉽게 주문할 수 있습니다. 그래서 편리하다고 생각하는 사람도 많지만, 충동적으로 소비하게 된다는 걱정을 하는 사람도 있습니다.\n\nWhat is the main idea of the passage?",
      },
    },
    interaction: {
      options: [
        {
          id: "opt-balance",
          text: {
            default:
              "Mobile shopping is convenient, but it may also encourage impulsive spending.",
          },
        },
        {
          id: "opt-only-good",
          text: { default: "Mobile shopping is always better than offline shopping." },
        },
        {
          id: "opt-no-one-uses",
          text: { default: "People no longer use physical stores at all." },
        },
        {
          id: "opt-phone-history",
          text: { default: "The passage explains the history of smartphones." },
        },
      ],
    },
    scoring: {
      points: 2,
      autoGrade: true,
      key: { kind: "mcq", correctOptionId: "opt-balance" },
    },
  } as MCQItem,

  {
    id: ITEM_IDS.tf3,
    type: "true_false",
    level: "B2",
    skill: "reading",
    stem: {
      instruction: {
        default:
          "Read and decide whether the statement is true or false.\n\n요즘은 재택근무를 하는 사람들이 늘어나면서 출퇴근 시간이 줄어들었다. 그러나 모든 사람이 재택근무를 선호하는 것은 아니다. 어떤 사람들은 집에서 일하면 집중하기 어렵다고 느낀다.",
      },
    },
    interaction: {
      statement: {
        default:
          "Everyone prefers working from home because commuting time is shorter.",
      },
    },
    scoring: {
      points: 2,
      autoGrade: true,
      key: { kind: "true_false", correct: false },
    },
  } as TrueFalseItem,
];

export const placementExam: Exam = {
  id: EXAM_ID,
  slug: "placement",
  title: "Placement Test",
  description: "A broader assessment to estimate your Korean level from A0 to B2.",
  kind: "placement",
  uiLocale: "en",
  blueprint: {
    timeLimitSec: 1200, // 20 min
    sections: [
      {
        id: SECTION_ID_BASICS,
        title: "Part 1",
        description: "Basic vocabulary and beginner grammar",
        shuffleItems: false,
        source: {
          type: "explicit",
          itemIds: [
            ITEM_IDS.mcq1,
            ITEM_IDS.mcq2,
            ITEM_IDS.mcq3,
            ITEM_IDS.mcq4,
            ITEM_IDS.short1,
            ITEM_IDS.short2,
          ],
        },
      },
      {
        id: SECTION_ID_GRAMMAR,
        title: "Part 2",
        description: "Grammar and sentence control",
        shuffleItems: false,
        source: {
          type: "explicit",
          itemIds: [
            ITEM_IDS.mcq5,
            ITEM_IDS.mcq6,
            ITEM_IDS.mcq7,
            ITEM_IDS.mcq8,
            ITEM_IDS.mcq9,
            ITEM_IDS.tf1,
            ITEM_IDS.tf2,
            ITEM_IDS.short3,
          ],
        },
      },
      {
        id: SECTION_ID_READING,
        title: "Part 3",
        description: "Reading and meaning interpretation",
        shuffleItems: false,
        source: {
          type: "explicit",
          itemIds: [
            ITEM_IDS.mcq10,
            ITEM_IDS.mcq11,
            ITEM_IDS.mcq12,
            ITEM_IDS.tf3,
          ],
        },
      },
    ],
    placementRule: {
      byTotalPercent: [
        { minInclusive: 85, level: "B2" },
        { minInclusive: 68, level: "B1" },
        { minInclusive: 50, level: "A2" },
        { minInclusive: 30, level: "A1" },
        { minInclusive: 0, level: "A0" },
      ],
    },
    gradingRule: {
      showPercent: true,
      bands: [
        { label: "A0", minScoreInclusive: 0 },
        { label: "A1", minScoreInclusive: 5 },
        { label: "A2", minScoreInclusive: 9 },
        { label: "B1", minScoreInclusive: 13 },
        { label: "B2", minScoreInclusive: 17 },
      ],
    },
  },
  createdAt: "2026-03-13T00:00:00Z",
  updatedAt: "2026-03-13T00:00:00Z",
  version: 2,
};