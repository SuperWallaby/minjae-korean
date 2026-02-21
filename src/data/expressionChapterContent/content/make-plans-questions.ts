import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Make Plans",
    goal: "Ask about availability, suggest a plan, and lock in a time/place in 2–3 lines.",
  },
  coreFrames: [
    {
      korean: "내일 뭐 할 거예요?",
      english: "What are you going to do tomorrow?",
      examples: ["내일 뭐 할 거예요?", "내일 바빠요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "내일 바빠요?", english: "Are you busy tomorrow?", result: "내일 바빠요?" },
            { korean: "내일 뭐 할 거예요?", english: "What will you do tomorrow?", result: "내일 뭐 할 거예요?" },
            { korean: "내일 시간 있어요?", english: "Do you have time tomorrow?", result: "내일 시간 있어요?" },
          ],
        },
      ],
    },
    {
      korean: "주말에 뭐 할 거예요?",
      english: "What are you going to do this weekend?",
      examples: ["주말에 뭐 할 거예요?", "주말에 시간 있어요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "주말에 시간 있어요?", english: "Do you have time this weekend?", result: "주말에 시간 있어요?" },
            { korean: "주말에 뭐 할 거예요?", english: "What will you do this weekend?", result: "주말에 뭐 할 거예요?" },
            { korean: "주말에 바빠요?", english: "Are you busy this weekend?", result: "주말에 바빠요?" },
          ],
        },
      ],
    },
    {
      korean: "___ 할래요?",
      english: "Do you want to ___ ?",
      examples: ["커피 마실래요?", "영화 볼래요?"],
      swapCategories: [
        {
          label: "제안 (Suggestions)",
          items: [
            { korean: "커피 마시", english: "get coffee", result: "커피 마시" },
            { korean: "영화 보", english: "watch a movie", result: "영화 보" },
            { korean: "밥 먹", english: "eat", result: "밥 먹" },
            { korean: "산책하", english: "go for a walk", result: "산책하" },
            { korean: "공부하", english: "study together", result: "공부하" },
          ],
        },
      ],
    },
    {
      korean: "같이 ___ 할래요?",
      english: "Want to ___ together?",
      examples: ["같이 밥 먹을래요?", "같이 산책할래요?"],
      swapCategories: [
        {
          label: "같이 (Together)",
          items: [
            { korean: "밥 먹", english: "eat", result: "밥 먹" },
            { korean: "산책하", english: "go for a walk", result: "산책하" },
            { korean: "운동하", english: "work out", result: "운동하" },
            { korean: "카페 가", english: "go to a cafe", result: "카페 가" },
            { korean: "영화 보", english: "watch a movie", result: "영화 보" },
          ],
        },
      ],
    },
    {
      korean: "언제 괜찮아요? / 몇 시가 좋아요?",
      english: "When are you free? / What time works?",
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
    {
      korean: "___에/에서 만날까요?",
      english: "Shall we meet at/in ___?",
      examples: ["카페에서 만날까요?", "3시에 만날까요?"],
      swapCategories: [
        {
          label: "장소/시간 (Place/Time)",
          items: [
            { korean: "카페에서", english: "at a cafe", result: "카페에서" },
            { korean: "공원에서", english: "at a park", result: "공원에서" },
            { korean: "영화관에서", english: "at the theater", result: "영화관에서" },
            { korean: "3시에", english: "at 3", result: "3시에" },
            { korean: "저녁에", english: "in the evening", result: "저녁에" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "내일 뭐 할 거예요?",
    "주말에 뭐 할 거예요?",
    "시간 있어요?",
    "같이 ___ 할래요?",
    "언제 괜찮아요?",
  ],
  replyPack: [
    "내일 ___ 할 거예요.",
    "주말에 ___ 할 거예요.",
    "좋아요! / 괜찮아요.",
    "언제 괜찮아요? / 몇 시가 좋아요?",
    "___에/에서 만날까요?",
  ],
  challenge: {
    prompt: "Write 3 lines: invite + ask time + suggest a place/time.",
    inputCount: 3,
  },
};

export default content;