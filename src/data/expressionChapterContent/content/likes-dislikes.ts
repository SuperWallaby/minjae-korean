import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Likes & Dislikes",
    goal: "Say what you like, don’t like, and kind of like—without sounding too strong.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 좋아해요.",
      english: "I like ___.",
      examples: ["저는 커피 좋아해요.", "저는 영화 좋아해요."],
      swapCategories: [
        {
          label: "예시 (Things)",
          items: [
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "음악", english: "music", result: "음악" },
            { korean: "운동", english: "working out", result: "운동" },
            { korean: "여행", english: "travel", result: "여행" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 진짜 좋아해요.",
      english: "I really like ___.",
      examples: ["저는 라면 진짜 좋아해요.", "저는 산책 진짜 좋아해요."],
      swapCategories: [
        {
          label: "강조 (Stronger)",
          items: [
            { korean: "라면", english: "ramen", result: "라면" },
            { korean: "산책", english: "walking", result: "산책" },
            { korean: "고양이", english: "cats", result: "고양이" },
            { korean: "바다", english: "the ocean", result: "바다" },
            { korean: "콘서트", english: "concerts", result: "콘서트" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 별로 안 좋아해요.",
      english: "I don't really like ___ (not a fan).",
      examples: ["저는 매운 거 별로 안 좋아해요.", "저는 아침형 인간 별로 안 좋아해요."],
      swapCategories: [
        {
          label: "예시 (Things)",
          items: [
            { korean: "매운 거", english: "spicy food", result: "매운 거" },
            { korean: "비 오는 날", english: "rainy days", result: "비 오는 날" },
            { korean: "줄 서기", english: "waiting in line", result: "줄 서기" },
            { korean: "새벽", english: "early mornings", result: "새벽" },
            { korean: "소음", english: "noise", result: "소음" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 별로 안 좋아하지만, ___는 좋아해요.",
      english: "I don't really like ___, but I like ___.",
      examples: ["저는 운동 별로 안 좋아하지만, 요가는 좋아해요.", "저는 커피 별로 안 좋아하지만, 라떼는 좋아해요."],
      swapCategories: [
        {
          label: "대비 (But)",
          items: [
            { korean: "운동 / 요가", english: "exercise / yoga", result: "운동 / 요가" },
            { korean: "커피 / 라떼", english: "coffee / lattes", result: "커피 / 라떼" },
            { korean: "공포영화 / 코미디", english: "horror / comedy", result: "공포영화 / 코미디" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 조금 좋아해요.",
      english: "I like ___ a little.",
      examples: ["저는 매운 거 조금 좋아해요.", "저는 한국어 조금 좋아해요."],
      swapCategories: [
        {
          label: "약하게 (A little)",
          items: [
            { korean: "매운 거", english: "spicy food", result: "매운 거" },
            { korean: "단 거", english: "sweet things", result: "단 거" },
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "술", english: "alcohol", result: "술" },
            { korean: "운동", english: "exercise", result: "운동" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 좋아해요? / 좋아하세요?",
      english: "Do you like ___? (casual/polite)",
      examples: ["커피 좋아해요?", "영화 좋아하세요?"],
      swapCategories: [
        {
          label: "질문 (Ask)",
          items: [
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "음악", english: "music", result: "음악" },
            { korean: "여행", english: "travel", result: "여행" },
            { korean: "운동", english: "working out", result: "운동" }
          ]
        }
      ]
    }
  ],
  quickQuestions: [
    "뭐 좋아해요?",
    "뭐 별로 안 좋아해요?",
    "커피 좋아해요?",
    "영화 좋아하세요?",
    "요즘 뭐에 빠졌어요?"
  ],
  replyPack: [
    "저는 ___ 좋아해요.",
    "저는 ___ 진짜 좋아해요.",
    "저는 ___ 별로 안 좋아해요.",
    "저는 ___ 조금 좋아해요.",
    "저는 ___ 좋아하지만, ___는 좋아해요."
  ],
  challenge: {
    prompt: "Write 3 lines: 1 like, 1 don't-like, and 1 question to your partner.",
    inputCount: 3
  }
};

export default content;