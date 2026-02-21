import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "How I'm Feeling",
    goal: "Say how you feel today, add one short reason, and ask your partner back.",
  },
  coreFrames: [
    {
      korean: "오늘 기분이 ___ 해요.",
      english: "I feel ___ today.",
      examples: ["오늘 기분이 좋아요.", "오늘 기분이 좀 우울해요."],
      swapCategories: [
        {
          label: "기분 (Feelings)",
          items: [
            { korean: "좋아", english: "good", result: "좋아요" },
            { korean: "행복", english: "happy", result: "행복해요" },
            { korean: "피곤", english: "tired", result: "피곤해요" },
            { korean: "우울", english: "down", result: "우울해요" },
            { korean: "불안", english: "anxious", result: "불안해요" },
          ],
        },
      ],
    },
    {
      korean: "저는 오늘 ___ 해요.",
      english: "Today I'm feeling ___.",
      examples: ["저는 오늘 좀 피곤해요.", "저는 오늘 신나요."],
      swapCategories: [
        {
          label: "기분 (Feelings)",
          items: [
            { korean: "피곤", english: "tired", result: "피곤해요" },
            { korean: "신나", english: "excited", result: "신나요" },
            { korean: "기분 좋아", english: "in a good mood", result: "기분 좋아요" },
            { korean: "스트레스 받아", english: "stressed", result: "스트레스 받아요" },
            { korean: "괜찮", english: "okay", result: "괜찮아요" },
          ],
        },
      ],
    },
    {
      korean: "오늘 좀 ___ 해요.",
      english: "I'm a bit ___ today.",
      examples: ["오늘 좀 예민해요.", "오늘 좀 멍해요."],
      swapCategories: [
        {
          label: "느낌 (A bit)",
          items: [
            { korean: "예민", english: "sensitive", result: "예민해요" },
            { korean: "멍", english: "spaced out", result: "멍해요" },
            { korean: "지쳐", english: "drained", result: "지쳐요" },
            { korean: "걱정돼", english: "worried", result: "걱정돼요" },
            { korean: "기분 좋", english: "good", result: "기분 좋아요" },
          ],
        },
      ],
    },
    {
      korean: "왜냐하면 ___(이)라서요.",
      english: "Because ___.",
      examples: ["왜냐하면 일이 많아서요.", "왜냐하면 잠을 못 자서요."],
      swapCategories: [
        {
          label: "이유 (Reasons)",
          items: [
            { korean: "일이 많", english: "I have a lot of work", result: "일이 많아서요" },
            { korean: "잠을 못 자", english: "I couldn't sleep", result: "잠을 못 자서요" },
            { korean: "날씨가 좋", english: "the weather is nice", result: "날씨가 좋아서요" },
            { korean: "스트레스 받", english: "I'm stressed", result: "스트레스 받아서요" },
            { korean: "기분이 좋", english: "I'm in a good mood", result: "기분이 좋아서요" },
          ],
        },
      ],
    },
    {
      korean: "요즘 ___ 해요.",
      english: "These days I feel ___ / I've been ___ lately.",
      examples: ["요즘 좀 피곤해요.", "요즘 스트레스 받아요."],
      swapCategories: [
        {
          label: "요즘 (Lately)",
          items: [
            { korean: "피곤", english: "tired", result: "피곤해요" },
            { korean: "바쁘", english: "busy", result: "바빠요" },
            { korean: "행복", english: "happy", result: "행복해요" },
            { korean: "우울", english: "down", result: "우울해요" },
            { korean: "괜찮", english: "okay", result: "괜찮아요" },
          ],
        },
      ],
    },
    {
      korean: "오늘 기분 어때요? (질문)",
      english: "How do you feel today?",
      examples: ["오늘 기분 어때요?", "요즘 어때요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "오늘 기분 어때요", english: "how do you feel today", result: "오늘 기분 어때요" },
            { korean: "요즘 어때요", english: "how are you lately", result: "요즘 어때요" },
            { korean: "무슨 일 있어요", english: "is something going on", result: "무슨 일 있어요" },
            { korean: "왜 그래요", english: "why is that", result: "왜 그래요" },
            { korean: "괜찮아요", english: "are you okay", result: "괜찮아요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: ["오늘 기분 어때요?", "요즘 어때요?", "왜요?", "무슨 일 있어요?", "괜찮아요?"],
  replyPack: [
    "오늘 기분이 ___ 해요.",
    "저는 오늘 ___ 해요.",
    "오늘 좀 ___ 해요.",
    "왜냐하면 ___(이)라서요.",
    "요즘 ___ 해요.",
  ],
  challenge: {
    prompt: "Write 3 lines: how you feel + a reason + a question back.",
    inputCount: 3,
  },
};

export default content;