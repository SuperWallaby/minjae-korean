import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "What I Did",
    goal: "Talk about your day with 2–3 simple lines: what you did, where you went, and one small detail.",
  },
  coreFrames: [
    {
      korean: "오늘 ___ 했어요.",
      english: "I ___ today.",
      examples: ["오늘 운동했어요.", "오늘 일했어요."],
      swapCategories: [
        {
          label: "행동 (Actions)",
          items: [
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "일", english: "work", result: "일" },
            { korean: "공부", english: "study", result: "공부" },
            { korean: "청소", english: "clean", result: "청소" },
            { korean: "요리", english: "cook", result: "요리" },
          ],
        },
      ],
    },
    {
      korean: "오늘 ___ 먹었어요.",
      english: "I ate ___ today.",
      examples: ["오늘 라면 먹었어요.", "오늘 김밥 먹었어요."],
      swapCategories: [
        {
          label: "음식 (Food)",
          items: [
            { korean: "라면", english: "ramen", result: "라면" },
            { korean: "김밥", english: "gimbap", result: "김밥" },
            { korean: "피자", english: "pizza", result: "피자" },
            { korean: "샐러드", english: "salad", result: "샐러드" },
            { korean: "커피", english: "coffee", result: "커피" },
          ],
        },
      ],
    },
    {
      korean: "오늘 ___에 갔어요.",
      english: "I went to ___ today.",
      examples: ["오늘 카페에 갔어요.", "오늘 회사에 갔어요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "병원", english: "a hospital", result: "병원" },
            { korean: "공원", english: "a park", result: "공원" },
          ],
        },
      ],
    },
    {
      korean: "거기에서 ___ 했어요.",
      english: "I ___ there.",
      examples: ["거기에서 친구 만났어요.", "거기에서 커피 마셨어요."],
      swapCategories: [
        {
          label: "거기에서 (There)",
          items: [
            { korean: "친구 만났어요", english: "met a friend", result: "친구 만났어요" },
            { korean: "커피 마셨어요", english: "had coffee", result: "커피 마셨어요" },
            { korean: "사진 찍었어요", english: "took photos", result: "사진 찍었어요" },
            { korean: "산책했어요", english: "went for a walk", result: "산책했어요" },
            { korean: "쇼핑했어요", english: "went shopping", result: "쇼핑했어요" },
          ],
        },
      ],
    },
    {
      korean: "재밌었어요 / 좋았어요 / 힘들었어요.",
      english: "It was fun / good / hard.",
      examples: ["재밌었어요.", "좀 힘들었어요."],
      swapCategories: [
        {
          label: "느낌 (Feelings)",
          items: [
            { korean: "재밌었어요", english: "It was fun", result: "재밌었어요" },
            { korean: "좋았어요", english: "It was good", result: "좋았어요" },
            { korean: "힘들었어요", english: "It was hard", result: "힘들었어요" },
            { korean: "피곤했어요", english: "I was tired", result: "피곤했어요" },
            { korean: "별로였어요", english: "It wasn't great", result: "별로였어요" },
          ],
        },
      ],
    },
    {
      korean: "오늘 ___ 했어요? (질문)",
      english: "What did you do today?",
      examples: ["오늘 뭐 했어요?", "오늘 어디 갔어요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "뭐 했어요", english: "what did you do", result: "뭐 했어요" },
            { korean: "어디 갔어요", english: "where did you go", result: "어디 갔어요" },
            { korean: "뭐 먹었어요", english: "what did you eat", result: "뭐 먹었어요" },
            { korean: "재밌었어요", english: "was it fun", result: "재밌었어요" },
            { korean: "피곤했어요", english: "were you tired", result: "피곤했어요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "오늘 뭐 했어요?",
    "오늘 어디 갔어요?",
    "오늘 뭐 먹었어요?",
    "거기에서 뭐 했어요?",
    "어땠어요?",
  ],
  replyPack: [
    "오늘 ___ 했어요.",
    "오늘 ___ 먹었어요.",
    "오늘 ___에 갔어요.",
    "거기에서 ___ 했어요.",
    "재밌었어요 / 좋았어요 / 힘들었어요.",
  ],
  challenge: {
    prompt: "Write 3 lines: what you did + where you went + one detail.",
    inputCount: 3,
  },
};

export default content;