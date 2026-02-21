import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Follow-ups",
    goal: "Keep the conversation going with simple follow-up questions: why, how, where, who, when.",
  },
  coreFrames: [
    {
      korean: "왜요? / 왜 그랬어요?",
      english: "Why? / Why did you do that?",
      examples: ["왜요?", "왜 그랬어요?"],
      swapCategories: [
        {
          label: "톤 (Tone)",
          items: [
            { korean: "왜요?", english: "Why? (short)", result: "왜요?" },
            { korean: "왜 그랬어요?", english: "Why did you do that?", result: "왜 그랬어요?" },
            { korean: "왜 그래요?", english: "Why is that?", result: "왜 그래요?" },
          ],
        },
      ],
    },
    {
      korean: "어땠어요?",
      english: "How was it?",
      examples: ["어땠어요?", "재밌었어요?"],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "재밌었어요?", english: "Was it fun?", result: "재밌었어요?" },
            { korean: "좋았어요?", english: "Was it good?", result: "좋았어요?" },
            { korean: "힘들었어요?", english: "Was it hard?", result: "힘들었어요?" },
          ],
        },
      ],
    },
    {
      korean: "어디에서 했어요? / 어디에 갔어요?",
      english: "Where did you do it? / Where did you go?",
      examples: ["어디에서 했어요?", "어디에 갔어요?"],
      swapCategories: [
        {
          label: "장소 (Place)",
          items: [
            { korean: "어디에서 했어요?", english: "Where did you do it?", result: "어디에서 했어요?" },
            { korean: "어디에 갔어요?", english: "Where did you go?", result: "어디에 갔어요?" },
            { korean: "어디서 했어요?", english: "Where did you do it? (short)", result: "어디서 했어요?" },
          ],
        },
      ],
    },
    {
      korean: "누구랑 했어요? / 혼자 했어요?",
      english: "Who did you do it with? / Did you do it alone?",
      examples: ["누구랑 했어요?", "혼자 했어요?"],
      swapCategories: [
        {
          label: "누구랑 (With who)",
          items: [
            { korean: "친구랑", english: "with a friend", result: "친구랑" },
            { korean: "가족이랑", english: "with family", result: "가족이랑" },
            { korean: "동료랑", english: "with a coworker", result: "동료랑" },
            { korean: "혼자", english: "alone", result: "혼자" },
            { korean: "연인이랑", english: "with a partner", result: "연인이랑" },
          ],
        },
      ],
    },
    {
      korean: "언제 했어요? / 몇 시에 했어요?",
      english: "When did you do it? / What time?",
      examples: ["언제 했어요?", "몇 시에 했어요?"],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "오늘", english: "today", result: "오늘" },
            { korean: "어제", english: "yesterday", result: "어제" },
            { korean: "아침에", english: "in the morning", result: "아침에" },
            { korean: "저녁에", english: "in the evening", result: "저녁에" },
            { korean: "3시에", english: "at 3", result: "3시에" },
          ],
        },
      ],
    },
    {
      korean: "조금 더 말해 주세요.",
      english: "Tell me a little more.",
      examples: ["조금 더 말해 주세요.", "조금 더 자세히 말해 주세요."],
      swapCategories: [
        {
          label: "요청 (Requests)",
          items: [
            { korean: "조금 더 자세히", english: "a bit more detail", result: "조금 더 자세히" },
            { korean: "천천히", english: "slowly", result: "천천히" },
            { korean: "한 번 더", english: "one more time", result: "한 번 더" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "왜요?",
    "어땠어요?",
    "어디에서 했어요?",
    "누구랑 했어요?",
    "언제 했어요?"
  ],
  replyPack: [
    "왜냐하면 ___(이)라서요.",
    "재밌었어요 / 좋았어요 / 별로였어요.",
    "___에서 했어요.",
    "___랑 했어요. / 혼자 했어요.",
    "___에 했어요."
  ],
  challenge: {
    prompt: "Write 3 follow-up questions: why + where + who/when.",
    inputCount: 3
  }
};

export default content;