import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Reading Practice: Simple Blocks" },
    {
      type: "paragraph",
      text:
        "Practice reading simple syllables such as 가, 나, 다, 거, 너, 더, 고, 노, 도, 구, 누, 두 before moving on to full words.",
    },
    { type: "divider" },
    { type: "heading_2", text: "Slow → fast" },
    {
      type: "callout",
      emoji: "⏱️",
      text:
        "Start slow, then speed up. Your goal is instant recognition of each block.",
    },
    {
      type: "soundword_table",
      headers: ["Set A", "Set B", "Set C"],
      rows: [
        { word: "가 나 다", phonetic: "ka/na/da", meaning: "거 너 더" },
        { word: "고 노 도", phonetic: "go/no/do", meaning: "구 누 두" },
        { word: "라 마 바", phonetic: "ra/ma/ba", meaning: "사 아 자" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text:
        "If you hesitate, go back to the syllable table and drill that consonant/vowel pair.",
    },
  ],
};

