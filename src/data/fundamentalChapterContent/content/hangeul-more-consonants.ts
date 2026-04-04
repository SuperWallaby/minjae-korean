import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "More Consonants" },
    {
      type: "paragraph",
      text:
        "In addition to the core consonants, Korean also has aspirated and tense consonants such as ㅋ, ㅌ, ㅍ, ㅊ and ㄲ, ㄸ, ㅃ, ㅆ, ㅉ.",
    },
    { type: "divider" },
    { type: "heading_2", text: "Aspirated (격음)" },
    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Pair"],
      rows: [
        { word: "ㅋ", phonetic: "kʰ", meaning: "ㄱ ↔ ㅋ" },
        { word: "ㅌ", phonetic: "tʰ", meaning: "ㄷ ↔ ㅌ" },
        { word: "ㅍ", phonetic: "pʰ", meaning: "ㅂ ↔ ㅍ" },
        { word: "ㅊ", phonetic: "chʰ", meaning: "ㅈ ↔ ㅊ" },
      ],
    },
    { type: "divider" },
    { type: "heading_2", text: "Tense (쌍자음)" },
    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Pair"],
      rows: [
        { word: "ㄲ", phonetic: "kk", meaning: "ㄱ ↔ ㄲ" },
        { word: "ㄸ", phonetic: "tt", meaning: "ㄷ ↔ ㄸ" },
        { word: "ㅃ", phonetic: "pp", meaning: "ㅂ ↔ ㅃ" },
        { word: "ㅆ", phonetic: "ss", meaning: "ㅅ ↔ ㅆ" },
        { word: "ㅉ", phonetic: "jj", meaning: "ㅈ ↔ ㅉ" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text:
        "Goal: recognize these letters early so beginner reading doesn't feel incomplete.",
    },
  ],
};

