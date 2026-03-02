import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Batchim Basics" },
    {
      type: "paragraph",
      text: "Batchim (받침) is the final consonant at the bottom of a syllable block. It changes how the syllable ends, and it can also affect the next syllable’s sound.",
    },

    { type: "divider" },

    { type: "heading_2", text: "What is batchim?" },
    {
      type: "callout",
      emoji: "💡",
      text: "A syllable can be (1) consonant + vowel, or (2) consonant + vowel + batchim. Example: 가 (no batchim) vs. 각 (has ㄱ batchim).",
    },
    {
      type: "callout",
      emoji: "🔇",
      text: "Batchim is usually unreleased: the sound stops quickly (k/t/p) without adding an extra vowel at the end.",
    },

    { type: "divider" },

    { type: "heading_2", text: "The 8 basic batchim (your first set)" },
    {
      type: "soundword_table",
      headers: ["Batchim", "Typical sound", "Notes"],
      rows: [
        { word: "ㄱ", phonetic: "k", meaning: "Ends like k (short stop)", sound: "/audio/giyeok.mp3" },
        { word: "ㄴ", phonetic: "n", meaning: "Ends like n", sound: "/audio/nieun.mp3" },
        { word: "ㄷ", phonetic: "t", meaning: "Often ends like t (short stop)", sound: "/audio/digeut.mp3" },
        { word: "ㄹ", phonetic: "l", meaning: "Ends like an 'l'", sound: "/audio/rieul.mp3" },
        { word: "ㅁ", phonetic: "m", meaning: "Ends like m", sound: "/audio/mieum.mp3" },
        { word: "ㅂ", phonetic: "p", meaning: "Ends like p (short stop)", sound: "/audio/bieup.mp3" },
        { word: "ㅅ", phonetic: "t", meaning: "As batchim, ㅅ is often read like t", sound: "/audio/siot.mp3" },
        { word: "ㅇ", phonetic: "ng", meaning: "Ends like 'ng' in sing", sound: "/audio/ieung.mp3" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Important idea: many letters share the same final sound" },
    {
      type: "callout",
      emoji: "✅",
      text: "In final position, Korean pronunciation is simplified. Different consonants can sound the same as batchim.",
    },
    {
      type: "soundword_table",
      headers: ["Final sound group", "Sounds like", "Common letters (preview)"],
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
      emoji: "🧠",
      text: "Don’t memorize every rule now. Just learn the idea: final sounds collapse into a small set (k, n, t, l, m, p, ng).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Reading examples (single syllable)" },
    {
      type: "soundword_table",
      headers: ["Syllable", "Breakdown", "Ends like"],
      rows: [
        { word: "각", phonetic: "ㄱ + ㅏ + ㄱ", meaning: "k" },
        { word: "간", phonetic: "ㄱ + ㅏ + ㄴ", meaning: "n" },
        { word: "갇", phonetic: "ㄱ + ㅏ + ㄷ", meaning: "t" },
        { word: "갈", phonetic: "ㄱ + ㅏ + ㄹ", meaning: "l" },
        { word: "감", phonetic: "ㄱ + ㅏ + ㅁ", meaning: "m" },
        { word: "갑", phonetic: "ㄱ + ㅏ + ㅂ", meaning: "p" },
        { word: "갓", phonetic: "ㄱ + ㅏ + ㅅ", meaning: "t" },
        { word: "강", phonetic: "ㄱ + ㅏ + ㅇ", meaning: "ng" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Two-syllable examples (feel the stop)" },
    {
      type: "paragraph",
      text: "Try reading slowly: stop the sound at the end of the first syllable, then start the next syllable clearly.",
    },
    {
      type: "soundword_table",
      headers: ["Word", "Batchim", "Pronunciation (approx.)"],
      rows: [
        { word: "먹다", phonetic: "ㄱ → k", meaning: "meok-da" },
        { word: "앉다", phonetic: "ㄴ → n", meaning: "an-da (preview: complex batchim later)" },
        { word: "닫다", phonetic: "ㄷ → t", meaning: "dat-da" },
        { word: "물고기", phonetic: "ㄹ → l", meaning: "mul-go-gi" },
        { word: "감사", phonetic: "ㅁ → m", meaning: "gam-sa" },
        { word: "밥을", phonetic: "ㅂ → p", meaning: "bap-eul" },
        { word: "옷이", phonetic: "ㅅ → t", meaning: "ot-i" },
        { word: "방에", phonetic: "ㅇ → ng", meaning: "bang-e" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Linking rule (very common)" },
    {
      type: "callout",
      emoji: "➡️",
      text: "When the next syllable starts with ㅇ, the batchim sound often links to the next syllable. Example: 먹어 can sound like meo-geo.",
    },
    {
      type: "soundword_table",
      headers: ["Word", "Written", "Often sounds like"],
      rows: [
        { word: "먹어", phonetic: "먹 + 어", meaning: "meo-geo" },
        { word: "밥을", phonetic: "밥 + 을", meaning: "ba-beul" },
        { word: "옷이", phonetic: "옷 + 이", meaning: "o-si / o-ti (later rules refine this)" },
        { word: "강이", phonetic: "강 + 이", meaning: "ga-ngi" },
      ],
    },
    {
      type: "callout",
      emoji: "🧩",
      text: "For now: if you see ㅇ at the start of the next syllable, try connecting smoothly rather than making a hard pause.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Read these aloud. Focus only on the ending sound (k/n/t/l/m/p/ng).",
    },
    {
      type: "soundword_table",
      headers: ["Set A", "Set B", "Set C"],
      rows: [
        { word: "각 / 간 / 갈", phonetic: "k / n / l", meaning: "갓 / 감 / 강" },
        { word: "갑 / 갇 / 간", phonetic: "p / t / n", meaning: "강 / 갈 / 감" },
        { word: "갓 / 각 / 갑", phonetic: "t / k / p", meaning: "간 / 강 / 갈" },
      ],
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "✅",
      text: "Chapter goal: (1) spot batchim, (2) read the common ending sounds, (3) notice linking before ㅇ. Detailed batchim rules can come in the next chapter.",
    },
  ],
};