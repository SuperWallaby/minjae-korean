import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Where I'm From",
    goal: "Say your nationality, where you're from, and add one detail to sound natural.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 사람이에요.",
      english: "I'm ___. / I'm from ___. (nationality)",
      examples: ["저는 한국 사람이에요.", "저는 미국 사람이에요."],
      swapCategories: [
        {
          label: "국적 (Nationality)",
          items: [
            { korean: "한국", english: "Korean", result: "한국 사람이에요" },
            { korean: "미국", english: "American", result: "미국 사람이에요" },
            { korean: "영국", english: "British", result: "영국 사람이에요" },
            { korean: "일본", english: "Japanese", result: "일본 사람이에요" },
            { korean: "호주", english: "Australian", result: "호주 사람이에요" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___에서 왔어요.",
      english: "I'm from ___.",
      examples: ["저는 서울에서 왔어요.", "저는 뉴욕에서 왔어요."],
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
        {
          label: "나라 (Countries)",
          items: [
            { korean: "한국", english: "Korea", result: "한국" },
            { korean: "미국", english: "the U.S.", result: "미국" },
            { korean: "영국", english: "the U.K.", result: "영국" },
            { korean: "일본", english: "Japan", result: "일본" },
            { korean: "호주", english: "Australia", result: "호주" },
          ],
        },
      ],
    },
    {
      korean: "지금은 ___에 살아요.",
      english: "I live in ___ now.",
      examples: ["지금은 서울에 살아요.", "지금은 런던에 살아요."],
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
      korean: "___에서 살았어요.",
      english: "I lived in ___ (before).",
      examples: ["부산에서 살았어요.", "도쿄에서 살았어요."],
      swapCategories: [
        {
          label: "도시 (Cities)",
          items: [
            { korean: "부산", english: "Busan", result: "부산" },
            { korean: "도쿄", english: "Tokyo", result: "도쿄" },
            { korean: "뉴욕", english: "New York", result: "뉴욕" },
            { korean: "런던", english: "London", result: "런던" },
            { korean: "자카르타", english: "Jakarta", result: "자카르타" },
          ],
        },
      ],
    },
    {
      korean: "___에서 태어났어요.",
      english: "I was born in ___.",
      examples: ["서울에서 태어났어요.", "미국에서 태어났어요."],
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
        {
          label: "나라 (Countries)",
          items: [
            { korean: "한국", english: "Korea", result: "한국" },
            { korean: "미국", english: "the U.S.", result: "미국" },
            { korean: "영국", english: "the U.K.", result: "영국" },
            { korean: "일본", english: "Japan", result: "일본" },
            { korean: "호주", english: "Australia", result: "호주" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "어느 나라 사람이에요?",
    "어디에서 왔어요?",
    "어디에 살아요?",
    "어디에서 태어났어요?",
    "고향은 어디예요?",
  ],
  replyPack: [
    "저는 ___ 사람이에요.",
    "저는 ___에서 왔어요.",
    "지금은 ___에 살아요.",
    "___에서 살았어요.",
    "___에서 태어났어요.",
  ],
  challenge: {
    prompt: "Make 3–4 lines about where you're from (nationality + from + now).",
    inputCount: 3,
  },
};

export default content;

//.