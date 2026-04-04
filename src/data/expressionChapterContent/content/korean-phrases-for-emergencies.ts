import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Emergencies",
    goal: "Get help fast: ask strangers or staff for assistance, contact police or ambulance, and report problems.",
  },
  coreFrames: [
    {
      korean: "도와주세요!",
      english: "Please help!",
      examples: ["도와주세요!", "빨리 도와주세요!"],
      swapCategories: [
        {
          label: "도움 요청 (Help)",
          items: [
            { korean: "빨리", english: "quickly", result: "빨리 도와주세요!" },
            { korean: "위험해요", english: "it's dangerous", result: "위험해요!" },
            { korean: "응급", english: "emergency", result: "응급이에요!" },
            { korean: "영어", english: "English", result: "영어 되는 분 계세요?" },
          ],
        },
      ],
    },
    {
      korean: "경찰 불러 주세요.",
      english: "Please call the police.",
      examples: ["경찰 불러 주세요.", "신고해 주세요."],
      swapCategories: [
        {
          label: "신고 (Authorities)",
          items: [
            { korean: "구급차", english: "ambulance", result: "구급차 불러 주세요." },
            { korean: "소방서", english: "fire department", result: "소방서 불러 주세요." },
            { korean: "112", english: "police hotline", result: "112에 신고해 주세요." },
            { korean: "119", english: "fire/rescue", result: "119에 전화해 주세요." },
          ],
        },
      ],
    },
    {
      korean: "길을 잃었어요.",
      english: "I'm lost.",
      examples: ["길을 잃었어요.", "여기가 어디예요?"],
      swapCategories: [
        {
          label: "위치 (Lost)",
          items: [
            { korean: "여기", english: "here", result: "여기가 어디예요?" },
            { korean: "호텔", english: "hotel", result: "이 호텔 어떻게 가요?" },
            { korean: "지하철역", english: "subway", result: "가까운 지하철역이 어디예요?" },
            { korean: "지도", english: "map", result: "지도 좀 봐도 돼요?" },
          ],
        },
      ],
    },
    {
      korean: "지갑 잃어버렸어요.",
      english: "I lost my wallet.",
      examples: ["지갑 잃어버렸어요.", "폰 잃어버렸어요."],
      swapCategories: [
        {
          label: "분실 (Lost items)",
          items: [
            { korean: "폰", english: "phone", result: "폰 잃어버렸어요." },
            { korean: "여권", english: "passport", result: "여권 잃어버렸어요." },
            { korean: "가방", english: "bag", result: "가방 놓고 왔어요." },
            { korean: "역", english: "station", result: "역 분실물 센터가 어디예요?" },
          ],
        },
      ],
    },
    {
      korean: "아파요.",
      english: "I'm sick. / It hurts.",
      examples: ["아파요.", "머리가 아파요."],
      swapCategories: [
        {
          label: "건강 (Health)",
          items: [
            { korean: "머리", english: "head", result: "머리가 아파요." },
            { korean: "배", english: "stomach", result: "배가 아파요." },
            { korean: "알레르기", english: "allergy", result: "알레르기 있어요." },
            { korean: "병원", english: "hospital", result: "가까운 병원 어디예요?" },
          ],
        },
      ],
    },
    {
      korean: "다쳤어요.",
      english: "I'm injured.",
      examples: ["다쳤어요.", "차에 치였어요."],
      swapCategories: [
        {
          label: "사고 (Accident)",
          items: [
            { korean: "넘어졌어요", english: "I fell", result: "넘어졌어요." },
            { korean: "차", english: "car", result: "차에 치였어요." },
            { korean: "응급실", english: "ER", result: "응급실 가야 해요." },
            { korean: "보험", english: "insurance", result: "여행자 보험 있어요." },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "도와주세요!",
    "경찰 불러 주세요.",
    "길을 잃었어요.",
    "지갑 잃어버렸어요.",
    "아파요.",
  ],
  replyPack: [
    "112에 신고해 주세요.",
    "구급차 불러 주세요.",
    "여기가 어디예요?",
    "역 분실물 센터가 어디예요?",
    "가까운 병원 어디예요?",
  ],
  challenge: {
    prompt:
      "Write 3 emergency lines: ask for help + one specific problem (lost item, sick, or accident) + one follow-up request.",
    inputCount: 3,
  },
};

export default content;
