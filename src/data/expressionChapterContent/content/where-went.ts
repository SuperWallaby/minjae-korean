import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Where I Went",
    goal: "Say where you went, what you did there, and add one small detail to sound natural.",
  },
  coreFrames: [
    {
      korean: "오늘 ___에 갔어요.",
      english: "I went to ___ today.",
      examples: ["오늘 카페에 갔어요.", "오늘 공원에 갔어요."],
      swapCategories: [
        {
          label: "장소 (Places)",
          items: [
            { korean: "카페", english: "a cafe", result: "카페" },
            { korean: "공원", english: "a park", result: "공원" },
            { korean: "회사", english: "work", result: "회사" },
            { korean: "학교", english: "school", result: "학교" },
            { korean: "병원", english: "a hospital", result: "병원" },
          ],
        },
      ],
    },
    {
      korean: "거기에서 ___ 했어요.",
      english: "I ___ there.",
      examples: ["거기에서 커피 마셨어요.", "거기에서 친구 만났어요."],
      swapCategories: [
        {
          label: "거기에서 (There)",
          items: [
            { korean: "커피 마셨어요", english: "had coffee", result: "커피 마셨어요" },
            { korean: "친구 만났어요", english: "met a friend", result: "친구 만났어요" },
            { korean: "사진 찍었어요", english: "took photos", result: "사진 찍었어요" },
            { korean: "산책했어요", english: "went for a walk", result: "산책했어요" },
            { korean: "공부했어요", english: "studied", result: "공부했어요" },
          ],
        },
      ],
    },
    {
      korean: "___에서 ___ 했어요.",
      english: "I ___ at/in ___ .",
      examples: ["카페에서 공부했어요.", "공원에서 산책했어요."],
      swapCategories: [
        {
          label: "장소+행동 (Place + Action)",
          items: [
            { korean: "카페에서 공부했어요", english: "studied at a cafe", result: "카페에서 공부했어요" },
            { korean: "공원에서 산책했어요", english: "walked in a park", result: "공원에서 산책했어요" },
            { korean: "집에서 쉬었어요", english: "rested at home", result: "집에서 쉬었어요" },
            { korean: "회사에서 일했어요", english: "worked at the office", result: "회사에서 일했어요" },
            { korean: "병원에서 검사했어요", english: "got a checkup", result: "병원에서 검사했어요" },
          ],
        },
      ],
    },
    {
      korean: "___랑/이랑 같이 갔어요.",
      english: "I went with ___.",
      examples: ["친구랑 같이 갔어요.", "혼자 갔어요."],
      swapCategories: [
        {
          label: "누구랑 (With who)",
          items: [
            { korean: "친구", english: "a friend", result: "친구랑 같이 갔어요" },
            { korean: "가족", english: "family", result: "가족이랑 같이 갔어요" },
            { korean: "동료", english: "a coworker", result: "동료랑 같이 갔어요" },
            { korean: "연인", english: "a partner", result: "연인이랑 같이 갔어요" },
            { korean: "혼자", english: "alone", result: "혼자 갔어요" },
          ],
        },
      ],
    },
    {
      korean: "재밌었어요 / 좋았어요 / 별로였어요.",
      english: "It was fun / good / not great.",
      examples: ["재밌었어요.", "생각보다 별로였어요."],
      swapCategories: [
        {
          label: "느낌 (How it was)",
          items: [
            { korean: "재밌었어요", english: "It was fun", result: "재밌었어요" },
            { korean: "좋았어요", english: "It was good", result: "좋았어요" },
            { korean: "별로였어요", english: "It wasn't great", result: "별로였어요" },
            { korean: "피곤했어요", english: "I was tired", result: "피곤했어요" },
            { korean: "괜찮았어요", english: "It was okay", result: "괜찮았어요" },
          ],
        },
      ],
    },
    {
      korean: "오늘 어디 갔어요? (질문)",
      english: "Where did you go today?",
      examples: ["오늘 어디 갔어요?", "거기에서 뭐 했어요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "오늘 어디 갔어요", english: "where did you go today", result: "오늘 어디 갔어요" },
            { korean: "거기에서 뭐 했어요", english: "what did you do there", result: "거기에서 뭐 했어요" },
            { korean: "누구랑 갔어요", english: "who did you go with", result: "누구랑 갔어요" },
            { korean: "어땠어요", english: "how was it", result: "어땠어요" },
            { korean: "또 갈 거예요", english: "will you go again", result: "또 갈 거예요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: ["오늘 어디 갔어요?", "거기에서 뭐 했어요?", "누구랑 갔어요?", "어땠어요?", "또 갈 거예요?"],
  replyPack: [
    "오늘 ___에 갔어요.",
    "거기에서 ___ 했어요.",
    "___에서 ___ 했어요.",
    "___랑/이랑 같이 갔어요. / 혼자 갔어요.",
    "재밌었어요 / 좋았어요 / 별로였어요.",
  ],
  challenge: {
    prompt: "Write 3 lines: where you went + what you did there + who you went with (or how it was).",
    inputCount: 3,
  },
};

export default content;