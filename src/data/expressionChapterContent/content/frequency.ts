import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "How Often",
    goal: "Say how often you do something (often, sometimes, rarely) and ask your partner naturally.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 자주 해요.",
      english: "I do ___ often.",
      examples: ["저는 운동 자주 해요.", "저는 커피 자주 마셔요."],
      swapCategories: [
        {
          label: "활동 (Activities)",
          items: [
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "산책", english: "go for walks", result: "산책" },
            { korean: "요리", english: "cook", result: "요리" },
            { korean: "독서", english: "read", result: "독서" },
            { korean: "영화", english: "watch movies", result: "영화" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 가끔 해요.",
      english: "I do ___ sometimes.",
      examples: ["저는 등산 가끔 해요.", "저는 게임 가끔 해요."],
      swapCategories: [
        {
          label: "활동 (Activities)",
          items: [
            { korean: "등산", english: "hike", result: "등산" },
            { korean: "게임", english: "play games", result: "게임" },
            { korean: "수영", english: "swim", result: "수영" },
            { korean: "여행", english: "travel", result: "여행" },
            { korean: "카페", english: "go to cafes", result: "카페" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 거의 안 해요.",
      english: "I hardly ever do ___ / I almost never do ___.",
      examples: ["저는 술 거의 안 마셔요.", "저는 밤샘 거의 안 해요."],
      swapCategories: [
        {
          label: "활동 (Activities)",
          items: [
            { korean: "술", english: "drink alcohol", result: "술" },
            { korean: "밤샘", english: "stay up all night", result: "밤샘" },
            { korean: "운전", english: "drive", result: "운전" },
            { korean: "쇼핑", english: "shop", result: "쇼핑" },
            { korean: "배달", english: "order delivery", result: "배달" },
          ],
        },
      ],
    },
    {
      korean: "저는 주말마다 ___ 해요.",
      english: "I do ___ every weekend.",
      examples: ["저는 주말마다 운동해요.", "저는 주말마다 친구를 만나요."],
      swapCategories: [
        {
          label: "주말 (Weekend)",
          items: [
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "친구를 만나요", english: "meet friends", result: "친구를 만나요" },
            { korean: "요리해요", english: "cook", result: "요리해요" },
            { korean: "쉬어요", english: "rest", result: "쉬어요" },
            { korean: "영화 봐요", english: "watch movies", result: "영화 봐요" },
          ],
        },
      ],
    },
    {
      korean: "저는 일주일에 ___번 ___ 해요.",
      english: "I ___ ___ times a week.",
      examples: ["저는 일주일에 두 번 운동해요.", "저는 일주일에 세 번 카페 가요."],
      swapCategories: [
        {
          label: "횟수 (Times)",
          items: [
            { korean: "한", english: "1", result: "한" },
            { korean: "두", english: "2", result: "두" },
            { korean: "세", english: "3", result: "세" },
            { korean: "네", english: "4", result: "네" },
            { korean: "다섯", english: "5", result: "다섯" },
          ],
        },
        {
          label: "활동 (Activities)",
          items: [
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "카페 가요", english: "go to cafes", result: "카페 가요" },
            { korean: "요리해요", english: "cook", result: "요리해요" },
            { korean: "공부해요", english: "study", result: "공부해요" },
            { korean: "산책해요", english: "go for walks", result: "산책해요" },
          ],
        },
      ],
    },
    {
      korean: "___ 자주 해요? / 가끔 해요?",
      english: "Do you do ___ often? / Sometimes?",
      examples: ["운동 자주 해요?", "요리 가끔 해요?"],
      swapCategories: [
        {
          label: "질문 (Ask)",
          items: [
            { korean: "운동", english: "working out", result: "운동" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "독서", english: "reading", result: "독서" },
            { korean: "여행", english: "travel", result: "여행" },
            { korean: "영화", english: "movies", result: "영화" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "운동 자주 해요?",
    "주말에 보통 뭐 해요?",
    "일주일에 몇 번 해요?",
    "요즘은 얼마나 자주 해요?",
    "거의 안 하는 게 있어요?",
  ],
  replyPack: [
    "저는 ___ 자주 해요.",
    "저는 ___ 가끔 해요.",
    "저는 ___ 거의 안 해요.",
    "저는 주말마다 ___ 해요.",
    "저는 일주일에 ___번 ___ 해요.",
  ],
  challenge: {
    prompt: "Write 3 lines: something you do often, sometimes, and hardly ever.",
    inputCount: 3,
  },
};

export default content;