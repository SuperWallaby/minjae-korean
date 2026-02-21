import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Time & Place Add-ons",
    goal: "Add time and place quickly: at 3, at home, at a cafe—short answers that sound natural.",
  },
  coreFrames: [
    {
      korean: "___시에요.",
      english: "At ___ o'clock.",
      examples: ["3시에요.", "7시에요."],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "3", english: "3", result: "3" },
            { korean: "5", english: "5", result: "5" },
            { korean: "7", english: "7", result: "7" },
            { korean: "9", english: "9", result: "9" },
            { korean: "12", english: "12", result: "12" }
          ]
        }
      ]
    },
    {
      korean: "___에서요.",
      english: "At/In ___ (location).",
      examples: ["카페에서요.", "회사에서요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "집", english: "home", result: "집" },
            { korean: "공원", english: "a park", result: "공원" }
          ]
        }
      ]
    },
    {
      korean: "___에요.",
      english: "At/In ___ (destination / short answer).",
      examples: ["집에요.", "학교에요."],
      swapCategories: [
        {
          label: "목적지 (Destinations)",
          items: [
            { korean: "집", english: "home", result: "집" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "역", english: "the station", result: "역" }
          ]
        }
      ]
    },
    {
      korean: "___에 할 거예요.",
      english: "I’ll do it at ___.",
      examples: ["3시에 할 거예요.", "저녁에 할 거예요."],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "3시", english: "3 o'clock", result: "3시" },
            { korean: "5시", english: "5 o'clock", result: "5시" },
            { korean: "7시", english: "7 o'clock", result: "7시" },
            { korean: "저녁", english: "in the evening", result: "저녁" },
            { korean: "내일", english: "tomorrow", result: "내일" }
          ]
        }
      ]
    },
    {
      korean: "___에서 할 거예요.",
      english: "I’ll do it at/in ___.",
      examples: ["집에서 할 거예요.", "카페에서 할 거예요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "집", english: "home", result: "집" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "공원", english: "a park", result: "공원" }
          ]
        }
      ]
    },
    {
      korean: "언제요? / 어디요? (질문)",
      english: "When? / Where?",
      examples: ["언제요?", "어디요?"],
      swapCategories: [
        {
          label: "짧은 질문 (Short)",
          items: [
            { korean: "언제요?", english: "When?", result: "언제요?" },
            { korean: "어디요?", english: "Where?", result: "어디요?" },
            { korean: "몇 시에요?", english: "What time?", result: "몇 시에요?" },
            { korean: "어디에서요?", english: "Where (at)?", result: "어디에서요?" }
          ]
        }
      ]
    }
  ],
  quickQuestions: [
    "몇 시에요?",
    "언제요?",
    "어디요?",
    "어디에서요?",
    "몇 시에 만날까요?"
  ],
  replyPack: [
    "___시에요.",
    "___에서요.",
    "___에요.",
    "___에 할 거예요.",
    "___에서 할 거예요."
  ],
  challenge: {
    prompt: "Write 3 short answers: time + place + one full sentence with time/place.",
    inputCount: 3
  }
};

export default content;