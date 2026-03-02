import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Places" },
    {
      type: "paragraph",
      text: "These place words help you talk about where you are and where you’re going. Learn the nouns first, then practice simple location and movement sentences.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core place nouns" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "집", phonetic: "home / house", meaning: "very common" },
        { word: "학교", phonetic: "school", meaning: "common daily word" },
        { word: "회사", phonetic: "company / office", meaning: "workplace" },
        { word: "카페", phonetic: "café", meaning: "loanword" },
        { word: "식당", phonetic: "restaurant", meaning: "useful everywhere" },
        { word: "화장실", phonetic: "restroom", meaning: "must-know" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Here / there" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Example idea"],
      rows: [
        { word: "여기", phonetic: "here", meaning: "여기 있어요 (it’s here)" },
        { word: "거기", phonetic: "there (near you)", meaning: "거기예요 (it’s there)" },
        { word: "저기", phonetic: "over there (far)", meaning: "저기 있어요 (it’s over there)" },
        { word: "어디", phonetic: "where", meaning: "어디예요? (where is it?)" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "여기 = near the speaker, 거기 = near the listener, 저기 = far from both.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Very useful phrases" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Focus"],
      rows: [
        { word: "집에 가요.", phonetic: "I’m going home.", meaning: "place + 에 (to)" },
        { word: "학교에 가요.", phonetic: "I go to school.", meaning: "destination" },
        { word: "카페에 있어요.", phonetic: "I’m at a café.", meaning: "location + 에 (at)" },
        { word: "회사에서 일해요.", phonetic: "I work at the office.", meaning: "place of action + 에서" },
        { word: "화장실 어디예요?", phonetic: "Where is the restroom?", meaning: "어디예요?" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Say the Korean sentence out loud. Swap the place word to make new sentences.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Try swapping"],
      rows: [
        { word: "I’m at home.", phonetic: "집에 있어요.", meaning: "학교 / 카페" },
        { word: "I’m going to a café.", phonetic: "카페에 가요.", meaning: "회사 / 식당" },
        { word: "Where is the restroom?", phonetic: "화장실 어디예요?", meaning: "학교 / 회사" },
        { word: "It’s over there.", phonetic: "저기예요.", meaning: "여기예요 / 거기예요" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize common place words and use them in simple sentences with 여기/거기/저기 and 에/에서.",
    },
  ],
};