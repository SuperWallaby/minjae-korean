import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "At the Restaurant",
    goal: "Handle a simple restaurant visit: say how many people, order food, and ask for the bill.",
  },
  coreFrames: [
    {
      korean: "몇 명이에요?",
      english: "How many people?",
      examples: ["몇 명이에요?", "두 명이에요."],
      swapCategories: [
        {
          label: "인원 (People)",
          items: [
            { korean: "한 명", english: "one person", result: "한 명이에요." },
            { korean: "두 명", english: "two people", result: "두 명이에요." },
            { korean: "세 명", english: "three people", result: "세 명이에요." },
            { korean: "네 명", english: "four people", result: "네 명이에요." },
          ],
        },
      ],
    },
    {
      korean: "주문할게요.",
      english: "I'd like to order.",
      examples: ["주문할게요.", "지금 주문할게요."],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "지금", english: "now", result: "지금 주문할게요." },
            { korean: "먼저", english: "first", result: "먼저 주문할게요." },
            { korean: "추가로", english: "additionally", result: "추가로 주문할게요." },
            { korean: "음료도", english: "drinks too", result: "음료도 주문할게요." },
          ],
        },
      ],
    },
    {
      korean: "이거 주세요.",
      english: "I'll have this one.",
      examples: ["이거 주세요.", "불고기 주세요."],
      swapCategories: [
        {
          label: "메뉴 (Menu)",
          items: [
            { korean: "불고기", english: "bulgogi", result: "불고기 주세요." },
            { korean: "비빔밥", english: "bibimbap", result: "비빔밥 주세요." },
            { korean: "김치찌개", english: "kimchi stew", result: "김치찌개 주세요." },
            { korean: "물", english: "water", result: "물 주세요." },
          ],
        },
      ],
    },
    {
      korean: "이거 매워요?",
      english: "Is this spicy?",
      examples: ["이거 매워요?", "많이 매워요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "매워요", english: "is it spicy", result: "이거 매워요?" },
            { korean: "달아요", english: "is it sweet", result: "이거 달아요?" },
            { korean: "차가워요", english: "is it cold", result: "이거 차가워요?" },
            { korean: "뜨거워요", english: "is it hot", result: "이거 뜨거워요?" },
          ],
        },
      ],
    },
    {
      korean: "물 좀 주세요.",
      english: "Could I have some water?",
      examples: ["물 좀 주세요.", "앞접시 좀 주세요."],
      swapCategories: [
        {
          label: "요청 (Requests)",
          items: [
            { korean: "물", english: "water", result: "물 좀 주세요." },
            { korean: "앞접시", english: "small plate", result: "앞접시 좀 주세요." },
            { korean: "숟가락", english: "spoon", result: "숟가락 좀 주세요." },
            { korean: "포크", english: "fork", result: "포크 좀 주세요." },
            { korean: "냅킨", english: "napkin", result: "냅킨 좀 주세요." },
          ],
        },
      ],
    },
    {
      korean: "계산해 주세요.",
      english: "Please give me the bill.",
      examples: ["계산해 주세요.", "여기서 계산할게요."],
      swapCategories: [
        {
          label: "계산 (Paying)",
          items: [
            { korean: "여기서", english: "here", result: "여기서 계산할게요." },
            { korean: "카드로", english: "by card", result: "카드로 계산할게요." },
            { korean: "현금으로", english: "in cash", result: "현금으로 계산할게요." },
            { korean: "따로", english: "separately", result: "따로 계산할게요." },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "몇 명이에요?",
    "주문할게요.",
    "이거 주세요.",
    "이거 매워요?",
    "계산해 주세요.",
  ],
  replyPack: [
    "두 명이에요.",
    "주문할게요.",
    "불고기 주세요.",
    "물 좀 주세요.",
    "계산해 주세요.",
  ],
  challenge: {
    prompt: "Write 3 restaurant lines: number of people + one order + asking for the bill.",
    inputCount: 3,
  },
};

export default content;