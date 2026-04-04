import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Reading Practice: Simple Words" },
    {
      type: "paragraph",
      text:
        "Read short beginner-friendly words made of simple syllable blocks to build speed and confidence before learning final consonants (받침).",
    },
    { type: "divider" },
    { type: "heading_2", text: "Practice set (no batchim)" },
    {
      type: "soundword_table",
      headers: ["Word", "Break into blocks", "Meaning (English)"],
      rows: [
        { word: "나라", phonetic: "나 + 라", meaning: "country (basic word)" },
        { word: "바다", phonetic: "바 + 다", meaning: "sea" },
        { word: "나무", phonetic: "나 + 무", meaning: "tree" },
        { word: "우유", phonetic: "우 + 유", meaning: "milk" },
        { word: "이유", phonetic: "이 + 유", meaning: "reason" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text:
        "Don’t worry about vocabulary meaning yet—this is primarily a reading drill.",
    },
  ],
};

