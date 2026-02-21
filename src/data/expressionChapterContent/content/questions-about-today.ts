import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Ask About Today",
    goal: "Ask about today naturally: what they did, ate, where they went, and how it was.",
  },
  coreFrames: [
    {
      korean: "오늘 뭐 했어요?",
      english: "What did you do today?",
      examples: ["오늘 뭐 했어요?", "오늘 하루 어땠어요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "오늘 하루 어땠어요?", english: "How was your day?", result: "오늘 하루 어땠어요?" },
            { korean: "오늘 뭐 했어요?", english: "What did you do today?", result: "오늘 뭐 했어요?" },
            { korean: "오늘 바빴어요?", english: "Were you busy today?", result: "오늘 바빴어요?" },
          ],
        },
      ],
    },
    {
      korean: "오늘 뭐 먹었어요?",
      english: "What did you eat today?",
      examples: ["오늘 뭐 먹었어요?", "점심 뭐 먹었어요?"],
      swapCategories: [
        {
          label: "끼니 (Meals)",
          items: [
            { korean: "아침 뭐 먹었어요?", english: "What did you have for breakfast?", result: "아침 뭐 먹었어요?" },
            { korean: "점심 뭐 먹었어요?", english: "What did you have for lunch?", result: "점심 뭐 먹었어요?" },
            { korean: "저녁 뭐 먹었어요?", english: "What did you have for dinner?", result: "저녁 뭐 먹었어요?" },
          ],
        },
      ],
    },
    {
      korean: "오늘 어디 갔어요?",
      english: "Where did you go today?",
      examples: ["오늘 어디 갔어요?", "오늘 밖에 나갔어요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "오늘 밖에 나갔어요?", english: "Did you go out today?", result: "오늘 밖에 나갔어요?" },
            { korean: "오늘 어디 갔어요?", english: "Where did you go today?", result: "오늘 어디 갔어요?" },
            { korean: "오늘 집에 있었어요?", english: "Were you at home today?", result: "오늘 집에 있었어요?" },
          ],
        },
      ],
    },
    {
      korean: "거기에서 뭐 했어요?",
      english: "What did you do there?",
      examples: ["거기에서 뭐 했어요?", "거기에서 오래 있었어요?"],
      swapCategories: [
        {
          label: "추가 질문 (More)",
          items: [
            { korean: "거기에서 오래 있었어요?", english: "Were you there long?", result: "거기에서 오래 있었어요?" },
            { korean: "거기에서 뭐 했어요?", english: "What did you do there?", result: "거기에서 뭐 했어요?" },
            { korean: "거기 좋았어요?", english: "Was it good there?", result: "거기 좋았어요?" },
          ],
        },
      ],
    },
    {
      korean: "어땠어요?",
      english: "How was it?",
      examples: ["어땠어요?", "재밌었어요?"],
      swapCategories: [
        {
          label: "감상 (Reactions)",
          items: [
            { korean: "재밌었어요?", english: "Was it fun?", result: "재밌었어요?" },
            { korean: "좋았어요?", english: "Was it good?", result: "좋았어요?" },
            { korean: "힘들었어요?", english: "Was it hard?", result: "힘들었어요?" },
            { korean: "별로였어요?", english: "Was it not great?", result: "별로였어요?" },
          ],
        },
      ],
    },
    {
      korean: "오늘 바빴어요?",
      english: "Were you busy today?",
      examples: ["오늘 바빴어요?", "오늘 좀 피곤했어요?"],
      swapCategories: [
        {
          label: "컨디션 (Condition)",
          items: [
            { korean: "오늘 좀 피곤했어요?", english: "Were you tired today?", result: "오늘 좀 피곤했어요?" },
            { korean: "오늘 스트레스 받았어요?", english: "Were you stressed today?", result: "오늘 스트레스 받았어요?" },
            { korean: "오늘 바빴어요?", english: "Were you busy today?", result: "오늘 바빴어요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "오늘 뭐 했어요?",
    "오늘 뭐 먹었어요?",
    "오늘 어디 갔어요?",
    "거기에서 뭐 했어요?",
    "어땠어요?",
  ],
  replyPack: [
    "오늘 ___ 했어요.",
    "오늘 ___ 먹었어요.",
    "오늘 ___에 갔어요.",
    "거기에서 ___ 했어요.",
    "재밌었어요 / 좋았어요 / 별로였어요.",
  ],
  challenge: {
    prompt: "Write 3 questions about today: what they did + ate + how it was.",
    inputCount: 3,
  },
};

export default content;