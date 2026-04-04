import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Shopping",
    goal: "Ask prices, check options, try things on, and pay in common retail situations.",
  },
  coreFrames: [
    {
      korean: "이거 얼마예요?",
      english: "How much is this?",
      examples: ["이거 얼마예요?", "할인돼요?"],
      swapCategories: [
        {
          label: "가격 (Price)",
          items: [
            { korean: "저거", english: "that one", result: "저거 얼마예요?" },
            { korean: "전부", english: "all together", result: "다 합쳐서 얼마예요?" },
            { korean: "세일", english: "sale", result: "세일해요?" },
            { korean: "면세", english: "duty-free", result: "면세로 살 수 있어요?" },
          ],
        },
      ],
    },
    {
      korean: "다른 색 있어요?",
      english: "Do you have another color?",
      examples: ["다른 색 있어요?", "블랙 있어요?"],
      swapCategories: [
        {
          label: "색 / 디자인 (Look)",
          items: [
            { korean: "블랙", english: "black", result: "블랙 있어요?" },
            { korean: "흰색", english: "white", result: "흰색도 있어요?" },
            { korean: "사이즈", english: "size", result: "이거 더 큰 거 있어요?" },
            { korean: "신상", english: "new arrivals", result: "신상 어디 있어요?" },
          ],
        },
      ],
    },
    {
      korean: "입어 봐도 돼요?",
      english: "Can I try this on?",
      examples: ["입어 봐도 돼요?", "피팅룸 어디예요?"],
      swapCategories: [
        {
          label: "피팅 (Trying on)",
          items: [
            { korean: "피팅룸", english: "fitting room", result: "피팅룸 어디예요?" },
            { korean: "거울", english: "mirror", result: "거울 앞에서 볼게요." },
            { korean: "한 치수", english: "one size", result: "한 치수 큰 걸로 주세요." },
            { korean: "괜찮아요", english: "I'll pass", result: "괜찮아요, 안 살래요." },
          ],
        },
      ],
    },
    {
      korean: "카드 돼요?",
      english: "Do you take cards?",
      examples: ["카드 돼요?", "현금만 돼요?"],
      swapCategories: [
        {
          label: "결제 (Payment)",
          items: [
            { korean: "현금", english: "cash", result: "현금으로 할게요." },
            { korean: "포인트", english: "points", result: "포인트 적립돼요?" },
            { korean: "알리페이", english: "Alipay", result: "해외 카드 돼요?" },
            { korean: "봉투", english: "bag", result: "봉투 필요 없어요." },
          ],
        },
      ],
    },
    {
      korean: "선물 포장해 주세요.",
      english: "Gift wrap, please.",
      examples: ["선물 포장해 주세요.", "리본도 부탁드려요."],
      swapCategories: [
        {
          label: "포장 / 서비스 (Extras)",
          items: [
            { korean: "리본", english: "ribbon", result: "리본도 해 주세요." },
            { korean: "영수증", english: "receipt", result: "영수증 따로 주세요." },
            { korean: "교환", english: "exchange", result: "교환 가능해요?" },
            { korean: "환불", english: "refund", result: "환불은 며칠 안에 돼요?" },
          ],
        },
      ],
    },
    {
      korean: "그냥 구경만 할게요.",
      english: "I'm just looking.",
      examples: ["그냥 구경만 할게요.", "혼자 볼게요."],
      swapCategories: [
        {
          label: "응대 (Browsing)",
          items: [
            { korean: "혼자", english: "alone", result: "혼자 볼게요." },
            { korean: "조금만", english: "a moment", result: "조금만 생각해 볼게요." },
            { korean: "다음에", english: "next time", result: "다음에 올게요." },
            { korean: "추천", english: "recommendation", result: "비슷한 걸로 추천해 주세요." },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "이거 얼마예요?",
    "다른 색 있어요?",
    "입어 봐도 돼요?",
    "카드 돼요?",
    "선물 포장해 주세요.",
  ],
  replyPack: [
    "할인돼요?",
    "블랙 있어요?",
    "피팅룸 어디예요?",
    "현금으로 할게요.",
    "포인트 적립돼요?",
  ],
  challenge: {
    prompt:
      "Write 3 shopping lines: ask price + check another option (color/size) + payment question.",
    inputCount: 3,
  },
};

export default content;
