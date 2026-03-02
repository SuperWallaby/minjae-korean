import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Common Sound Changes" },
    {
      type: "paragraph",
      text: "Korean pronunciation often changes in connected speech. These changes are predictable and very common, especially around ㄴ/ㄹ and batchim (final consonants).",
    },

    { type: "divider" },

    // 1) ㄴ/ㄹ interactions
    { type: "heading_2", text: "ㄴ ↔ ㄹ interactions (very common)" },
    {
      type: "callout",
      emoji: "🎯",
      text: "When ㄴ and ㄹ meet, they often change to make pronunciation smoother. Learn these two patterns first—they appear everywhere.",
    },

    {
      type: "soundword_table",
      headers: ["Pattern", "Often becomes", "Example (written → sounds like)"],
      rows: [
        {
          word: "ㄴ + ㄹ",
          phonetic: "ㄹ + ㄹ",
          meaning: "신라 → sill-a, 한류 → hall-yu",
        },
        {
          word: "ㄹ + ㄴ",
          phonetic: "ㄹ + ㄹ",
          meaning: "설날 → seol-lal, 물난리 → mul-lal-i (approx.)",
        },
      ],
    },
    {
      type: "callout",
      emoji: "🧠",
      text: "Shortcut: if you see ㄴ and ㄹ side-by-side (in either order), try reading it as ㄹㄹ.",
    },

    { type: "divider" },

    // 2) Linking (연음) with ㅇ
    { type: "heading_2", text: "Linking before ㅇ (연음)" },
    {
      type: "callout",
      emoji: "➡️",
      text: "When the next syllable starts with ㅇ, the batchim sound usually links to the next syllable instead of stopping.",
    },
    {
      type: "soundword_table",
      headers: ["Written", "Breakdown", "Often sounds like"],
      rows: [
        { word: "먹어", phonetic: "먹 + 어", meaning: "meo-geo" },
        { word: "한국어", phonetic: "한 + 국 + 어", meaning: "han-gu-geo" },
        { word: "옷을", phonetic: "옷 + 을", meaning: "o-seul / o-teul (varies)" },
        { word: "밥을", phonetic: "밥 + 을", meaning: "ba-beul" },
      ],
    },

    { type: "divider" },

    // 3) Batchim outcomes (7 final sounds)
    { type: "heading_2", text: "Batchim outcomes (final sound groups)" },
    {
      type: "paragraph",
      text: "Many final consonants collapse into a small set of ending sounds. This is why different letters can sound identical at the end of a syllable.",
    },
    {
      type: "soundword_table",
      headers: ["Final sound", "Ends like", "Common letters"],
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

    { type: "divider" },

    // 4) A few very frequent "outcome rules" learners notice immediately
    { type: "heading_2", text: "Very frequent outcome rules (starter set)" },
    {
      type: "callout",
      emoji: "✅",
      text: "You don’t need every rule now. These are the ones you’ll hear constantly in everyday speech.",
    },
    {
      type: "soundword_table",
      headers: ["Rule", "Example (written)", "Often sounds like"],
      rows: [
        {
          word: "ㅎ weakens before vowels/sonorants",
          phonetic: "좋아",
          meaning: "jo-a (ㅎ becomes very soft)",
        },
        {
          word: "ㅂ + ㄴ/ㅁ → ㅁ (nasalization)",
          phonetic: "합니다",
          meaning: "ham-ni-da",
        },
        {
          word: "ㄱ + ㄴ/ㅁ → ㅇ (nasalization)",
          phonetic: "한국말",
          meaning: "han-gung-mal",
        },
        {
          word: "ㄷ + ㄴ/ㅁ → ㄴ (nasalization)",
          phonetic: "듣는",
          meaning: "deun-neun",
        },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Read the written form first, then read the 'sounds like' form. Try to keep it natural and connected.",
    },
    {
      type: "soundword_table",
      headers: ["Written", "Sounds like (approx.)", "Focus"],
      rows: [
        { word: "신라", phonetic: "sill-a", meaning: "ㄴ+ㄹ → ㄹㄹ" },
        { word: "설날", phonetic: "seol-lal", meaning: "ㄹ+ㄴ → ㄹㄹ" },
        { word: "밥을", phonetic: "ba-beul", meaning: "Linking before ㅇ" },
        { word: "합니다", phonetic: "ham-ni-da", meaning: "ㅂ → ㅁ before ㄴ" },
        { word: "한국말", phonetic: "han-gung-mal", meaning: "ㄱ → ㅇ before ㅁ" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize these patterns while listening. Perfect pronunciation comes later—first build the habit of reading connected speech.",
    },
  ],
};