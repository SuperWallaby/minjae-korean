import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Nice to Meet You",
    goal: "Use simple greetings and polite closing lines to start (and end) an intro smoothly.",
  },
  coreFrames: [
    {
      korean: "만나서 반가워요.",
      english: "Nice to meet you.",
      examples: ["만나서 반가워요.", "아, 만나서 반가워요!"],
      swapCategories: [
        {
          label: "강조 (Soft emphasis)",
          items: [
            { korean: "정말", english: "really", result: "정말 반가워요" },
            { korean: "너무", english: "so/very", result: "너무 반가워요" },
            { korean: "진짜", english: "really", result: "진짜 반가워요" },
          ],
        },
      ],
    },
    {
      korean: "처음 뵙겠습니다.",
      english: "It's a pleasure to meet you. (more formal)",
      examples: ["처음 뵙겠습니다.", "안녕하세요. 처음 뵙겠습니다."],
      swapCategories: [
        {
          label: "상황 (When to use)",
          items: [
            { korean: "회사에서", english: "at work", result: "회사에서" },
            { korean: "면접에서", english: "in an interview", result: "면접에서" },
            { korean: "처음 인사할 때", english: "first greeting", result: "처음 인사할 때" },
          ],
        },
      ],
    },
    {
      korean: "잘 부탁드려요.",
      english: "I look forward to working with you. / Please take care of me. (common polite line)",
      examples: ["잘 부탁드려요.", "앞으로 잘 부탁드려요."],
      swapCategories: [
        {
          label: "버전 (Variants)",
          items: [
            { korean: "앞으로", english: "from now on", result: "앞으로 잘 부탁드려요" },
            { korean: "잘", english: "well", result: "잘 부탁드려요" },
            { korean: "부탁드려요", english: "I ask (politely)", result: "부탁드려요" },
          ],
        },
      ],
    },
    {
      korean: "반갑습니다.",
      english: "Nice to meet you. (polite, neutral)",
      examples: ["반갑습니다.", "만나서 반갑습니다."],
      swapCategories: [
        {
          label: "톤 (Tone)",
          items: [
            { korean: "조금 더 공손하게", english: "more formal", result: "만나서 반갑습니다" },
            { korean: "조금 더 부드럽게", english: "softer", result: "만나서 반가워요" },
          ],
        },
      ],
    },
    {
      korean: "다음에 또 봐요.",
      english: "See you next time.",
      examples: ["그럼 다음에 또 봐요.", "다음에 또 봐요!"],
      swapCategories: [
        {
          label: "인사 (Goodbye options)",
          items: [
            { korean: "그럼", english: "then / okay", result: "그럼 다음에 또 봐요" },
            { korean: "또", english: "again", result: "다음에 또 봐요" },
            { korean: "나중에", english: "later", result: "나중에 봐요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "처음 뵙겠습니다. 성함이 어떻게 되세요?",
    "만나서 반가워요. 어디에서 오셨어요?",
    "한국어는 얼마나 공부하셨어요?",
    "오늘 시간 내주셔서 감사합니다.",
    "그럼 다음에 또 봐요!",
  ],
  replyPack: [
    "만나서 반가워요.",
    "처음 뵙겠습니다.",
    "잘 부탁드려요.",
    "저도 반가워요.",
    "그럼 다음에 또 봐요.",
  ],
  challenge: {
    prompt: "Write a short intro closing with 2–3 polite lines.",
    inputCount: 3,
  },
};

export default content;