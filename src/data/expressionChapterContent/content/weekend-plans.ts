import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Weekend Plans",
    goal: "Make simple plans for tomorrow and the weekend, then add who/where/when in one extra line.",
  },
  coreFrames: [
    {
      korean: "주말에 ___ 할 거예요.",
      english: "I'm going to ___ this weekend.",
      examples: ["주말에 친구 만날 거예요.", "주말에 집에서 쉴 거예요."],
      swapCategories: [
        {
          label: "계획 (Plans)",
          items: [
            { korean: "친구 만날", english: "meet a friend", result: "친구 만날" },
            { korean: "집에서 쉴", english: "rest at home", result: "집에서 쉴" },
            { korean: "운동할", english: "work out", result: "운동할" },
            { korean: "영화 볼", english: "watch a movie", result: "영화 볼" },
            { korean: "카페 갈", english: "go to a cafe", result: "카페 갈" },
          ],
        },
      ],
    },
    {
      korean: "내일 ___ 할 거예요.",
      english: "I'm going to ___ tomorrow.",
      examples: ["내일 일할 거예요.", "내일 병원 갈 거예요."],
      swapCategories: [
        {
          label: "내일 (Tomorrow)",
          items: [
            { korean: "일할", english: "work", result: "일할" },
            { korean: "공부할", english: "study", result: "공부할" },
            { korean: "장 볼", english: "go grocery shopping", result: "장 볼" },
            { korean: "병원 갈", english: "go to the hospital", result: "병원 갈" },
            { korean: "친구 만날", english: "meet a friend", result: "친구 만날" },
          ],
        },
      ],
    },
    {
      korean: "___에 갈 거예요.",
      english: "I'm going to go to ___.",
      examples: ["카페에 갈 거예요.", "공원에 갈 거예요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "공원", english: "a park", result: "공원" },
            { korean: "영화관", english: "a movie theater", result: "영화관" },
            { korean: "마트", english: "a supermarket", result: "마트" },
            { korean: "친구 집", english: "a friend's place", result: "친구 집" },
          ],
        },
      ],
    },
    {
      korean: "___랑/이랑 같이 할 거예요.",
      english: "I'm going to do it with ___.",
      examples: ["친구랑 같이 할 거예요.", "가족이랑 같이 갈 거예요."],
      swapCategories: [
        {
          label: "누구랑 (With who)",
          items: [
            { korean: "친구", english: "a friend", result: "친구랑 같이 할 거예요" },
            { korean: "가족", english: "family", result: "가족이랑 같이 할 거예요" },
            { korean: "동료", english: "a coworker", result: "동료랑 같이 할 거예요" },
            { korean: "연인", english: "a partner", result: "연인이랑 같이 할 거예요" },
            { korean: "혼자", english: "alone", result: "혼자 할 거예요" },
          ],
        },
      ],
    },
    {
      korean: "___시에 할 거예요.",
      english: "I'm going to do it at ___.",
      examples: ["3시에 할 거예요.", "저녁에 할 거예요."],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "3", english: "3", result: "3" },
            { korean: "5", english: "5", result: "5" },
            { korean: "7", english: "7", result: "7" },
            { korean: "저녁", english: "in the evening", result: "저녁" },
            { korean: "주말", english: "on the weekend", result: "주말" },
          ],
        },
      ],
    },
    {
      korean: "주말에 뭐 할 거예요? (질문)",
      english: "What are you going to do this weekend?",
      examples: ["주말에 뭐 할 거예요?", "내일 뭐 할 거예요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "주말에 뭐 할 거예요", english: "what will you do this weekend", result: "주말에 뭐 할 거예요" },
            { korean: "내일 뭐 할 거예요", english: "what will you do tomorrow", result: "내일 뭐 할 거예요" },
            { korean: "누구랑 할 거예요", english: "who will you do it with", result: "누구랑 할 거예요" },
            { korean: "어디 갈 거예요", english: "where will you go", result: "어디 갈 거예요" },
            { korean: "몇 시에 할 거예요", english: "what time will you do it", result: "몇 시에 할 거예요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "주말에 뭐 할 거예요?",
    "내일 뭐 할 거예요?",
    "어디 갈 거예요?",
    "누구랑 할 거예요?",
    "몇 시에 할 거예요?",
  ],
  replyPack: [
    "주말에 ___ 할 거예요.",
    "내일 ___ 할 거예요.",
    "___에 갈 거예요.",
    "___랑/이랑 같이 할 거예요.",
    "___시에 할 거예요.",
  ],
  challenge: {
    prompt: "Write 3 lines: your weekend plan + where + with who (or time).",
    inputCount: 3,
  },
};

export default content;