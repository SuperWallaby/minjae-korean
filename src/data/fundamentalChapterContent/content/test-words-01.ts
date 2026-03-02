import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Test: Essential Words" },
    {
      type: "paragraph",
      text: "Choose the correct Korean word for each question.",
    },
    {
      type: "test",
      title: "Vocabulary quiz",
      questions: [
        {
          prompt: '"I" or "me" in Korean?',
          choices: ["나", "너", "우리", "저"],
          answer: "나",
        },
        {
          prompt: '"You" (casual, between friends)?',
          choices: ["나", "너", "당신", "그"],
          answer: "너",
        },
        {
          prompt: '"Friend"?',
          choices: ["친구", "가족", "선생님", "사람"],
          answer: "친구",
        },
        {
          prompt: '"House" or "home"?',
          choices: ["학교", "집", "회사", "카페"],
          answer: "집",
        },
        {
          prompt: '"School"?',
          choices: ["집", "학교", "회사", "화장실"],
          answer: "학교",
        },
        {
          prompt: '"Water"?',
          choices: ["물", "밥", "커피", "돈"],
          answer: "물",
        },
        {
          prompt: '"Money"?',
          choices: ["돈", "시간", "물", "이름"],
          answer: "돈",
        },
        {
          prompt: '"Today"?',
          choices: ["오늘", "내일", "어제", "모레"],
          answer: "오늘",
        },
        {
          prompt: '"Tomorrow"?',
          choices: ["오늘", "내일", "어제", "그제"],
          answer: "내일",
        },
        {
          prompt: '"Yesterday"?',
          choices: ["오늘", "내일", "어제", "모레"],
          answer: "어제",
        },
      ],
    },
  ],
};
