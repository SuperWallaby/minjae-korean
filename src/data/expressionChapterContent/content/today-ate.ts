import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "What I Ate",
    goal: "Say what you ate, how it was, and ask the same back in 2–3 clean lines.",
  },
  coreFrames: [
    {
      korean: "오늘 ___ 먹었어요.",
      english: "I ate ___ today.",
      examples: ["오늘 김밥 먹었어요.", "오늘 라면 먹었어요."],
      swapCategories: [
        {
          label: "음식 (Food)",
          items: [
            { korean: "김밥", english: "gimbap", result: "김밥" },
            { korean: "라면", english: "ramen", result: "라면" },
            { korean: "비빔밥", english: "bibimbap", result: "비빔밥" },
            { korean: "피자", english: "pizza", result: "피자" },
            { korean: "샐러드", english: "salad", result: "샐러드" },
          ],
        },
      ],
    },
    {
      korean: "아침/점심/저녁으로 ___ 먹었어요.",
      english: "I ate ___ for breakfast/lunch/dinner.",
      examples: ["점심으로 김치찌개 먹었어요.", "저녁으로 피자 먹었어요."],
      swapCategories: [
        {
          label: "끼니 (Meal)",
          items: [
            { korean: "아침", english: "breakfast", result: "아침" },
            { korean: "점심", english: "lunch", result: "점심" },
            { korean: "저녁", english: "dinner", result: "저녁" },
          ],
        },
        {
          label: "음식 (Food)",
          items: [
            { korean: "김치찌개", english: "kimchi stew", result: "김치찌개" },
            { korean: "불고기", english: "bulgogi", result: "불고기" },
            { korean: "파스타", english: "pasta", result: "파스타" },
            { korean: "초밥", english: "sushi", result: "초밥" },
            { korean: "샌드위치", english: "sandwich", result: "샌드위치" },
          ],
        },
      ],
    },
    {
      korean: "___ 먹어봤어요?",
      english: "Have you tried ___?",
      examples: ["비빔밥 먹어봤어요?", "김치찌개 먹어봤어요?"],
      swapCategories: [
        {
          label: "음식 (Food)",
          items: [
            { korean: "비빔밥", english: "bibimbap", result: "비빔밥" },
            { korean: "떡볶이", english: "tteokbokki", result: "떡볶이" },
            { korean: "불고기", english: "bulgogi", result: "불고기" },
            { korean: "김치찌개", english: "kimchi stew", result: "김치찌개" },
            { korean: "삼겹살", english: "pork belly", result: "삼겹살" },
          ],
        },
      ],
    },
    {
      korean: "맛있었어요 / 괜찮았어요 / 별로였어요.",
      english: "It was delicious / okay / not great.",
      examples: ["진짜 맛있었어요.", "음… 별로였어요."],
      swapCategories: [
        {
          label: "평가 (Reactions)",
          items: [
            { korean: "맛있었어요", english: "It was delicious", result: "맛있었어요" },
            { korean: "괜찮았어요", english: "It was okay", result: "괜찮았어요" },
            { korean: "별로였어요", english: "It wasn't great", result: "별로였어요" },
            { korean: "너무 짰어요", english: "It was too salty", result: "너무 짰어요" },
            { korean: "조금 매웠어요", english: "It was a bit spicy", result: "조금 매웠어요" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 좋아해요/싫어해요.",
      english: "I like / I don't like ___.",
      examples: ["저는 매운 거 좋아해요.", "저는 단 거 싫어해요."],
      swapCategories: [
        {
          label: "취향 (Tastes)",
          items: [
            { korean: "매운 거", english: "spicy food", result: "매운 거" },
            { korean: "단 거", english: "sweet things", result: "단 거" },
            { korean: "짠 거", english: "salty food", result: "짠 거" },
            { korean: "기름진 거", english: "greasy food", result: "기름진 거" },
            { korean: "채소", english: "vegetables", result: "채소" },
          ],
        },
      ],
    },
    {
      korean: "오늘 뭐 먹었어요? (질문)",
      english: "What did you eat today?",
      examples: ["오늘 뭐 먹었어요?", "점심 뭐 먹었어요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "오늘 뭐 먹었어요", english: "what did you eat today", result: "오늘 뭐 먹었어요" },
            { korean: "아침 뭐 먹었어요", english: "what did you eat for breakfast", result: "아침 뭐 먹었어요" },
            { korean: "점심 뭐 먹었어요", english: "what did you eat for lunch", result: "점심 뭐 먹었어요" },
            { korean: "저녁 뭐 먹었어요", english: "what did you eat for dinner", result: "저녁 뭐 먹었어요" },
            { korean: "맛있었어요", english: "was it good", result: "맛있었어요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "오늘 뭐 먹었어요?",
    "점심 뭐 먹었어요?",
    "맛있었어요?",
    "그거 자주 먹어요?",
    "___ 먹어봤어요?",
  ],
  replyPack: [
    "오늘 ___ 먹었어요.",
    "아침/점심/저녁으로 ___ 먹었어요.",
    "맛있었어요 / 괜찮았어요 / 별로였어요.",
    "저는 ___ 좋아해요/싫어해요.",
    "___ 먹어봤어요?",
  ],
  challenge: {
    prompt: "Write 3 lines: what you ate + how it was + one question back.",
    inputCount: 3,
  },
};

export default content;