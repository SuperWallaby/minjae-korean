import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Numbers" },
    {
      type: "paragraph",
      text: "Choose the correct answer for each question.",
    },
    {
      type: "test",
      title: "Numbers quiz",
      questions: [
        {
          prompt: "How do you say 0 in Korean? (number)",
          choices: ["영", "공", "일", "둘"],
          answer: "영",
        },
        {
          prompt: "How do you say 1 in Korean? (Sino-Korean)",
          choices: ["하나", "일", "둘", "이"],
          answer: "일",
        },
        {
          prompt: "How do you say 2 in Korean? (Sino-Korean)",
          choices: ["둘", "이", "삼", "사"],
          answer: "이",
        },
        {
          prompt: "After 하나 (1 in Native), what comes next?",
          choices: ["일", "둘", "두", "이"],
          answer: "둘",
        },
        {
          prompt: "How do you say 10 in Sino-Korean?",
          choices: ["십", "열", "구", "일십"],
          answer: "십",
        },
        {
          prompt: "How do you say 21 in Native Korean? (스물 + ?)",
          choices: ["스물일", "스물하나", "이십일", "스물한"],
          answer: "스물하나",
        },
      ],
    },
  ],
};
