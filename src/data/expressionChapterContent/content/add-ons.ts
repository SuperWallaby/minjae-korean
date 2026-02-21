import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Add-ons",
    goal: "Connect your sentences with four tiny connectors: because, so, but, and.",
  },
  coreFrames: [
    {
      korean: "왜냐하면 ___(이)라서요.",
      english: "Because ___.",
      examples: ["왜냐하면 시간이 없어서요.", "왜냐하면 피곤해서요."],
      swapCategories: [
        {
          label: "이유 (Reasons)",
          items: [
            { korean: "시간이 없", english: "I don't have time", result: "시간이 없어서요" },
            { korean: "피곤하", english: "I'm tired", result: "피곤해서요" },
            { korean: "일이 많", english: "I have a lot of work", result: "일이 많아서요" },
            { korean: "배가 고프", english: "I'm hungry", result: "배가 고파서요" },
            { korean: "돈이 없", english: "I don't have money", result: "돈이 없어서요" }
          ]
        }
      ]
    },
    {
      korean: "그래서 ___ 했어요.",
      english: "So, I did ___. / That's why I ___.",
      examples: ["그래서 집에 갔어요.", "그래서 쉬었어요."],
      swapCategories: [
        {
          label: "결과 (Results)",
          items: [
            { korean: "집에 갔", english: "went home", result: "집에 갔어요" },
            { korean: "쉬", english: "rested", result: "쉬었어요" },
            { korean: "운동했", english: "worked out", result: "운동했어요" },
            { korean: "밥 먹었", english: "ate", result: "밥 먹었어요" },
            { korean: "일했", english: "worked", result: "일했어요" }
          ]
        }
      ]
    },
    {
      korean: "하지만 ___ 해요.",
      english: "But I ___.",
      examples: ["하지만 저는 괜찮아요.", "하지만 저는 바빠요."],
      swapCategories: [
        {
          label: "대비 (But)",
          items: [
            { korean: "괜찮", english: "I'm okay", result: "괜찮아요" },
            { korean: "바쁘", english: "I'm busy", result: "바빠요" },
            { korean: "피곤하", english: "I'm tired", result: "피곤해요" },
            { korean: "가고 싶", english: "I want to go", result: "가고 싶어요" },
            { korean: "모르겠", english: "I don't know", result: "모르겠어요" }
          ]
        }
      ]
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
            { korean: "산책했", english: "went for a walk", result: "산책했어요" }
          ]
        }
      ]
    }
  ],
  quickQuestions: [
    "왜요?",
    "그래서 어떻게 했어요?",
    "근데요?",
    "그리고요?",
    "그 다음엔요?"
  ],
  replyPack: [
    "왜냐하면 ___(이)라서요.",
    "그래서 ___ 했어요.",
    "하지만 ___ 해요.",
    "그리고 ___ 했어요.",
    "음… 잘 모르겠어요."
  ],
  challenge: {
    prompt: "Write 3 lines using connectors: because → so → and/but.",
    inputCount: 3
  }
};

export default content;