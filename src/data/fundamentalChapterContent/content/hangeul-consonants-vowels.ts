import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Consonants & Vowels" },
    {
      type: "paragraph",
      text: "Let's learn the basic Hangul consonants and vowels. These are the building blocks used to form syllable blocks (글자).",
    },

    { type: "heading_2", text: "Basic consonants" },

    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Name"],
      rows: [
        { word: "ㄱ", phonetic: "g/k", meaning: "Giyeok" },
        { word: "ㄴ", phonetic: "n", meaning: "Nieun" },
        { word: "ㄷ", phonetic: "d/t", meaning: "Digeut" },
        { word: "ㄹ", phonetic: "r/l", meaning: "Rieul" },
        { word: "ㅁ", phonetic: "m", meaning: "Mieum" },
        { word: "ㅂ", phonetic: "b/p", meaning: "Bieup" },
        { word: "ㅅ", phonetic: "s", meaning: "Siot" },
        { word: "ㅇ", phonetic: "ng / (silent)", meaning: "Ieung" },
        { word: "ㅈ", phonetic: "j", meaning: "Jieut" },
        { word: "ㅊ", phonetic: "ch", meaning: "Chieut" },
        { word: "ㅋ", phonetic: "k", meaning: "Kieuk" },
        { word: "ㅌ", phonetic: "t", meaning: "Tieut" },
        { word: "ㅍ", phonetic: "p", meaning: "Pieup" },
        { word: "ㅎ", phonetic: "h", meaning: "Hieut" },
      ],
    },

    { type: "heading_2", text: "Basic vowels" },

    {
      type: "soundword_table",
      headers: ["Letter", "Phonetic", "Name"],
      rows: [
        { word: "ㅏ", phonetic: "a", meaning: "A" },
        { word: "ㅑ", phonetic: "ya", meaning: "Ya" },
        { word: "ㅓ", phonetic: "eo", meaning: "Eo" },
        { word: "ㅕ", phonetic: "yeo", meaning: "Yeo" },
        { word: "ㅗ", phonetic: "o", meaning: "O" },
        { word: "ㅛ", phonetic: "yo", meaning: "Yo" },
        { word: "ㅜ", phonetic: "u", meaning: "U" },
        { word: "ㅠ", phonetic: "yu", meaning: "Yu" },
        { word: "ㅡ", phonetic: "eu", meaning: "Eu" },
        { word: "ㅣ", phonetic: "i", meaning: "I" },
      ],
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "🔊",
      text: "Some consonants can sound different by position (e.g., ㄱ can be closer to 'k' at the start and closer to 'g' between vowels).",
    },
  ],
};
