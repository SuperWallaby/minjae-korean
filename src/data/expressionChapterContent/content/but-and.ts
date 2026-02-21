import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "But & And",
    goal: "Add contrast and continue smoothly with two easy connectors: but → and.",
  },
  coreFrames: [
    {
      korean: "그런데 ___ 해요.",
      english: "But / By the way, I ___.",
      examples: ["그런데 오늘은 바빠요.", "그런데 저는 괜찮아요."],
      swapCategories: [
        {
          label: "자주 쓰는 뒤문장 (Common)",
          items: [
            { korean: "오늘은 바쁘", english: "I'm busy today", result: "오늘은 바빠요" },
            { korean: "지금은 피곤하", english: "I'm tired now", result: "지금은 피곤해요" },
            { korean: "저는 괜찮", english: "I'm okay", result: "저는 괜찮아요" },
            { korean: "시간이 없", english: "I don't have time", result: "시간이 없어요" },
            { korean: "잘 모르겠", english: "I don't really know", result: "잘 모르겠어요" },
          ],
        },
      ],
    },
    {
      korean: "하지만 ___ 해요.",
      english: "However / But I ___.",
      examples: ["하지만 저는 갈 거예요.", "하지만 저는 해볼게요."],
      swapCategories: [
        {
          label: "결심/반전 (Contrast)",
          items: [
            { korean: "갈 거예요", english: "I'm going to go", result: "갈 거예요" },
            { korean: "해볼게요", english: "I'll try", result: "해볼게요" },
            { korean: "괜찮아요", english: "it's okay", result: "괜찮아요" },
            { korean: "조금 힘들어요", english: "it's a bit hard", result: "조금 힘들어요" },
            { korean: "좋아해요", english: "I like it", result: "좋아해요" },
          ],
        },
      ],
    },
    {
      korean: "___(은/는) 좋은데, ___(은/는) 별로예요.",
      english: "___ is good, but ___ is not.",
      examples: ["커피는 좋은데, 차는 별로예요.", "서울은 좋은데, 너무 비싸요."],
      swapCategories: [
        {
          label: "비교 (Compare)",
          items: [
            { korean: "커피 / 차", english: "coffee / tea", result: "커피는 / 차는" },
            { korean: "서울 / 가격", english: "Seoul / prices", result: "서울은 / 가격은" },
            { korean: "여행 / 비행", english: "travel / flights", result: "여행은 / 비행은" },
          ],
        },
      ],
    },
    {
      korean: "그리고 ___ 했어요.",
      english: "And I ___.",
      examples: ["그리고 커피 마셨어요.", "그리고 친구 만났어요."],
      swapCategories: [
        {
          label: "추가 (And)",
          items: [
            { korean: "커피 마셨", english: "had coffee", result: "커피 마셨어요" },
            { korean: "친구 만났", english: "met a friend", result: "친구 만났어요" },
            { korean: "쇼핑했", english: "went shopping", result: "쇼핑했어요" },
            { korean: "영화 봤", english: "watched a movie", result: "영화 봤어요" },
            { korean: "산책했", english: "went for a walk", result: "산책했어요" },
          ],
        },
      ],
    },
    {
      korean: "그리고 나서 ___ 했어요.",
      english: "And then I ___.",
      examples: ["그리고 나서 집에 갔어요.", "그리고 나서 쉬었어요."],
      swapCategories: [
        {
          label: "그 다음 (Then)",
          items: [
            { korean: "집에 갔", english: "went home", result: "집에 갔어요" },
            { korean: "쉬었", english: "rested", result: "쉬었어요" },
            { korean: "밥 먹었", english: "ate", result: "밥 먹었어요" },
            { korean: "공부했", english: "studied", result: "공부했어요" },
            { korean: "잤", english: "slept", result: "잤어요" },
          ],
        },
      ],
    },
    {
      korean: "근데요? / 그리고요? (질문)",
      english: "But? / And then?",
      examples: ["근데요?", "그리고요?"],
      swapCategories: [
        {
          label: "짧은 질문 (Short)",
          items: [
            { korean: "근데요?", english: "But then?", result: "근데요?" },
            { korean: "그리고요?", english: "And then?", result: "그리고요?" },
            { korean: "그 다음엔요?", english: "What next?", result: "그 다음엔요?" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "근데요?",
    "그리고요?",
    "그 다음엔요?",
    "하지만 왜요?",
    "그러면 뭐 했어요?"
  ],
  replyPack: [
    "그런데 ___ 해요.",
    "하지만 ___ 해요.",
    "___(은/는) 좋은데, ___(은/는) 별로예요.",
    "그리고 ___ 했어요.",
    "그리고 나서 ___ 했어요."
  ],
  challenge: {
    prompt: "Write 3 lines: one contrast with but + one extra sentence with and + one 'and then'.",
    inputCount: 3
  }
};

export default content;