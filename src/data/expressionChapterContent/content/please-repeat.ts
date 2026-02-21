import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Please Repeat",
    goal: "Ask someone to repeat, slow down, and say it one more time—politely and naturally.",
  },
  coreFrames: [
    {
      korean: "다시 말해 주세요.",
      english: "Please say that again.",
      examples: ["다시 말해 주세요.", "죄송한데, 다시 말해 주세요."],
      swapCategories: [
        {
          label: "완곡 (Softer)",
          items: [
            { korean: "죄송한데", english: "sorry, but…", result: "죄송한데" },
            { korean: "잠깐만요", english: "one moment", result: "잠깐만요" },
            { korean: "한 번만", english: "just once", result: "한 번만" },
          ],
        },
      ],
    },
    {
      korean: "한 번만 더 말해 주세요.",
      english: "One more time, please.",
      examples: ["한 번만 더 말해 주세요.", "한 번만 더요."],
      swapCategories: [
        {
          label: "짧게 (Short)",
          items: [
            { korean: "한 번만 더요", english: "one more time", result: "한 번만 더요" },
            { korean: "한 번만 더 부탁해요", english: "one more time, please", result: "한 번만 더 부탁해요" },
            { korean: "다시 한 번만요", english: "just once again", result: "다시 한 번만요" },
          ],
        },
      ],
    },
    {
      korean: "천천히 말해 주세요.",
      english: "Please speak slowly.",
      examples: ["천천히 말해 주세요.", "조금만 천천히 말해 주세요."],
      swapCategories: [
        {
          label: "속도 (Speed)",
          items: [
            { korean: "조금만", english: "a little", result: "조금만" },
            { korean: "좀 더", english: "a bit more", result: "좀 더" },
            { korean: "천천히", english: "slowly", result: "천천히" },
          ],
        },
      ],
    },
    {
      korean: "조금만 크게 말해 주세요.",
      english: "Please speak a little louder.",
      examples: ["조금만 크게 말해 주세요.", "목소리 조금만 크게요."],
      swapCategories: [
        {
          label: "크게 (Louder)",
          items: [
            { korean: "조금만", english: "a little", result: "조금만" },
            { korean: "좀 더", english: "a bit more", result: "좀 더" },
            { korean: "크게", english: "louder", result: "크게" },
          ],
        },
      ],
    },
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
      korean: "제가 잘 못 들었어요.",
      english: "I didn't hear that well.",
      examples: ["제가 잘 못 들었어요.", "죄송한데, 제가 잘 못 들었어요."],
      swapCategories: [
        {
          label: "완곡 (Softer)",
          items: [
            { korean: "죄송한데", english: "sorry, but…", result: "죄송한데" },
            { korean: "조금", english: "a bit", result: "조금" },
            { korean: "잘", english: "well", result: "잘" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "다시 말해 주세요.",
    "한 번만 더 말해 주세요.",
    "천천히 말해 주세요.",
    "조금만 크게 말해 주세요.",
    "무슨 뜻이에요?",
  ],
  replyPack: [
    "다시 말해 주세요.",
    "한 번만 더 말해 주세요.",
    "천천히 말해 주세요.",
    "조금만 크게 말해 주세요.",
    "제가 잘 못 들었어요.",
  ],
  challenge: {
    prompt: "Write 3 lines: (1) repeat, (2) slow down, (3) ask the meaning.",
    inputCount: 3,
  },
};

export default content;