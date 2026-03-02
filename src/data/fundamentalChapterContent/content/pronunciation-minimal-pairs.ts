import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Must-Distinguish Sounds" },
    {
      type: "paragraph",
      text: "Some Korean sounds are easy to confuse at first. In this chapter, you’ll practice key minimal pairs that change meaning when you mix them up.",
    },

    { type: "divider" },

    // ㄹ / ㄴ
    { type: "heading_2", text: "ㄹ vs ㄴ" },
    {
      type: "callout",
      emoji: "👅",
      text: "ㄴ is a clear 'n' sound. ㄹ changes by position: between vowels it’s closer to a quick 'r', and at the end it’s closer to 'l'.",
    },
    {
      type: "soundword_table",
      headers: ["Sound", "Phonetic", "Tip"],
      rows: [
        { word: "ㄴ", phonetic: "n", meaning: "Tongue stays firm behind the teeth ridge" },
        { word: "ㄹ", phonetic: "r/l", meaning: "A quick tap (r) or an l-like ending" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Minimal pair", "Meaning A", "Meaning B"],
      rows: [
        { word: "나 / 라", phonetic: "na / ra", meaning: "I / (ra-sound practice)" },
        { word: "노 / 로", phonetic: "no / ro", meaning: "no / (ro-sound practice)" },
        { word: "누 / 루", phonetic: "nu / ru", meaning: "(nu practice) / (ru practice)" },
        { word: "니 / 리", phonetic: "ni / ri", meaning: "(ni practice) / (ri practice)" },
      ],
    },
    {
      type: "callout",
      emoji: "🎯",
      text: "Practice idea: say ㄴ with a steady 'n'. For ㄹ, try a quick tongue tap once (like a light 'r').",
    },

    { type: "divider" },

    // ㅓ / ㅗ
    { type: "heading_2", text: "ㅓ vs ㅗ" },
    {
      type: "callout",
      emoji: "🫦",
      text: "ㅗ uses rounded lips (o). ㅓ is more open and relaxed (eo). Don’t round your lips too much for ㅓ.",
    },
    {
      type: "soundword_table",
      headers: ["Vowel", "Phonetic", "Mouth shape"],
      rows: [
        { word: "ㅓ", phonetic: "eo", meaning: "More open, less rounding" },
        { word: "ㅗ", phonetic: "o", meaning: "More rounded lips" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Minimal pair", "Meaning A", "Meaning B"],
      rows: [
        { word: "서 / 소", phonetic: "seo / so", meaning: "(seo practice) / (so practice)" },
        { word: "너 / 노", phonetic: "neo / no", meaning: "you / (no practice)" },
        { word: "거 / 고", phonetic: "geo / go", meaning: "(geo practice) / (go practice)" },
        { word: "어 / 오", phonetic: "eo / o", meaning: "(eo practice) / come (오다)" },
      ],
    },
    {
      type: "callout",
      emoji: "🎧",
      text: "Check yourself: if your lips are very round, you’re probably saying ㅗ. For ㅓ, relax the lips and open slightly more.",
    },

    { type: "divider" },

    // ㅜ / ㅡ
    { type: "heading_2", text: "ㅜ vs ㅡ" },
    {
      type: "callout",
      emoji: "🧭",
      text: "ㅜ is rounded (u). ㅡ is flat/unrounded (eu) with the lips spread and the tongue pulled back.",
    },
    {
      type: "soundword_table",
      headers: ["Vowel", "Phonetic", "Mouth shape"],
      rows: [
        { word: "ㅜ", phonetic: "u", meaning: "Round the lips" },
        { word: "ㅡ", phonetic: "eu", meaning: "Lips flat, not rounded" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Minimal pair", "Meaning A", "Meaning B"],
      rows: [
        { word: "수 / 스", phonetic: "su / seu", meaning: "(su practice) / (seu practice)" },
        { word: "주 / 즈", phonetic: "ju / jeu", meaning: "(ju practice) / (jeu practice)" },
        { word: "구 / 그", phonetic: "gu / geu", meaning: "(gu practice) / he/that (그)" },
        { word: "누 / 느", phonetic: "nu / neu", meaning: "(nu practice) / (neu practice)" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Tip: Say ㅜ with a clear lip round. For ㅡ, keep lips relaxed and flat—almost like a muted vowel.",
    },

    { type: "divider" },

    // ㅐ / ㅔ
    { type: "heading_2", text: "ㅐ vs ㅔ" },
    {
      type: "callout",
      emoji: "📝",
      text: "In modern Korean, ㅐ and ㅔ often sound very similar. Still, you should recognize and read them correctly.",
    },
    {
      type: "soundword_table",
      headers: ["Vowel", "Phonetic", "Note"],
      rows: [
        { word: "ㅐ", phonetic: "ae", meaning: "Often close to 'e' for many speakers" },
        { word: "ㅔ", phonetic: "e", meaning: "Often close to 'e' for many speakers" },
      ],
    },
    {
      type: "soundword_table",
      headers: ["Common words", "Meaning", "Pronunciation (approx.)"],
      rows: [
        { word: "네", phonetic: "yes", meaning: "ne" },
        { word: "내", phonetic: "my", meaning: "nae (often sounds like ne)" },
        { word: "배", phonetic: "pear / stomach / boat", meaning: "bae" },
        { word: "베", phonetic: "(rare) / loanwords", meaning: "be" },
        { word: "새", phonetic: "new / bird", meaning: "sae" },
        { word: "세", phonetic: "three (Sino-Korean)", meaning: "se" },
      ],
    },
    {
      type: "callout",
      emoji: "🎯",
      text: "Don’t stress about perfectly separating ㅐ vs ㅔ. Focus on reading and spelling accurately—meaning usually comes from context.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Read each pair twice: (1) slowly and clearly, (2) faster while keeping the contrast.",
    },
    {
      type: "soundword_table",
      headers: ["Set A", "Set B", "Set C"],
      rows: [
        { word: "나-라 / 너-노", phonetic: "ㄴ vs ㄹ, ㅓ vs ㅗ", meaning: "Focus: tongue tap vs steady n" },
        { word: "수-스 / 구-그", phonetic: "ㅜ vs ㅡ", meaning: "Focus: rounded vs flat lips" },
        { word: "내-네 / 새-세", phonetic: "ㅐ vs ㅔ", meaning: "Focus: spelling + context" },
      ],
    },

    {
      type: "callout",
      emoji: "✅",
      text: "Chapter goal: train your ear and mouth for these pairs so you don’t confuse common words later.",
    },
  ],
};