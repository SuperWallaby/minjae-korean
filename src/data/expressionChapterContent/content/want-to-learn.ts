import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "I Want to Learn",
    goal: "Say what you want to learn, why, and how long you've studied (or plan to).",
  },
  coreFrames: [
    {
      korean: "저는 ___ 배우고 싶어요.",
      english: "I want to learn ___.",
      examples: ["저는 한국어 배우고 싶어요.", "저는 기타 배우고 싶어요."],
      swapCategories: [
        {
          label: "배우고 싶은 것 (Learn)",
          items: [
            { korean: "한국어", english: "Korean", result: "한국어" },
            { korean: "영어", english: "English", result: "영어" },
            { korean: "기타", english: "guitar", result: "기타" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "코딩", english: "coding", result: "코딩" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 더 잘하고 싶어요.",
      english: "I want to get better at ___.",
      examples: ["저는 한국어를 더 잘하고 싶어요.", "저는 발음을 더 잘하고 싶어요."],
      swapCategories: [
        {
          label: "더 잘 (Get better at)",
          items: [
            { korean: "한국어", english: "Korean", result: "한국어를" },
            { korean: "발음", english: "pronunciation", result: "발음을" },
            { korean: "회화", english: "speaking", result: "회화를" },
            { korean: "듣기", english: "listening", result: "듣기를" },
            { korean: "문법", english: "grammar", result: "문법을" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 때문에 배우고 싶어요.",
      english: "I want to learn it because of ___.",
      examples: ["저는 여행 때문에 한국어를 배우고 싶어요.", "저는 일 때문에 영어를 배우고 싶어요."],
      swapCategories: [
        {
          label: "이유 (Reasons)",
          items: [
            { korean: "여행", english: "travel", result: "여행" },
            { korean: "일", english: "work", result: "일" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "취미", english: "a hobby", result: "취미" },
            { korean: "친구", english: "friends", result: "친구" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 공부한 지 ___ 됐어요.",
      english: "I've been studying ___ for ___.",
      examples: ["저는 한국어 공부한 지 6개월 됐어요.", "저는 영어 공부한 지 2년 됐어요."],
      swapCategories: [
        {
          label: "기간 (Duration)",
          items: [
            { korean: "6개월", english: "6 months", result: "6개월" },
            { korean: "1년", english: "1 year", result: "1년" },
            { korean: "2년", english: "2 years", result: "2년" },
            { korean: "3개월", english: "3 months", result: "3개월" },
            { korean: "5년", english: "5 years", result: "5년" },
          ],
        },
        {
          label: "언어/분야 (What)",
          items: [
            { korean: "한국어", english: "Korean", result: "한국어" },
            { korean: "영어", english: "English", result: "영어" },
            { korean: "기타", english: "guitar", result: "기타" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "코딩", english: "coding", result: "코딩" },
          ],
        },
      ],
    },
    {
      korean: "___ 연습하고 있어요.",
      english: "I'm practicing ___ .",
      examples: ["발음 연습하고 있어요.", "회화 연습하고 있어요."],
      swapCategories: [
        {
          label: "연습 (Practice)",
          items: [
            { korean: "발음", english: "pronunciation", result: "발음" },
            { korean: "회화", english: "speaking", result: "회화" },
            { korean: "듣기", english: "listening", result: "듣기" },
            { korean: "문법", english: "grammar", result: "문법" },
            { korean: "단어", english: "vocabulary", result: "단어" },
          ],
        },
      ],
    },
    {
      korean: "뭐 배우고 싶어요? (질문)",
      english: "What do you want to learn?",
      examples: ["뭐 배우고 싶어요?", "요즘 뭐 공부하고 있어요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "뭐 배우고 싶어요", english: "what do you want to learn", result: "뭐 배우고 싶어요" },
            { korean: "왜 배우고 싶어요", english: "why do you want to learn it", result: "왜 배우고 싶어요" },
            { korean: "얼마나 공부했어요", english: "how long have you studied", result: "얼마나 공부했어요" },
            { korean: "요즘 뭐 연습해요", english: "what are you practicing", result: "요즘 뭐 연습해요" },
            { korean: "어떤 게 제일 어려워요", english: "what's hardest", result: "어떤 게 제일 어려워요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "뭐 배우고 싶어요?",
    "왜 배우고 싶어요?",
    "얼마나 공부했어요?",
    "요즘 뭐 연습하고 있어요?",
    "어떤 게 제일 어려워요?"
  ],
  replyPack: [
    "저는 ___ 배우고 싶어요.",
    "저는 ___ 더 잘하고 싶어요.",
    "저는 ___ 때문에 배우고 싶어요.",
    "저는 ___ 공부한 지 ___ 됐어요.",
    "___ 연습하고 있어요."
  ],
  challenge: {
    prompt: "Write 3 lines: what you want to learn + why + how long (or what you're practicing).",
    inputCount: 3
  }
};

export default content;