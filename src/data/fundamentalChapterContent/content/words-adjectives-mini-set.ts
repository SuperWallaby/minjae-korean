import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Mini Adjectives Set" },
    {
      type: "paragraph",
      text: "Learn a small set of high-frequency adjectives. These pairs help you describe size, quality, speed, and temperature in everyday situations.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core adjective pairs" },
    {
      type: "soundword_table",
      headers: ["Adjective", "Meaning", "Opposite"],
      rows: [
        { word: "큰", phonetic: "big / large", meaning: "작은" },
        { word: "작은", phonetic: "small", meaning: "큰" },
        { word: "좋은", phonetic: "good", meaning: "나쁜" },
        { word: "나쁜", phonetic: "bad", meaning: "좋은" },
        { word: "빠른", phonetic: "fast", meaning: "느린" },
        { word: "느린", phonetic: "slow", meaning: "빠른" },
        { word: "뜨거운", phonetic: "hot (temperature)", meaning: "차가운" },
        { word: "차가운", phonetic: "cold (temperature)", meaning: "뜨거운" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Two common ways to use adjectives" },
    {
      type: "callout",
      emoji: "✅",
      text: "You’ll see adjectives used (1) before a noun, or (2) at the end as a sentence.",
    },
    {
      type: "soundword_table",
      headers: ["Type", "Pattern", "Example"],
      rows: [
        { word: "Before a noun", phonetic: "adjective + noun", meaning: "큰 가방 (a big bag), 좋은 친구 (a good friend)" },
        { word: "As a sentence", phonetic: "…아/어요", meaning: "커요 (It’s big), 좋아요 (It’s good)" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "In real speech, describing things often uses …아/어요 (커요/작아요/좋아요/나빠요).",
    },

    { type: "divider" },

    { type: "heading_2", text: "Very common spoken forms" },
    {
      type: "soundword_table",
      headers: ["Dictionary form", "Spoken form", "Meaning"],
      rows: [
        { word: "크다", phonetic: "커요", meaning: "It’s big." },
        { word: "작다", phonetic: "작아요", meaning: "It’s small." },
        { word: "좋다", phonetic: "좋아요", meaning: "It’s good." },
        { word: "나쁘다", phonetic: "나빠요", meaning: "It’s bad." },
        { word: "빠르다", phonetic: "빨라요", meaning: "It’s fast." },
        { word: "느리다", phonetic: "느려요", meaning: "It’s slow." },
        { word: "뜨겁다", phonetic: "뜨거워요", meaning: "It’s hot." },
        { word: "차갑다", phonetic: "차가워요", meaning: "It’s cold." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini examples" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Focus"],
      rows: [
        { word: "이거 커요.", phonetic: "This is big.", meaning: "크다 → 커요" },
        { word: "이거 작아요.", phonetic: "This is small.", meaning: "작다 → 작아요" },
        { word: "좋아요.", phonetic: "It’s good.", meaning: "quick reaction" },
        { word: "별로예요.", phonetic: "Not really / It’s not good.", meaning: "useful casual response" },
        { word: "너무 빨라요.", phonetic: "It’s too fast.", meaning: "빠르다 → 빨라요" },
        { word: "천천히 말해 주세요. 너무 빨라요.", phonetic: "Please speak slowly. It’s too fast.", meaning: "real-life combo" },
        { word: "뜨거워요!", phonetic: "It’s hot!", meaning: "temperature" },
        { word: "차가워요.", phonetic: "It’s cold.", meaning: "temperature" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Choose the right adjective. Say the sentence out loud.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Opposite check"],
      rows: [
        { word: "This coffee is hot.", phonetic: "커피가 뜨거워요.", meaning: "뜨거워요 ↔ 차가워요" },
        { word: "This is small.", phonetic: "이거 작아요.", meaning: "작아요 ↔ 커요" },
        { word: "The price is good.", phonetic: "가격이 좋아요.", meaning: "좋아요 ↔ 나빠요" },
        { word: "It’s too slow.", phonetic: "너무 느려요.", meaning: "느려요 ↔ 빨라요" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize these adjective pairs and use the common spoken forms (커요/좋아요/뜨거워요…).",
    },
  ],
};