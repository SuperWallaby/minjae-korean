import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "Because & So",
    goal: "Give a reason and a result with two tiny connectors: because → so.",
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
      english: "So I ___. / That's why I ___.",
      examples: ["그래서 집에 갔어요.", "그래서 쉬었어요."],
      swapCategories: [
        {
          label: "결과 (Results)",
          items: [
            { korean: "집에 갔", english: "went home", result: "집에 갔어요" },
            { korean: "쉬", english: "rested", result: "쉬었어요" },
            { korean: "밥 먹었", english: "ate", result: "밥 먹었어요" },
            { korean: "운동했", english: "worked out", result: "운동했어요" },
            { korean: "일했", english: "worked", result: "일했어요" }
          ]
        }
      ]
    },
    {
      korean: "___(이)라서 ___ 했어요.",
      english: "Because ___, I ___. (one sentence)",
      examples: ["피곤해서 일찍 잤어요.", "시간이 없어서 택시 탔어요."],
      swapCategories: [
        {
          label: "이유 (Because)",
          items: [
            { korean: "피곤하", english: "I'm tired", result: "피곤해서" },
            { korean: "시간이 없", english: "I don't have time", result: "시간이 없어서" },
            { korean: "비가 오", english: "it's raining", result: "비가 와서" },
            { korean: "배가 고프", english: "I'm hungry", result: "배가 고파서" },
            { korean: "돈이 없", english: "I don't have money", result: "돈이 없어서" }
          ]
        },
        {
          label: "결과 (Result)",
          items: [
            { korean: "일찍 잤", english: "slept early", result: "일찍 잤어요" },
            { korean: "택시 탔", english: "took a taxi", result: "택시 탔어요" },
            { korean: "집에 갔", english: "went home", result: "집에 갔어요" },
            { korean: "안 갔", english: "didn't go", result: "안 갔어요" },
            { korean: "쉬었", english: "rested", result: "쉬었어요" }
          ]
        }
      ]
    },
    {
      korean: "그래서 ___ 할 거예요.",
      english: "So I'm going to ___.",
      examples: ["그래서 내일 쉴 거예요.", "그래서 좀 일찍 갈 거예요."],
      swapCategories: [
        {
          label: "계획 (Plans)",
          items: [
            { korean: "쉴", english: "rest", result: "쉴" },
            { korean: "일찍 갈", english: "leave early", result: "일찍 갈" },
            { korean: "운동할", english: "work out", result: "운동할" },
            { korean: "공부할", english: "study", result: "공부할" },
            { korean: "집에 갈", english: "go home", result: "집에 갈" }
          ]
        }
      ]
    },
    {
      korean: "왜냐하면 ___(이)라서요. 그래서요?",
      english: "Because ___. So what happened next?",
      examples: ["왜냐하면 바빠서요. 그래서요?", "왜냐하면 피곤해서요. 그래서요?"],
      swapCategories: [
        {
          label: "연결 (Keep going)",
          items: [
            { korean: "그래서요?", english: "So what happened?", result: "그래서요?" },
            { korean: "그 다음엔요?", english: "And then?", result: "그 다음엔요?" },
            { korean: "그래서 어떻게 됐어요?", english: "So what happened?", result: "그래서 어떻게 됐어요?" }
          ]
        }
      ]
    },
    {
      korean: "왜요? / 그래서요? (질문)",
      english: "Why? / So then?",
      examples: ["왜요?", "그래서요?"],
      swapCategories: [
        {
          label: "짧은 질문 (Short)",
          items: [
            { korean: "왜요?", english: "Why?", result: "왜요?" },
            { korean: "그래서요?", english: "So?", result: "그래서요?" },
            { korean: "그래서 어떻게 했어요?", english: "So what did you do?", result: "그래서 어떻게 했어요?" }
          ]
        }
      ]
    }
  ],
  quickQuestions: [
    "왜요?",
    "왜냐하면 뭐예요?",
    "그래서 어떻게 했어요?",
    "그래서요?",
    "그 다음엔요?"
  ],
  replyPack: [
    "왜냐하면 ___(이)라서요.",
    "그래서 ___ 했어요.",
    "___(이)라서 ___ 했어요.",
    "그래서 ___ 할 거예요.",
    "왜냐하면 ___(이)라서요. 그래서요?"
  ],
  challenge: {
    prompt: "Write 3 lines: because + so (result) + one-sentence version.",
    inputCount: 3
  }
};

export default content;