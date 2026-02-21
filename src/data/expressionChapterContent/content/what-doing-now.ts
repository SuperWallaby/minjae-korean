import type { ExpressionChapterContent } from "../../expressionTypes";

const content: ExpressionChapterContent = {
  header: {
    title: "What I'm Doing Now",
    goal: "Say what you're doing right now, what you're about to do, and what you usually do at this time.",
  },
  coreFrames: [
    {
      korean: "지금 ___ 하고 있어요.",
      english: "I'm ___ right now.",
      examples: ["지금 일하고 있어요.", "지금 공부하고 있어요."],
      swapCategories: [
        {
          label: "지금 (Now)",
          items: [
            { korean: "일", english: "working", result: "일" },
            { korean: "공부", english: "studying", result: "공부" },
            { korean: "운동", english: "working out", result: "운동" },
            { korean: "요리", english: "cooking", result: "요리" },
            { korean: "휴식", english: "resting", result: "쉬" },
          ],
        },
      ],
    },
    {
      korean: "지금 ___ 중이에요.",
      english: "I'm in the middle of ___.",
      examples: ["지금 회의 중이에요.", "지금 수업 중이에요."],
      swapCategories: [
        {
          label: "중이에요 (In the middle of)",
          items: [
            { korean: "회의", english: "a meeting", result: "회의" },
            { korean: "수업", english: "a class", result: "수업" },
            { korean: "통화", english: "a call", result: "통화" },
            { korean: "운전", english: "driving", result: "운전" },
            { korean: "식사", english: "eating", result: "식사" },
          ],
        },
      ],
    },
    {
      korean: "지금 ___하고 있어서 나중에 연락할게요.",
      english: "I'm ___ right now, so I'll contact you later.",
      examples: ["지금 일하고 있어서 나중에 연락할게요.", "지금 운전하고 있어서 나중에 연락할게요."],
      swapCategories: [
        {
          label: "상황 (Situations)",
          items: [
            { korean: "일", english: "working", result: "일" },
            { korean: "회의", english: "in a meeting", result: "회의" },
            { korean: "운전", english: "driving", result: "운전" },
            { korean: "수업", english: "in class", result: "수업" },
            { korean: "운동", english: "working out", result: "운동" },
          ],
        },
      ],
    },
    {
      korean: "저는 지금 ___하려고 해요.",
      english: "I'm about to ___ / I'm going to ___ now.",
      examples: ["저는 지금 밥 먹으려고 해요.", "저는 지금 나가려고 해요."],
      swapCategories: [
        {
          label: "하려고 해요 (About to)",
          items: [
            { korean: "밥 먹", english: "eat", result: "밥 먹" },
            { korean: "샤워하", english: "shower", result: "샤워하" },
            { korean: "나가", english: "go out", result: "나가" },
            { korean: "잠자", english: "sleep", result: "잠자" },
            { korean: "공부하", english: "study", result: "공부하" },
          ],
        },
      ],
    },
    {
      korean: "이 시간에는 보통 ___ 해요.",
      english: "I usually ___ at this time.",
      examples: ["이 시간에는 보통 일해요.", "이 시간에는 보통 쉬어요."],
      swapCategories: [
        {
          label: "보통 (Usually)",
          items: [
            { korean: "일", english: "work", result: "일" },
            { korean: "운동", english: "work out", result: "운동" },
            { korean: "저녁 먹", english: "eat dinner", result: "저녁 먹" },
            { korean: "공부하", english: "study", result: "공부하" },
            { korean: "쉬", english: "rest", result: "쉬" },
          ],
        },
      ],
    },
    {
      korean: "지금 뭐 하고 있어요? (질문)",
      english: "What are you doing right now?",
      examples: ["지금 뭐 하고 있어요?", "지금 뭐 해요?"],
      swapCategories: [
        {
          label: "질문 (Questions)",
          items: [
            { korean: "뭐 하고 있어요", english: "what are you doing", result: "뭐 하고 있어요" },
            { korean: "뭐 해요", english: "what are you doing (short)", result: "뭐 해요" },
            { korean: "바빠요", english: "are you busy", result: "바빠요" },
            { korean: "지금 괜찮아요", english: "are you okay now", result: "지금 괜찮아요" },
            { korean: "통화 가능해요", english: "can you talk", result: "통화 가능해요" },
          ],
        },
      ],
    },
  ],
  quickQuestions: [
    "지금 뭐 하고 있어요?",
    "지금 바빠요?",
    "지금 괜찮아요?",
    "지금 뭐 하는 중이에요?",
    "지금 어디예요?",
  ],
  replyPack: [
    "지금 ___ 하고 있어요.",
    "지금 ___ 중이에요.",
    "지금 ___하고 있어서 나중에 연락할게요.",
    "저는 지금 ___하려고 해요.",
    "이 시간에는 보통 ___ 해요.",
  ],
  challenge: {
    prompt: "Write 3 lines: what you're doing now + what you're about to do + a question back.",
    inputCount: 3,
  },
};

export default content;