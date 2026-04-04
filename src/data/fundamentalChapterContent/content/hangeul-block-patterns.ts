import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Block Patterns" },
    {
      type: "paragraph",
      text:
        "Korean syllables can be arranged left-to-right or top-to-bottom depending on the vowel shape. Understanding these patterns makes reading much easier.",
    },
    { type: "divider" },
    { type: "heading_2", text: "Two main layouts" },
    {
      type: "soundword_table",
      headers: ["Vowel shape", "Layout", "Example"],
      rows: [
        { word: "Vertical vowels", phonetic: "to the right", meaning: "가, 너, 디" },
        { word: "Horizontal vowels", phonetic: "below", meaning: "고, 두, 르" },
      ],
    },
    { type: "divider" },
    { type: "heading_2", text: "Why 가/고/구/화 look different" },
    {
      type: "callout",
      emoji: "🧩",
      text:
        "Same consonant + different vowel shape = different block layout. It’s still the same building rule.",
    },
    {
      type: "soundword_table",
      headers: ["Build", "Result", "Note"],
      rows: [
        { word: "ㄱ + ㅏ", phonetic: "가", meaning: "vowel to the right" },
        { word: "ㄱ + ㅗ", phonetic: "고", meaning: "vowel below" },
        { word: "ㅎ + ㅘ", phonetic: "화", meaning: "combined vowel still follows shape" },
      ],
    },
  ],
};

