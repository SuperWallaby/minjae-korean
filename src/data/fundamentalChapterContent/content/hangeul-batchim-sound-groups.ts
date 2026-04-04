import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Batchim Sound Groups" },
    {
      type: "paragraph",
      text:
        "Although many final consonants are written differently, they are often pronounced as a smaller set of basic sounds such as ㄱ, ㄴ, ㄷ, ㄹ, ㅁ, ㅂ, and ㅇ.",
    },
    { type: "divider" },
    {
      type: "callout",
      emoji: "🎯",
      text:
        "For reading, the sound group matters more than the exact written batchim letter.",
    },
    {
      type: "soundword_table",
      headers: ["Sound group", "Ends like", "Common letters"],
      rows: [
        { word: "ㄱ-group", phonetic: "k", meaning: "ㄱ, ㄲ, ㅋ" },
        { word: "ㄴ-group", phonetic: "n", meaning: "ㄴ" },
        { word: "ㄷ-group", phonetic: "t", meaning: "ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅌ, ㅎ (often)" },
        { word: "ㄹ-group", phonetic: "l", meaning: "ㄹ" },
        { word: "ㅁ-group", phonetic: "m", meaning: "ㅁ" },
        { word: "ㅂ-group", phonetic: "p", meaning: "ㅂ, ㅍ" },
        { word: "ㅇ-group", phonetic: "ng", meaning: "ㅇ" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text:
        "You can treat this as a cheat sheet for early reading. Detailed rules can come later.",
    },
  ],
};

