import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "I Forgot the Word",
    goal: "Keep talking when a word disappears: say you forgot, describe it, and ask how to say it.",
  },
  coreFrames: [
    {
      korean: "단어가 생각이 안 나요.",
      english: "I can't think of the word.",
      examples: ["단어가 생각이 안 나요.", "지금 단어가 생각이 안 나요."],
      swapCategories: [
        {
          label: "조금 더 자연스럽게 (Variants)",
          items: [
            { korean: "지금", english: "right now", result: "지금" },
            { korean: "갑자기", english: "suddenly", result: "갑자기" },
            { korean: "잠깐", english: "for a moment", result: "잠깐" },
          ],
        },
      ],
    },
    {
      korean: "그 단어를 까먹었어요.",
      english: "I forgot that word.",
      examples: ["그 단어를 까먹었어요.", "죄송한데, 그 단어를 까먹었어요."],
      swapCategories: [
        {
          label: "완곡 (Softer)",
          items: [
            { korean: "죄송한데", english: "sorry, but…", result: "죄송한데" },
            { korean: "잠깐만요", english: "one moment", result: "잠깐만요" },
            { korean: "갑자기", english: "suddenly", result: "갑자기" },
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
      korean: "한국어로 ___ 어떻게 말해요?",
      english: "How do you say ___ in Korean? (another way)",
      examples: ["한국어로 'receipt' 어떻게 말해요?", "한국어로 'schedule' 어떻게 말해요?"],
      swapCategories: [
        {
          label: "예시 (Examples)",
          items: [
            { korean: "receipt", english: "receipt", result: "receipt" },
            { korean: "schedule", english: "schedule", result: "schedule" },
            { korean: "charger", english: "charger", result: "charger" },
            { korean: "appointment", english: "appointment", result: "appointment" },
            { korean: "message", english: "message", result: "message" },
          ],
        },
      ],
    },
    {
      korean: "설명해 볼게요. ___예요.",
      english: "Let me explain. It's ___ .",
      examples: ["설명해 볼게요. 핸드폰에 쓰는 거예요.", "설명해 볼게요. 물 마실 때 쓰는 거예요."],
      swapCategories: [
        {
          label: "설명 (Describe it)",
          items: [
            { korean: "핸드폰에 쓰는 거", english: "something you use for a phone", result: "핸드폰에 쓰는 거예요" },
            { korean: "물 마실 때 쓰는 거", english: "something you use to drink water", result: "물 마실 때 쓰는 거예요" },
            { korean: "문 열 때 쓰는 거", english: "something you use to open a door", result: "문 열 때 쓰는 거예요" },
            { korean: "돈 내는 데 쓰는 거", english: "something you use to pay", result: "돈 내는 데 쓰는 거예요" },
            { korean: "요리할 때 쓰는 거", english: "something you use to cook", result: "요리할 때 쓰는 거예요" },
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
    "단어가 생각이 안 나요.",
    "그 단어를 까먹었어요.",
    "___를 한국어로 뭐라고 해요?",
    "한국어로 ___ 어떻게 말해요?",
    "영어로 말해도 돼요?",
  ],
  replyPack: [
    "단어가 생각이 안 나요.",
    "___를 한국어로 뭐라고 해요?",
    "한국어로 ___ 어떻게 말해요?",
    "설명해 볼게요. ___예요.",
    "영어로 말해도 돼요?",
  ],
  challenge: {
    prompt: "Write 3 rescue lines: (1) I forgot the word, (2) ask how to say it, (3) describe it.",
    inputCount: 3,
  },
};

export default content;