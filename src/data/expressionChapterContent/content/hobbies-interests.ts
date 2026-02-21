import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Hobbies & Interests",
    goal: "Talk about what you're into, what you do often, and what you're learning these days.",
  },
  coreFrames: [
    {
      korean: "저는 ___에 관심 있어요.",
      english: "I'm interested in ___.",
      examples: ["저는 디자인에 관심 있어요.", "저는 K-pop에 관심 있어요."],
      swapCategories: [
        {
          label: "관심사 (Interests)",
          items: [
            { korean: "디자인", english: "design", result: "디자인" },
            { korean: "K-pop", english: "K-pop", result: "K-pop" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "운동", english: "fitness", result: "운동" },
            { korean: "사진", english: "photography", result: "사진" }
          ]
        }
      ]
    },
    {
      korean: "저는 요즘 ___에 관심이 많아요.",
      english: "These days I'm really into ___.",
      examples: ["저는 요즘 러닝에 관심이 많아요.", "저는 요즘 커피에 관심이 많아요."],
      swapCategories: [
        {
          label: "요즘 (These days)",
          items: [
            { korean: "러닝", english: "running", result: "러닝" },
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "캠핑", english: "camping", result: "캠핑" },
            { korean: "투자", english: "investing", result: "투자" },
            { korean: "한국어", english: "Korean", result: "한국어" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 자주 해요.",
      english: "I do ___ often.",
      examples: ["저는 운동 자주 해요.", "저는 산책 자주 해요."],
      swapCategories: [
        {
          label: "취미 (Hobbies)",
          items: [
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "산책", english: "go for walks", result: "산책" },
            { korean: "요리", english: "cook", result: "요리" },
            { korean: "독서", english: "read", result: "독서" },
            { korean: "게임", english: "play games", result: "게임" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 가끔 해요.",
      english: "I do ___ sometimes.",
      examples: ["저는 등산 가끔 해요.", "저는 자전거 가끔 타요."],
      swapCategories: [
        {
          label: "가끔 (Sometimes)",
          items: [
            { korean: "등산", english: "hike", result: "등산" },
            { korean: "자전거", english: "bike", result: "자전거" },
            { korean: "수영", english: "swim", result: "수영" },
            { korean: "그림", english: "draw", result: "그림" },
            { korean: "여행", english: "travel", result: "여행" }
          ]
        }
      ]
    },
    {
      korean: "저는 ___ 배우고 있어요.",
      english: "I'm learning ___.",
      examples: ["저는 한국어 배우고 있어요.", "저는 기타 배우고 있어요."],
      swapCategories: [
        {
          label: "배우는 것 (Learning)",
          items: [
            { korean: "한국어", english: "Korean", result: "한국어" },
            { korean: "영어", english: "English", result: "영어" },
            { korean: "기타", english: "guitar", result: "기타" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "코딩", english: "coding", result: "코딩" }
          ]
        }
      ]
    },
    {
      korean: "___ 좋아해요? / ___ 자주 해요?",
      english: "Do you like ___? / Do you do ___ often?",
      examples: ["운동 좋아해요?", "요리 자주 해요?"],
      swapCategories: [
        {
          label: "질문 (Ask)",
          items: [
            { korean: "운동", english: "working out", result: "운동" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "독서", english: "reading", result: "독서" },
            { korean: "영화", english: "movies", result: "영화" },
            { korean: "여행", english: "travel", result: "여행" }
          ]
        }
      ]
    }
  ],
  quickQuestions: [
    "요즘 뭐에 관심 있어요?",
    "취미가 뭐예요?",
    "뭐 자주 해요?",
    "주말에 보통 뭐 해요?",
    "요즘 뭐 배우고 있어요?"
  ],
  replyPack: [
    "저는 ___에 관심 있어요.",
    "저는 요즘 ___에 관심이 많아요.",
    "저는 ___ 자주 해요.",
    "저는 ___ 가끔 해요.",
    "저는 ___ 배우고 있어요."
  ],
  challenge: {
    prompt: "Write 3 lines: 1 interest, 1 hobby you do often, and 1 thing you're learning.",
    inputCount: 3
  }
};

export default content;