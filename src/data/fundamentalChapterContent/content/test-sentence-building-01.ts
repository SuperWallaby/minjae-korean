import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Sentence Building" },
    {
      type: "paragraph",
      text: "Choose the correct answer for each question.",
    },
    {
      type: "test",
      title: "Sentence Building quiz",
      questions: [
        {
          prompt: "Which pattern means 'I eat rice'?",
          choices: ["저는 밥을 먹어요.", "저는 먹어요 밥을.", "밥을 저는 먹어요.", "먹어요 저는 밥을."],
          answer: "저는 밥을 먹어요.",
        },
        {
          prompt: "After a noun with 받침 (consonant), which object particle do you use?",
          choices: ["를", "을", "는", "가"],
          answer: "을",
        },
        {
          prompt: "After a noun ending in a vowel (e.g. 커피), which object particle?",
          choices: ["을", "를", "은", "이"],
          answer: "를",
        },
        {
          prompt: "To say 'A is B' (e.g. I am a student), you use ___ after the noun B.",
          choices: ["이에요", "예요", "이에요 or 예요 (depends on preceding sound)", "해요"],
          answer: "이에요 or 예요 (depends on preceding sound)",
        },
        {
          prompt: "Which verb means 'to do' or 'to do (something)'?",
          choices: ["가다", "하다", "먹다", "보다"],
          answer: "하다",
        },
        {
          prompt: "Which verb means 'to go'?",
          choices: ["오다", "가다", "하다", "있다"],
          answer: "가다",
        },
      ],
    },
  ],
};
