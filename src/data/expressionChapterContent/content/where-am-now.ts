import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Where I Am Now",
    goal: "Say where you are right now, what you're doing there, and when you'll be free.",
  },
  coreFrames: [
    {
      korean: "지금 ___에 있어요.",
      english: "I'm at/in ___ right now.",
      examples: ["지금 집에 있어요.", "지금 카페에 있어요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "집", english: "home", result: "집" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "지하철", english: "the subway", result: "지하철" },
          ],
        },
      ],
    },
    {
      korean: "지금 ___에 가고 있어요.",
      english: "I'm on my way to ___ right now.",
      examples: ["지금 회사에 가고 있어요.", "지금 집에 가고 있어요."],
      swapCategories: [
        {
          label: "목적지 (Destinations)",
          items: [
            { korean: "회사", english: "work", result: "회사" },
            { korean: "집", english: "home", result: "집" },
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "병원", english: "a hospital", result: "병원" },
          ],
        },
      ],
    },
    {
      korean: "저는 지금 ___에 있어요. ___ 하고 있어요.",
      english: "I'm at/in ___. I'm ___.",
      examples: ["저는 지금 카페에 있어요. 일하고 있어요.", "저는 지금 집에 있어요. 쉬고 있어요."],
      swapCategories: [
        {
          label: "장소+행동 (Place + Action)",
          items: [
            { korean: "카페 / 일", english: "cafe / working", result: "카페 / 일" },
            { korean: "집 / 쉬", english: "home / resting", result: "집 / 쉬" },
            { korean: "회사 / 회의", english: "work / meeting", result: "회사 / 회의" },
            { korean: "학교 / 공부", english: "school / studying", result: "학교 / 공부" },
            { korean: "지하철 / 이동", english: "subway / commuting", result: "지하철 / 이동" },
          ],
        },
      ],
    },
    {
      korean: "지금 ___ 근처에 있어요.",
      english: "I'm near ___ right now.",
      examples: ["지금 역 근처에 있어요.", "지금 공원 근처에 있어요."],
      swapCategories: [
        {
          label: "근처 (Near)",
          items: [
            { korean: "역", english: "the station", result: "역" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "공원", english: "a park", result: "공원" },
            { korean: "도심", english: "downtown", result: "도심" },
          ],
        },
      ],
    },
    {
      korean: "지금은 좀 바빠요. ___쯤 괜찮아요.",
      english: "I'm a bit busy now. I'll be free around ___.",
      examples: ["지금은 좀 바빠요. 3시쯤 괜찮아요.", "지금은 좀 바빠요. 저녁쯤 괜찮아요."],
      swapCategories: [
        {
          label: "시간 (Time)",
          items: [
            { korean: "3시", english: "3 o'clock", result: "3시" },
            { korean: "5시", english: "5 o'clock", result: "5시" },
            { korean: "7시", english: "7 o'clock", result: "7시" },
            { korean: "저녁", english: "the evening", result: "저녁" },
            { korean: "내일", english: "tomorrow", result: "내일" },
          ],
        },
      ],
    },
    {
      korean: "지금 어디예요? (질문)",
      english: "Where are you right now?",
      examples: ["지금 어디예요?", "지금 어디에 있어요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "지금 어디예요", english: "where are you now", result: "지금 어디예요" },
            { korean: "어디에 있어요", english: "where are you", result: "어디에 있어요" },
            { korean: "집이에요", english: "are you at home", result: "집이에요" },
            { korean: "회사예요", english: "are you at work", result: "회사예요" },
            { korean: "지금 괜찮아요", english: "are you free now", result: "지금 괜찮아요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "지금 어디에 있어요?",
    "지금 어디예요?",
    "지금 뭐 하고 있어요?",
    "지금 어디로 가고 있어요?",
    "지금 괜찮아요?",
  ],
  replyPack: [
    "지금 ___에 있어요.",
    "지금 ___에 가고 있어요.",
    "지금 ___ 근처에 있어요.",
    "저는 지금 ___에 있어요. ___ 하고 있어요.",
    "지금은 좀 바빠요. ___쯤 괜찮아요.",
  ],
  challenge: {
    prompt: "Write 3 lines: where you are + what you're doing + when you'll be free.",
    inputCount: 3,
  },
};

export default content;