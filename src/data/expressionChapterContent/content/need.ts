import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "I Need",
    goal: "Say what you need, ask for help politely, and explain a simple reason.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 필요해요.",
      english: "I need ___.",
      examples: ["저는 물이 필요해요.", "저는 도움이 필요해요."],
      swapCategories: [
        {
          label: "필요한 것 (Needs)",
          items: [
            { korean: "물", english: "water", result: "물" },
            { korean: "도움", english: "help", result: "도움" },
            { korean: "시간", english: "time", result: "시간" },
            { korean: "휴식", english: "rest", result: "휴식" },
            { korean: "정보", english: "information", result: "정보" },
          ],
        },
      ],
    },
    {
      korean: "___(이/가) 필요해요.",
      english: "I need ___ (simple).",
      examples: ["충전기가 필요해요.", "지도(가) 필요해요."],
      swapCategories: [
        {
          label: "물건 (Things)",
          items: [
            { korean: "충전기", english: "a charger", result: "충전기" },
            { korean: "지도", english: "a map", result: "지도" },
            { korean: "와이파이", english: "Wi-Fi", result: "와이파이" },
            { korean: "티켓", english: "a ticket", result: "티켓" },
            { korean: "영수증", english: "a receipt", result: "영수증" },
          ],
        },
      ],
    },
    {
      korean: "___ 좀 도와주세요.",
      english: "Please help me with ___.",
      examples: ["이거 좀 도와주세요.", "한국어 좀 도와주세요."],
      swapCategories: [
        {
          label: "도움 요청 (Help)",
          items: [
            { korean: "이거", english: "this", result: "이거" },
            { korean: "짐", english: "my luggage", result: "짐" },
            { korean: "길", english: "directions", result: "길" },
            { korean: "예약", english: "a reservation", result: "예약" },
            { korean: "한국어", english: "Korean", result: "한국어" },
          ],
        },
      ],
    },
    {
      korean: "___ 어디 있어요?",
      english: "Where is ___?",
      examples: ["화장실 어디 있어요?", "지하철역 어디 있어요?"],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "화장실", english: "the restroom", result: "화장실" },
            { korean: "지하철역", english: "the subway station", result: "지하철역" },
            { korean: "약국", english: "a pharmacy", result: "약국" },
            { korean: "은행", english: "a bank", result: "은행" },
            { korean: "편의점", english: "a convenience store", result: "편의점" },
          ],
        },
      ],
    },
    {
      korean: "___ 주세요.",
      english: "Please give me ___. (ordering/request)",
      examples: ["물 주세요.", "커피 한 잔 주세요."],
      swapCategories: [
        {
          label: "요청 (Request)",
          items: [
            { korean: "물", english: "water", result: "물" },
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "메뉴", english: "a menu", result: "메뉴" },
            { korean: "영수증", english: "a receipt", result: "영수증" },
            { korean: "봉지", english: "a bag", result: "봉지" },
          ],
        },
      ],
    },
    {
      korean: "왜냐하면 ___(이)라서요.",
      english: "Because ___.",
      examples: ["왜냐하면 배가 고파서요.", "왜냐하면 길을 몰라서요."],
      swapCategories: [
        {
          label: "이유 (Reasons)",
          items: [
            { korean: "배가 고프", english: "I'm hungry", result: "배가 고파서요" },
            { korean: "목이 마르", english: "I'm thirsty", result: "목이 말라서요" },
            { korean: "길을 모르", english: "I don't know the way", result: "길을 몰라서요" },
            { korean: "급하", english: "it's urgent", result: "급해서요" },
            { korean: "시간이 없", english: "I don't have time", result: "시간이 없어서요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "뭐 필요해요?",
    "이거 좀 도와주세요.",
    "화장실 어디 있어요?",
    "물 주세요.",
    "왜요?"
  ],
  replyPack: [
    "저는 ___ 필요해요.",
    "___(이/가) 필요해요.",
    "___ 좀 도와주세요.",
    "___ 어디 있어요?",
    "___ 주세요."
  ],
  challenge: {
    prompt: "Write 3 lines: what you need + a polite request + a short reason.",
    inputCount: 3
  }
};

export default content;