import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Confirm Meaning",
    goal: "Prevent misunderstandings: ask the meaning, confirm what you heard, and check if your sentence is correct.",
  },
  coreFrames: [
    {
      korean: "무슨 뜻이에요?",
      english: "What does it mean?",
      examples: ["무슨 뜻이에요?", "이게 무슨 뜻이에요?"],
      swapCategories: [
        {
          label: "대상 (What)",
          items: [
            { korean: "이게", english: "this", result: "이게" },
            { korean: "그게", english: "that", result: "그게" },
            { korean: "이 말", english: "this phrase", result: "이 말" },
            { korean: "그 단어", english: "that word", result: "그 단어" },
          ],
        },
      ],
    },
    {
      korean: "___ 말이에요?",
      english: "Do you mean ___ ? / Is it ___ you mean?",
      examples: ["친구 말이에요?", "내일 말이에요?"],
      swapCategories: [
        {
          label: "예시 (Examples)",
          items: [
            { korean: "친구", english: "a friend", result: "친구" },
            { korean: "내일", english: "tomorrow", result: "내일" },
            { korean: "지금", english: "now", result: "지금" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "그 사람", english: "that person", result: "그 사람" },
          ],
        },
      ],
    },
    {
      korean: "제가 맞게 이해했어요?",
      english: "Did I understand correctly?",
      examples: ["제가 맞게 이해했어요?", "제가 맞게 들었어요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "제가 맞게 들었어요?", english: "Did I hear correctly?", result: "제가 맞게 들었어요?" },
            { korean: "제가 맞게 이해했어요?", english: "Did I understand correctly?", result: "제가 맞게 이해했어요?" },
            { korean: "제가 제대로 이해했어요?", english: "Did I understand properly?", result: "제가 제대로 이해했어요?" },
          ],
        },
      ],
    },
    {
      korean: "___라는 뜻이에요?",
      english: "Does it mean ___ ?",
      examples: ["그럼 'cheap'라는 뜻이에요?", "그게 'busy'라는 뜻이에요?"],
      swapCategories: [
        {
          label: "예시 (Examples)",
          items: [
            { korean: "바쁘다", english: "busy", result: "바쁘다" },
            { korean: "싸다", english: "cheap", result: "싸다" },
            { korean: "가능하다", english: "possible", result: "가능하다" },
            { korean: "조용하다", english: "quiet", result: "조용하다" },
            { korean: "힘들다", english: "hard", result: "힘들다" },
          ],
        },
      ],
    },
    {
      korean: "이렇게 말하면 맞아요?",
      english: "Is it correct if I say it like this?",
      examples: ["이렇게 말하면 맞아요?", "이 문장 맞아요?"],
      swapCategories: [
        {
          label: "문장 (Sentence)",
          items: [
            { korean: "이 문장", english: "this sentence", result: "이 문장" },
            { korean: "이 표현", english: "this expression", result: "이 표현" },
            { korean: "이 말", english: "this phrase", result: "이 말" },
            { korean: "이렇게", english: "like this", result: "이렇게" },
            { korean: "맞아요", english: "is it correct", result: "맞아요" },
          ],
        },
      ],
    },
    {
      korean: "예를 들어서 말해 줄 수 있어요?",
      english: "Can you give me an example?",
      examples: ["예를 들어서 말해 줄 수 있어요?", "예문 하나만 주세요."],
      swapCategories: [
        {
          label: "짧게 (Short)",
          items: [
            { korean: "예문 하나만 주세요", english: "one example please", result: "예문 하나만 주세요" },
            { korean: "예를 들어서요", english: "for example?", result: "예를 들어서요" },
            { korean: "예시 있어요", english: "do you have an example", result: "예시 있어요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "무슨 뜻이에요?",
    "___ 말이에요?",
    "제가 맞게 이해했어요?",
    "이렇게 말하면 맞아요?",
    "예를 들어서 말해 줄 수 있어요?",
  ],
  replyPack: [
    "___라는 뜻이에요?",
    "제가 맞게 이해했어요?",
    "아, ___ 말이에요?",
    "이렇게 말하면 맞아요?",
    "예문 하나만 주세요.",
  ],
  challenge: {
    prompt: "Write 3 meaning-check lines: meaning + 'do you mean' + 'is this correct'.",
    inputCount: 3,
  },
};

export default content;