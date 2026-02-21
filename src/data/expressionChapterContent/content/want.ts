import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "I Want",
    goal: "Say what you want, soften it politely, and ask for it naturally.",
  },
  coreFrames: [
    {
      korean: "저는 ___ 원해요.",
      english: "I want ___.",
      examples: ["저는 커피 원해요.", "저는 조용한 자리 원해요."],
      swapCategories: [
        {
          label: "원하는 것 (Wants)",
          items: [
            { korean: "커피", english: "coffee", result: "커피" },
            { korean: "물", english: "water", result: "물" },
            { korean: "조용한 자리", english: "a quiet seat", result: "조용한 자리" },
            { korean: "창가 자리", english: "a window seat", result: "창가 자리" },
            { korean: "도움", english: "help", result: "도움" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 갖고 싶어요.",
      english: "I want to have ___ / I want ___.",
      examples: ["저는 새 핸드폰 갖고 싶어요.", "저는 좋은 카메라 갖고 싶어요."],
      swapCategories: [
        {
          label: "갖고 싶은 것 (Things)",
          items: [
            { korean: "새 핸드폰", english: "a new phone", result: "새 핸드폰" },
            { korean: "좋은 카메라", english: "a good camera", result: "좋은 카메라" },
            { korean: "새 노트북", english: "a new laptop", result: "새 노트북" },
            { korean: "좋은 의자", english: "a good chair", result: "좋은 의자" },
            { korean: "새 신발", english: "new shoes", result: "새 신발" },
          ],
        },
      ],
    },
    {
      korean: "___ 하고 싶어요.",
      english: "I want to do ___ (want to).",
      examples: ["쉬고 싶어요.", "여행하고 싶어요."],
      swapCategories: [
        {
          label: "하고 싶은 것 (To do)",
          items: [
            { korean: "쉬", english: "rest", result: "쉬" },
            { korean: "여행하", english: "travel", result: "여행하" },
            { korean: "먹", english: "eat", result: "먹" },
            { korean: "자", english: "sleep", result: "자" },
            { korean: "운동하", english: "work out", result: "운동하" },
          ],
        },
      ],
    },
    {
      korean: "저는 ___ 먹고/마시고 싶어요.",
      english: "I want to eat/drink ___.",
      examples: ["저는 라면 먹고 싶어요.", "저는 아이스 커피 마시고 싶어요."],
      swapCategories: [
        {
          label: "먹고/마시고 (Food/Drink)",
          items: [
            { korean: "라면", english: "ramen", result: "라면" },
            { korean: "피자", english: "pizza", result: "피자" },
            { korean: "김밥", english: "gimbap", result: "김밥" },
            { korean: "아이스 커피", english: "iced coffee", result: "아이스 커피" },
            { korean: "물", english: "water", result: "물" },
          ],
        },
      ],
    },
    {
      korean: "___ 있으면 좋겠어요.",
      english: "It would be nice if I had ___ / I wish I had ___.",
      examples: ["시간 있으면 좋겠어요.", "휴가 있으면 좋겠어요."],
      swapCategories: [
        {
          label: "바라는 것 (Wish)",
          items: [
            { korean: "시간", english: "time", result: "시간" },
            { korean: "휴가", english: "a vacation", result: "휴가" },
            { korean: "돈", english: "money", result: "돈" },
            { korean: "에너지", english: "energy", result: "에너지" },
            { korean: "도움", english: "help", result: "도움" },
          ],
        },
      ],
    },
    {
      korean: "___ 주세요. / ___ 부탁드려요.",
      english: "Please give me ___ / I'd like ___. (polite)",
      examples: ["물 주세요.", "자리 부탁드려요."],
      swapCategories: [
        {
          label: "요청 (Requests)",
          items: [
            { korean: "물", english: "water", result: "물" },
            { korean: "메뉴", english: "a menu", result: "메뉴" },
            { korean: "자리", english: "a seat/table", result: "자리" },
            { korean: "영수증", english: "a receipt", result: "영수증" },
            { korean: "도움", english: "help", result: "도움" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "뭐 원해요?",
    "뭐 하고 싶어요?",
    "뭐 먹고 싶어요?",
    "뭐 마시고 싶어요?",
    "지금 제일 원하는 게 뭐예요?"
  ],
  replyPack: [
    "저는 ___ 원해요.",
    "저는 ___ 갖고 싶어요.",
    "저는 ___ 하고 싶어요.",
    "저는 ___ 먹고/마시고 싶어요.",
    "___ 있으면 좋겠어요."
  ],
  challenge: {
    prompt: "Write 3 lines: what you want + what you want to do + a polite request.",
    inputCount: 3
  }
};

export default content;