import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "At a Cafe",
    goal: "Order drinks, choose dine-in or takeout, and handle basic cafe requests like size and receipts.",
  },
  coreFrames: [
    {
      korean: "아이스로 주세요.",
      english: "Iced, please.",
      examples: ["아이스로 주세요.", "핫으로 주세요."],
      swapCategories: [
        {
          label: "온도 (Temperature)",
          items: [
            { korean: "아이스", english: "iced", result: "아이스로 주세요." },
            { korean: "핫", english: "hot", result: "핫으로 주세요." },
            { korean: "따뜻하게", english: "warm", result: "따뜻하게 주세요." },
            { korean: "차갑게", english: "cold", result: "차갑게 주세요." },
          ],
        },
      ],
    },
    {
      korean: "여기서 먹을게요.",
      english: "I'll have it here.",
      examples: ["여기서 먹을게요.", "포장할게요."],
      swapCategories: [
        {
          label: "매장 / 포장 (Where)",
          items: [
            { korean: "여기서", english: "here", result: "여기서 먹을게요." },
            { korean: "가져갈게요", english: "takeaway", result: "가져갈게요." },
            { korean: "먹고 갈게요", english: "eat in then go", result: "먹고 갈게요." },
            { korean: "일회용 컵", english: "disposable cup", result: "일회용 컵으로 주세요." },
          ],
        },
      ],
    },
    {
      korean: "테이크아웃이요.",
      english: "For takeout.",
      examples: ["테이크아웃이요.", "포장이요."],
      swapCategories: [
        {
          label: "표현 (Phrasing)",
          items: [
            { korean: "테이크아웃", english: "takeout", result: "테이크아웃이요." },
            { korean: "포장", english: "to go", result: "포장이요." },
            { korean: "들고 갈게요", english: "I'll take it", result: "들고 갈게요." },
            { korean: "밖에서", english: "outside", result: "밖에서 마실게요." },
          ],
        },
      ],
    },
    {
      korean: "라지 사이즈로 주세요.",
      english: "Large size, please.",
      examples: ["라지 사이즈로 주세요.", "톨 사이즈로 주세요."],
      swapCategories: [
        {
          label: "사이즈 (Size)",
          items: [
            { korean: "라지", english: "large", result: "라지 사이즈로 주세요." },
            { korean: "레귤러", english: "regular", result: "레귤러로 주세요." },
            { korean: "벤티", english: "venti-style large", result: "큰 걸로 주세요." },
            { korean: "샷 추가", english: "extra shot", result: "샷 추가해 주세요." },
          ],
        },
      ],
    },
    {
      korean: "디카페인 있어요?",
      english: "Do you have decaf?",
      examples: ["디카페인 있어요?", "우유 대신 두유 돼요?"],
      swapCategories: [
        {
          label: "옵션 (Options)",
          items: [
            { korean: "디카페인", english: "decaf", result: "디카페인 있어요?" },
            { korean: "두유", english: "soy milk", result: "두유로 바꿔 주세요." },
            { korean: "시럽 빼고", english: "no syrup", result: "시럽 빼 주세요." },
            { korean: "휘핑 빼고", english: "no whipped cream", result: "휘핑 빼 주세요." },
          ],
        },
      ],
    },
    {
      korean: "영수증 주세요.",
      english: "A receipt, please.",
      examples: ["영수증 주세요.", "현금영수증 돼요?"],
      swapCategories: [
        {
          label: "마무리 (Checkout)",
          items: [
            { korean: "영수증", english: "receipt", result: "영수증 주세요." },
            { korean: "현금영수증", english: "cash receipt for tax", result: "현금영수증 돼요?" },
            { korean: "카드", english: "card", result: "카드로 할게요." },
            { korean: "포장됐어요", english: "is it packed", result: "포장 다 됐어요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "아이스로 주세요.",
    "여기서 먹을게요.",
    "테이크아웃이요.",
    "디카페인 있어요?",
    "영수증 주세요.",
  ],
  replyPack: [
    "핫으로 주세요.",
    "여기서 먹을게요.",
    "포장이요.",
    "라지 사이즈로 주세요.",
    "카드로 할게요.",
  ],
  challenge: {
    prompt:
      "Write 3 cafe lines: temperature (iced/hot) + dine-in or takeout + one extra request (size or decaf).",
    inputCount: 3,
  },
};

export default content;
