import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "At the Hotel",
    goal: "Handle a simple hotel check-in: say you have a reservation, confirm the stay, and ask basic front-desk questions.",
  },
  coreFrames: [
    {
      korean: "예약했어요.",
      english: "I have a reservation.",
      examples: ["예약했어요.", "오늘 예약했어요."],
      swapCategories: [
        {
          label: "시간 (When)",
          items: [
            { korean: "오늘", english: "today", result: "오늘 예약했어요." },
            { korean: "어제", english: "yesterday", result: "어제 예약했어요." },
            { korean: "인터넷으로", english: "online", result: "인터넷으로 예약했어요." },
            { korean: "미리", english: "in advance", result: "미리 예약했어요." },
          ],
        },
      ],
    },
    {
      korean: "체크인하고 싶어요.",
      english: "I'd like to check in.",
      examples: ["체크인하고 싶어요.", "지금 체크인하고 싶어요."],
      swapCategories: [
        {
          label: "변형 (Variants)",
          items: [
            { korean: "지금", english: "now", result: "지금 체크인하고 싶어요." },
            { korean: "먼저", english: "first", result: "먼저 체크인하고 싶어요." },
            { korean: "체크아웃", english: "check out", result: "체크아웃하고 싶어요." },
            { korean: "짐 맡기고", english: "leave my luggage", result: "짐 맡기고 싶어요." },
          ],
        },
      ],
    },
    {
      korean: "몇 박이세요?",
      english: "How many nights?",
      examples: ["몇 박이세요?", "몇 박 묵으세요?"],
      swapCategories: [
        {
          label: "응답 (Replies)",
          items: [
            { korean: "하룻밤", english: "one night", result: "하룻밤이요." },
            { korean: "이틀", english: "two nights", result: "이틀이요." },
            { korean: "사흘", english: "three nights", result: "사흘이요." },
            { korean: "나흘", english: "four nights", result: "나흘이요." },
          ],
        },
      ],
    },
    {
      korean: "성함이 어떻게 되세요?",
      english: "What is your name?",
      examples: ["성함이 어떻게 되세요?", "예약자분 성함이 어떻게 되세요?"],
      swapCategories: [
        {
          label: "대상 (Who)",
          items: [
            { korean: "예약자분", english: "the person who made the reservation", result: "예약자분 성함이 어떻게 되세요?" },
            { korean: "고객님", english: "guest", result: "고객님 성함이 어떻게 되세요?" },
            { korean: "이름", english: "name", result: "이름이 어떻게 되세요?" },
            { korean: "여권", english: "passport", result: "여권 보여 주세요." },
          ],
        },
      ],
    },
    {
      korean: "몇 분이세요?",
      english: "How many people?",
      examples: ["몇 분이세요?", "두 분이세요?"],
      swapCategories: [
        {
          label: "인원 (People)",
          items: [
            { korean: "한 분", english: "one person", result: "한 분이에요." },
            { korean: "두 분", english: "two people", result: "두 분이에요." },
            { korean: "세 분", english: "three people", result: "세 분이에요." },
            { korean: "네 분", english: "four people", result: "네 분이에요." },
          ],
        },
      ],
    },
    {
      korean: "조식 포함이에요?",
      english: "Is breakfast included?",
      examples: ["조식 포함이에요?", "아침 식사 포함이에요?"],
      swapCategories: [
        {
          label: "항목 (What’s included)",
          items: [
            { korean: "조식", english: "breakfast", result: "조식 포함이에요?" },
            { korean: "아침 식사", english: "breakfast meal", result: "아침 식사 포함이에요?" },
            { korean: "와이파이", english: "Wi-Fi", result: "와이파이 포함이에요?" },
            { korean: "주차", english: "parking", result: "주차 포함이에요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "예약했어요.",
    "체크인하고 싶어요.",
    "몇 박이세요?",
    "성함이 어떻게 되세요?",
    "몇 분이세요?",
  ],
  replyPack: [
    "예약했어요.",
    "체크인하고 싶어요.",
    "이틀이요.",
    "두 분이에요.",
    "조식 포함이에요?",
  ],
  challenge: {
    prompt: "Write 3 hotel check-in lines: reservation + number of nights + one simple question.",
    inputCount: 3,
  },
};

export default content;