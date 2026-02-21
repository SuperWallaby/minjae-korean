import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Where I Live",
    goal: "Say where you live now, and add one small detail to sound natural.",
  },
  coreFrames: [
    {
      korean: "저는 ___에 살아요.",
      english: "I live in ___.",
      examples: ["저는 서울에 살아요.", "저는 부산에 살아요."],
      swapCategories: [
        {
          label: "도시 (Cities)",
          items: [
            { korean: "서울", english: "Seoul", result: "서울" },
            { korean: "부산", english: "Busan", result: "부산" },
            { korean: "도쿄", english: "Tokyo", result: "도쿄" },
            { korean: "뉴욕", english: "New York", result: "뉴욕" },
            { korean: "런던", english: "London", result: "런던" },
          ],
        },
      ],
    },
    {
      korean: "지금은 ___에 살아요.",
      english: "I live in ___ now.",
      examples: ["지금은 서울에 살아요.", "지금은 뉴욕에 살아요."],
      swapCategories: [
        {
          label: "도시 (Cities)",
          items: [
            { korean: "서울", english: "Seoul", result: "서울" },
            { korean: "부산", english: "Busan", result: "부산" },
            { korean: "도쿄", english: "Tokyo", result: "도쿄" },
            { korean: "뉴욕", english: "New York", result: "뉴욕" },
            { korean: "런던", english: "London", result: "런던" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 근처에 살아요.",
      english: "I live near ___.",
      examples: ["저는 강남 근처에 살아요.", "저는 도심 근처에 살아요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "강남", english: "Gangnam", result: "강남" },
            { korean: "홍대", english: "Hongdae", result: "홍대" },
            { korean: "역", english: "the station", result: "역" },
            { korean: "공원", english: "a park", result: "공원" },
            { korean: "도심", english: "downtown", result: "도심" },
          ],
        },
      ],
    },
    {
      korean: "집이 ___에서 멀지 않아요.",
      english: "My home isn't far from ___.",
      examples: ["집이 회사에서 멀지 않아요.", "집이 역에서 멀지 않아요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "역", english: "the station", result: "역" },
            { korean: "공원", english: "the park", result: "공원" },
            { korean: "바다", english: "the sea", result: "바다" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___에서 ___분 걸려요.",
      english: "It takes me ___ minutes from ___ (to get somewhere).",
      examples: ["저는 집에서 회사까지 20분 걸려요.", "저는 집에서 학교까지 15분 걸려요."],
      swapCategories: [
        {
          label: "출발/도착 (From/To)",
          items: [
            { korean: "집에서 회사까지", english: "home → work", result: "집에서 회사까지" },
            { korean: "집에서 학교까지", english: "home → school", result: "집에서 학교까지" },
            { korean: "집에서 역까지", english: "home → station", result: "집에서 역까지" },
            { korean: "집에서 공원까지", english: "home → park", result: "집에서 공원까지" },
            { korean: "집에서 도심까지", english: "home → downtown", result: "집에서 도심까지" },
          ],
        },
        {
          label: "시간 (Minutes)",
          items: [
            { korean: "10", english: "10", result: "10" },
            { korean: "15", english: "15", result: "15" },
            { korean: "20", english: "20", result: "20" },
            { korean: "30", english: "30", result: "30" }
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "어디에 살아요?",
    "지금은 어디에 살아요?",
    "어느 동네에 살아요?",
    "집이 어디랑 가까워요?",
    "집에서 회사/학교까지 얼마나 걸려요?",
  ],
  replyPack: [
    "저는 ___에 살아요.",
    "지금은 ___에 살아요.",
    "저는 ___ 근처에 살아요.",
    "집이 ___에서 멀지 않아요.",
    "집에서 ___까지 ___분 걸려요.",
  ],
  challenge: {
    prompt: "Write 3 lines: city + near + travel time (optional).",
    inputCount: 3,
  },
};

export default content;