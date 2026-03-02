import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Hangeul (Reading)" },
    {
      type: "paragraph",
      text: "Choose the correct answer for each question.",
    },
    {
      type: "test",
      title: "Reading quiz",
      questions: [
        {
          prompt: "How do you read 0 in Korean? (number; both 영 and 공 are used)",
          choices: ["공", "영", "일", "이"],
          answer: "영",
        },
        {
          prompt: "How do you read 1 in Korean? (Sino-Korean)",
          choices: ["하나", "일", "둘", "이"],
          answer: "일",
        },
        {
          prompt: "What is the name of ㄱ?",
          choices: ["기역", "니은", "디귿", "리을"],
          answer: "기역",
        },
        {
          prompt: "What is the name of ㅏ?",
          choices: ["아", "야", "어", "여"],
          answer: "아",
        },
      ],
    },
  ],
};
