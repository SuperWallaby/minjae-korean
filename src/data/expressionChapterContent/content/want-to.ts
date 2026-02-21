import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "I Want to",
    goal: "Say what you want to do, invite someone, and suggest a time/place in 2–3 lines.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 하고 싶어요.",
      english: "I want to ___ .",
      examples: ["저는 여행하고 싶어요.", "저는 쉬고 싶어요."],
      swapCategories: [
        {
          label: "하고 싶은 것 (To do)",
          items: [
            { korean: "여행하", english: "travel", result: "여행하" },
            { korean: "쉬", english: "rest", result: "쉬" },
            { korean: "먹", english: "eat", result: "먹" },
            { korean: "자", english: "sleep", result: "자" },
            { korean: "운동하", english: "work out", result: "운동하" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 가고 싶어요.",
      english: "I want to go to ___ .",
      examples: ["저는 한국에 가고 싶어요.", "저는 바다에 가고 싶어요."],
      swapCategories: [
        {
          label: "가고 싶은 곳 (Places)",
          items: [
            { korean: "한국", english: "Korea", result: "한국" },
            { korean: "일본", english: "Japan", result: "일본" },
            { korean: "바다", english: "the beach", result: "바다" },
            { korean: "제주도", english: "Jeju Island", result: "제주도" },
            { korean: "카페", english: "a cafe", result: "카페" },
          ],
        },
      ],
    },
    {
      korean: "___ 먹고 싶어요 / 마시고 싶어요.",
      english: "I want to eat / drink ___ .",
      examples: ["라면 먹고 싶어요.", "아이스 커피 마시고 싶어요."],
      swapCategories: [
        {
          label: "음식/음료 (Food/Drink)",
          items: [
            { korean: "라면", english: "ramen", result: "라면" },
            { korean: "피자", english: "pizza", result: "피자" },
            { korean: "김밥", english: "gimbap", result: "김밥" },
            { korean: "아이스 커피", english: "iced coffee", result: "아이스 커피" },
            { korean: "물", english: "water", result: "물" },
          ],
        },
      ],
    },
    {
      korean: "같이 ___ 할래요?",
      english: "Do you want to ___ together? / Want to ___ together?",
      examples: ["같이 영화 볼래요?", "같이 커피 마실래요?"],
      swapCategories: [
        {
          label: "같이 (Together)",
          items: [
            { korean: "영화 보", english: "watch a movie", result: "영화 보" },
            { korean: "커피 마시", english: "get coffee", result: "커피 마시" },
            { korean: "산책하", english: "go for a walk", result: "산책하" },
            { korean: "밥 먹", english: "eat", result: "밥 먹" },
            { korean: "운동하", english: "work out", result: "운동하" },
          ],
        },
      ],
    },
    {
      korean: "___에/에서 같이 갈래요?",
      english: "Do you want to go together to ___ ?",
      examples: ["주말에 같이 갈래요?", "내일 카페에 같이 갈래요?"],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "공원", english: "a park", result: "공원" },
            { korean: "영화관", english: "a movie theater", result: "영화관" },
            { korean: "식당", english: "a restaurant", result: "식당" },
            { korean: "바다", english: "the beach", result: "바다" },
          ],
        },
      ],
    },
    {
      korean: "언제 괜찮아요? / 몇 시가 좋아요?",
      english: "When are you free? / What time works for you?",
      examples: ["언제 괜찮아요?", "몇 시가 좋아요?"],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "오늘", english: "today", result: "오늘" },
            { korean: "내일", english: "tomorrow", result: "내일" },
            { korean: "주말", english: "this weekend", result: "주말" },
            { korean: "저녁", english: "in the evening", result: "저녁" },
            { korean: "3시", english: "3 o'clock", result: "3시" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "뭐 하고 싶어요?",
    "어디 가고 싶어요?",
    "뭐 먹고 싶어요?",
    "같이 할래요?",
    "언제 괜찮아요?"
  ],
  replyPack: [
    "저는 ___ 하고 싶어요.",
    "저는 ___에 가고 싶어요.",
    "___ 먹고 싶어요 / 마시고 싶어요.",
    "같이 ___ 할래요?",
    "언제 괜찮아요? / 몇 시가 좋아요?"
  ],
  challenge: {
    prompt: "Write 3 lines: what you want to do + invite someone + ask for a time.",
    inputCount: 3
  }
};

export default content;