import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "When You're Stuck",
    goal: "Keep the conversation alive when you're stuck: buy time, ask to repeat, and ask for help.",
  },
  coreFrames: [
    {
      korean: "잘 모르겠어요.",
      english: "I'm not sure. / I don't know well.",
      examples: ["잘 모르겠어요.", "음… 잘 모르겠어요."],
      swapCategories: [
        {
          label: "완곡하게 (Softer)",
          items: [
            { korean: "잘 모르겠어요", english: "I'm not sure", result: "잘 모르겠어요" },
            { korean: "잘 모르겠는데요", english: "I'm not sure (softer)", result: "잘 모르겠는데요" },
            { korean: "모르겠어요", english: "I don't know", result: "모르겠어요" },
            { korean: "잘 기억이 안 나요", english: "I can't remember well", result: "잘 기억이 안 나요" },
          ],
        },
      ],
    },
    {
      korean: "잠깐만요. 생각할게요.",
      english: "One moment. Let me think.",
      examples: ["잠깐만요. 생각할게요.", "음… 잠깐만요."],
      swapCategories: [
        {
          label: "시간 벌기 (Buy time)",
          items: [
            { korean: "잠깐만요", english: "one moment", result: "잠깐만요" },
            { korean: "잠시만요", english: "just a second", result: "잠시만요" },
            { korean: "생각할게요", english: "let me think", result: "생각할게요" },
            { korean: "조금만요", english: "just a bit", result: "조금만요" },
          ],
        },
      ],
    },
    {
      korean: "한 번만 더요.",
      english: "One more time, please.",
      examples: ["한 번만 더요.", "한 번만 더 말해 주세요."],
      swapCategories: [
        {
          label: "더 공손하게 (Polite)",
          items: [
            { korean: "한 번만 더요", english: "one more time", result: "한 번만 더요" },
            { korean: "한 번만 더 말해 주세요", english: "please say it once more", result: "한 번만 더 말해 주세요" },
            { korean: "다시 말해 주세요", english: "please repeat", result: "다시 말해 주세요" },
          ],
        },
      ],
    },
    {
      korean: "천천히 말해 주세요.",
      english: "Please speak slowly.",
      examples: ["천천히 말해 주세요.", "조금만 천천히요."],
      swapCategories: [
        {
          label: "속도 (Speed)",
          items: [
            { korean: "천천히", english: "slowly", result: "천천히" },
            { korean: "조금만 천천히", english: "a little slower", result: "조금만 천천히" },
            { korean: "좀 더 천천히", english: "a bit slower", result: "좀 더 천천히" },
          ],
        },
      ],
    },
    {
      korean: "___를 한국어로 뭐라고 해요?",
      english: "How do you say ___ in Korean?",
      examples: ["'ticket'를 한국어로 뭐라고 해요?", "'hungry'를 한국어로 뭐라고 해요?"],
      swapCategories: [
        {
          label: "예시 (Examples)",
          items: [
            { korean: "ticket", english: "ticket", result: "ticket" },
            { korean: "hungry", english: "hungry", result: "hungry" },
            { korean: "tired", english: "tired", result: "tired" },
            { korean: "spicy", english: "spicy", result: "spicy" },
            { korean: "delicious", english: "delicious", result: "delicious" },
          ],
        },
      ],
    },
    {
      korean: "영어로 말해도 돼요?",
      english: "Can I say it in English?",
      examples: ["영어로 말해도 돼요?", "잠깐 영어로 말해도 돼요?"],
      swapCategories: [
        {
          label: "완곡 (Softer)",
          items: [
            { korean: "잠깐", english: "for a moment", result: "잠깐" },
            { korean: "조금", english: "a little", result: "조금" },
            { korean: "괜찮아요", english: "is it okay", result: "괜찮아요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "한 번만 더요.",
    "다시 말해 주세요.",
    "천천히 말해 주세요.",
    "무슨 뜻이에요?",
    "영어로 말해도 돼요?"
  ],
  replyPack: [
    "잘 모르겠어요.",
    "잠깐만요. 생각할게요.",
    "한 번만 더요.",
    "천천히 말해 주세요.",
    "___를 한국어로 뭐라고 해요?"
  ],
  challenge: {
    prompt: "Write 3 rescue lines: (1) buy time, (2) ask to repeat, (3) ask for a word.",
    inputCount: 3
  }
};

export default content;