import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Taking a Taxi",
    goal: "Tell the driver where to go, ask to stop, and check the fare politely.",
  },
  coreFrames: [
    {
      korean: "여기 가 주세요.",
      english: "Please go here.",
      examples: ["여기 가 주세요.", "이 주소 가 주세요."],
      swapCategories: [
        {
          label: "목적지 (Destination)",
          items: [
            { korean: "이 주소", english: "this address", result: "이 주소 가 주세요." },
            { korean: "역 앞", english: "in front of the station", result: "역 앞으로 가 주세요." },
            { korean: "공항", english: "the airport", result: "공항 가 주세요." },
            { korean: "이 호텔", english: "this hotel", result: "이 호텔 가 주세요." },
          ],
        },
      ],
    },
    {
      korean: "여기서 내려 주세요.",
      english: "Please let me off here.",
      examples: ["여기서 내려 주세요.", "앞에서 내려 주세요."],
      swapCategories: [
        {
          label: "하차 (Drop-off)",
          items: [
            { korean: "앞", english: "up ahead", result: "앞에서 내려 주세요." },
            { korean: "모퉁이", english: "the corner", result: "저 모퉁이에서 내려 주세요." },
            { korean: "신호등 앞", english: "by the light", result: "신호등 앞에서 내려 주세요." },
            { korean: "입구 앞", english: "by the entrance", result: "입구 앞에서 내려 주세요." },
          ],
        },
      ],
    },
    {
      korean: "지도로 보여 드릴게요.",
      english: "I'll show you on the map.",
      examples: ["지도로 보여 드릴게요.", "네비로 찍었어요."],
      swapCategories: [
        {
          label: "안내 (Showing the way)",
          items: [
            { korean: "네비", english: "navigation app", result: "네비로 찍었어요." },
            { korean: "사진", english: "photo", result: "사진으로 보여 드릴게요." },
            { korean: "직진", english: "straight", result: "쭉 직진이에요." },
            { korean: "유턴", english: "U-turn", result: "여기서 유턴해 주세요." },
          ],
        },
      ],
    },
    {
      korean: "천천히 가 주세요.",
      english: "Please drive slowly.",
      examples: ["천천히 가 주세요.", "여유 있게 가 주세요."],
      swapCategories: [
        {
          label: "운전 요청 (Driving)",
          items: [
            { korean: "천천히", english: "slowly", result: "천천히 가 주세요." },
            { korean: "급하지 않아요", english: "no rush", result: "급하지 않아요." },
            { korean: "고속도로 말고", english: "not the highway", result: "고속도로 말고 일반 도로로 가 주세요." },
            { korean: "창문", english: "window", result: "창문 조금만 내려 주세요." },
          ],
        },
      ],
    },
    {
      korean: "요금이 얼마예요?",
      english: "How much is the fare?",
      examples: ["요금이 얼마예요?", "미터기 켜 주세요."],
      swapCategories: [
        {
          label: "요금 (Fare)",
          items: [
            { korean: "미터기", english: "meter", result: "미터기 켜 주세요." },
            { korean: "카드", english: "card", result: "카드 돼요?" },
            { korean: "영수증", english: "receipt", result: "영수증 주세요." },
            { korean: "얼마나 걸려요", english: "how long it takes", result: "여기까지 얼마나 걸려요?" },
          ],
        },
      ],
    },
    {
      korean: "택시 불러 주세요.",
      english: "Please call a taxi for me.",
      examples: ["택시 불러 주세요.", "잡아 주세요."],
      swapCategories: [
        {
          label: "호출 (Getting a cab)",
          items: [
            { korean: "잡아", english: "hail/get", result: "택시 잡아 주세요." },
            { korean: "큰 차", english: "van taxi", result: "짐 많아서 큰 택시 불러 주세요." },
            { korean: "바로", english: "right away", result: "지금 바로 불러 주세요." },
            { korean: "몇 분", english: "how many minutes", result: "몇 분 걸려요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "여기 가 주세요.",
    "여기서 내려 주세요.",
    "지도로 보여 드릴게요.",
    "천천히 가 주세요.",
    "요금이 얼마예요?",
  ],
  replyPack: [
    "역 앞으로 가 주세요.",
    "앞에서 내려 주세요.",
    "네비로 찍었어요.",
    "급하지 않아요.",
    "카드 돼요?",
  ],
  challenge: {
    prompt:
      "Write 3 taxi lines: destination + where to stop + one question (fare, card, or speed).",
    inputCount: 3,
  },
};

export default content;
