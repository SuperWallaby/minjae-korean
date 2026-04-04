import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Public Transport",
    goal: "Ride buses and trains confidently: confirm routes, fares, transfers, and stops.",
  },
  coreFrames: [
    {
      korean: "이 버스 맞아요?",
      english: "Is this the right bus?",
      examples: ["이 버스 맞아요?", "명동 가요?"],
      swapCategories: [
        {
          label: "노선 (Route)",
          items: [
            { korean: "명동", english: "Myeongdong", result: "명동 가요?" },
            { korean: "인사동", english: "Insadong", result: "인사동 가요?" },
            { korean: "공항", english: "airport", result: "공항 가는 버스 맞아요?" },
            { korean: "환승", english: "transfer", result: "여기서 환승해요?" },
          ],
        },
      ],
    },
    {
      korean: "어디서 내려요?",
      english: "Where should I get off?",
      examples: ["어디서 내려요?", "다음 역이 어디예요?"],
      swapCategories: [
        {
          label: "하차 (Getting off)",
          items: [
            { korean: "다음 역", english: "next stop", result: "다음 역이 어디예요?" },
            { korean: "종점", english: "last stop", result: "종점까지 가요?" },
            { korean: "알려", english: "remind me", result: "내려야 할 때 알려 주세요." },
            { korean: "벨", english: "bell", result: "벨 누르면 돼요?" },
          ],
        },
      ],
    },
    {
      korean: "한 번에 얼마예요?",
      english: "How much is it for one ride?",
      examples: ["한 번에 얼마예요?", "교통카드 어디서 사요?"],
      swapCategories: [
        {
          label: "요금 (Fare)",
          items: [
            { korean: "교통카드", english: "T-money card", result: "교통카드 어디서 사요?" },
            { korean: "충전", english: "top up", result: "충전은 어디서 해요?" },
            { korean: "환승 할인", english: "transfer discount", result: "환승 할인 돼요?" },
            { korean: "환승 시간", english: "transfer window", result: "환승 몇 분 안에 해야 돼요?" },
          ],
        },
      ],
    },
    {
      korean: "환승 어떻게 해요?",
      english: "How do I transfer?",
      examples: ["환승 어떻게 해요?", "몇 번 출구로 가요?"],
      swapCategories: [
        {
          label: "안내 (Directions)",
          items: [
            { korean: "출구", english: "exit", result: "몇 번 출구로 가요?" },
            { korean: "표지판", english: "sign", result: "표지판 따라 가면 돼요?" },
            { korean: "건너편", english: "across", result: "건너편 승강장이에요?" },
            { korean: "막차", english: "last train", result: "막차 몇 시예요?" },
          ],
        },
      ],
    },
    {
      korean: "이 정류장이 어디예요?",
      english: "Where is this stop?",
      examples: ["이 정류장이 어디예요?", "지도로 보여 주세요."],
      swapCategories: [
        {
          label: "위치 (Location)",
          items: [
            { korean: "지도", english: "map", result: "지도로 보여 주세요." },
            { korean: "역", english: "station", result: "가장 가까운 역이 어디예요?" },
            { korean: "도보", english: "walking", result: "도보로 몇 분 걸려요?" },
            { korean: "택시", english: "taxi", result: "여기서 택시 타도 돼요?" },
          ],
        },
      ],
    },
    {
      korean: "자리 비었어요?",
      english: "Is this seat free?",
      examples: ["자리 비었어요?", "여기 앉아도 돼요?"],
      swapCategories: [
        {
          label: "좌석 (Seating)",
          items: [
            { korean: "약자석", english: "priority seat", result: "약자석이에요?" },
            { korean: "노약자석", english: "senior seat", result: "이 자리 피할게요." },
            { korean: "가방", english: "bag", result: "가방 여기 둘게요." },
            { korean: "문", english: "door", result: "문이 저쪽으로 열려요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "이 버스 맞아요?",
    "어디서 내려요?",
    "한 번에 얼마예요?",
    "환승 어떻게 해요?",
    "교통카드 어디서 사요?",
  ],
  replyPack: [
    "명동 가요?",
    "다음 역이 어디예요?",
    "충전은 어디서 해요?",
    "몇 번 출구로 가요?",
    "막차 몇 시예요?",
  ],
  challenge: {
    prompt:
      "Write 3 public transport lines: confirm vehicle/route + where to get off + fare or transfer question.",
    inputCount: 3,
  },
};

export default content;
