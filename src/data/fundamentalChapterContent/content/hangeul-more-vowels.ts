import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "More Vowels" },
    {
      type: "paragraph",
      text:
        "Beyond the core vowels, learners also need y-vowels and common combined vowels such as ㅑ, ㅕ, ㅛ, ㅠ, ㅐ, ㅔ, ㅘ, ㅝ, ㅚ, ㅟ, and ㅢ.",
    },
    { type: "divider" },
    { type: "heading_2", text: "Y-vowels" },
    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Note"],
      rows: [
        { word: "ㅑ", phonetic: "ya", meaning: "ㅣ + ㅏ 느낌" },
        { word: "ㅕ", phonetic: "yeo", meaning: "ㅣ + ㅓ 느낌" },
        { word: "ㅛ", phonetic: "yo", meaning: "ㅣ + ㅗ 느낌" },
        { word: "ㅠ", phonetic: "yu", meaning: "ㅣ + ㅜ 느낌" },
      ],
    },
    { type: "divider" },
    { type: "heading_2", text: "Common combined vowels" },
    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Made from"],
      rows: [
        { word: "ㅐ", phonetic: "ae", meaning: "ㅏ + ㅣ" },
        { word: "ㅔ", phonetic: "e", meaning: "ㅓ + ㅣ" },
        { word: "ㅘ", phonetic: "wa", meaning: "ㅗ + ㅏ" },
        { word: "ㅝ", phonetic: "wo", meaning: "ㅜ + ㅓ" },
        { word: "ㅚ", phonetic: "oe", meaning: "ㅗ + ㅣ" },
        { word: "ㅟ", phonetic: "wi", meaning: "ㅜ + ㅣ" },
        { word: "ㅢ", phonetic: "ui", meaning: "ㅡ + ㅣ" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text:
        "You don’t need perfect pronunciation yet. The goal is recognition so you can read beginner words without getting stuck.",
    },
  ],
};

