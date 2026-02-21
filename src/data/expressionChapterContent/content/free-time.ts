import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Do You Have Time?",
    goal: "Ask if someone has time, say you're free or busy, and suggest a better time.",
  },
  coreFrames: [
    {
      korean: "지금 시간 있어요?",
      english: "Do you have time now?",
      examples: ["지금 시간 있어요?", "지금 잠깐 시간 있어요?"],
      swapCategories: [
        {
          label: "짧게 (Short add-ons)",
          items: [
            { korean: "잠깐", english: "for a moment", result: "잠깐" },
            { korean: "조금", english: "a little", result: "조금" },
            { korean: "5분", english: "5 minutes", result: "5분" },
            { korean: "지금", english: "now", result: "지금" },
            { korean: "오늘", english: "today", result: "오늘" }
          ],
        },
      ],
    },
    {
      korean: "지금 시간 없어요.",
      english: "I don't have time right now.",
      examples: ["지금 시간 없어요.", "지금은 좀 바빠요."],
      swapCategories: [
        {
          label: "바쁨 (Busy)",
          items: [
            { korean: "좀 바빠요", english: "I'm a bit busy", result: "좀 바빠요" },
            { korean: "회의 중이에요", english: "I'm in a meeting", result: "회의 중이에요" },
            { korean: "일하고 있어요", english: "I'm working", result: "일하고 있어요" },
            { korean: "지금 어려워요", english: "it's hard right now", result: "지금 어려워요" },
            { korean: "나중에 가능해요", english: "I can later", result: "나중에 가능해요" }
          ],
        },
      ],
    },
    {
      korean: "지금 시간 있어요.",
      english: "I have time now.",
      examples: ["지금 시간 있어요.", "지금 괜찮아요."],
      swapCategories: [
        {
          label: "가능 (Available)",
          items: [
            { korean: "지금 괜찮아요", english: "I'm free now", result: "지금 괜찮아요" },
            { korean: "지금 가능해요", english: "I can now", result: "지금 가능해요" },
            { korean: "지금 시간 돼요", english: "I have time now", result: "지금 시간 돼요" },
            { korean: "잠깐 가능해요", english: "I can for a bit", result: "잠깐 가능해요" },
            { korean: "지금 괜찮으세요", english: "are you free now (polite)", result: "지금 괜찮으세요" }
          ],
        },
      ],
    },
    {
      korean: "___쯤 괜찮아요.",
      english: "I'm free around ___.",
      examples: ["3시쯤 괜찮아요.", "저녁쯤 괜찮아요."],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "3시", english: "3 o'clock", result: "3시" },
            { korean: "5시", english: "5 o'clock", result: "5시" },
            { korean: "7시", english: "7 o'clock", result: "7시" },
            { korean: "저녁", english: "in the evening", result: "저녁" },
            { korean: "내일", english: "tomorrow", result: "내일" }
          ],
        },
      ],
    },
    {
      korean: "지금은 안 되고, ___에 돼요.",
      english: "Not now, but I can at ___.",
      examples: ["지금은 안 되고, 5시에 돼요.", "지금은 안 되고, 내일 돼요."],
      swapCategories: [
        {
          label: "대신 (Instead)",
          items: [
            { korean: "5시", english: "5 o'clock", result: "5시" },
            { korean: "7시", english: "7 o'clock", result: "7시" },
            { korean: "저녁", english: "the evening", result: "저녁" },
            { korean: "내일", english: "tomorrow", result: "내일" },
            { korean: "주말", english: "the weekend", result: "주말" }
          ],
        },
      ],
    },
    {
      korean: "지금 괜찮아요? (질문)",
      english: "Are you free now? / Is now okay?",
      examples: ["지금 괜찮아요?", "지금 통화 괜찮아요?"],
      swapCategories: [
        {
          label: "무엇 (What)",
          items: [
            { korean: "통화", english: "a call", result: "통화" },
            { korean: "잠깐", english: "a moment", result: "잠깐" },
            { korean: "5분", english: "5 minutes", result: "5분" },
            { korean: "지금", english: "now", result: "지금" },
            { korean: "오늘", english: "today", result: "오늘" }
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "지금 시간 있어요?",
    "지금 괜찮아요?",
    "지금 통화 괜찮아요?",
    "언제 괜찮아요?",
    "___쯤 괜찮아요?"
  ],
  replyPack: [
    "지금 시간 있어요.",
    "지금 시간 없어요.",
    "지금 괜찮아요.",
    "___쯤 괜찮아요.",
    "지금은 안 되고, ___에 돼요."
  ],
  challenge: {
    prompt: "Write 3 lines: ask if they have time + say you're busy/free + suggest a time.",
    inputCount: 3
  }
};

export default content;