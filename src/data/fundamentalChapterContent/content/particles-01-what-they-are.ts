import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Particles (조사): What They Do" },
    {
      type: "paragraph",
      text: "Particles (조사) are small markers attached to nouns. They show the noun’s role in the sentence (topic, subject, object, place, etc.). Because particles carry role information, Korean word order can be flexible while the meaning stays clear.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core idea: noun + particle" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Particles attach directly to a noun: noun + 조사. They don’t stand alone, and they don’t change the noun’s meaning—only its role.",
    },
    {
      type: "soundword_table",
      headers: ["Noun", "Particle", "Result (chunk)"],
      rows: [
        { word: "저", phonetic: "는", meaning: "저는" },
        { word: "학생", phonetic: "이/가", meaning: "학생이 / 학생가 (choose by ending sound)" },
        { word: "커피", phonetic: "를", meaning: "커피를" },
        { word: "학교", phonetic: "에", meaning: "학교에" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "What particles help with" },
    {
      type: "soundword_table",
      headers: ["Particle", "Role (simple)", "Example meaning"],
      rows: [
        { word: "은/는", phonetic: "topic", meaning: "“As for …” / “About …”" },
        { word: "이/가", phonetic: "subject", meaning: "who/what does it (often new info)" },
        { word: "을/를", phonetic: "object", meaning: "what you do the action to" },
        { word: "에", phonetic: "to/at", meaning: "destination / location" },
        { word: "에서", phonetic: "at/from", meaning: "place of action / starting point" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Why word order can move" },
    {
      type: "callout",
      emoji: "🔎",
      text: "English relies heavily on word order. Korean relies more on particles. Even if word order changes, particles often keep roles clear.",
    },
    {
      type: "soundword_table",
      headers: ["Sentence", "Meaning (same idea)", "Note"],
      rows: [
        { word: "저는 커피를 마셔요.", phonetic: "I drink coffee.", meaning: "Topic + object + verb" },
        { word: "커피를 저는 마셔요.", phonetic: "I drink coffee.", meaning: "Order changes, roles stay clear" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "How to choose the form (quick rule)" },
    {
      type: "callout",
      emoji: "✅",
      text: "Many particles come in pairs. The choice depends on whether the noun ends with a consonant (받침) or a vowel.",
    },
    {
      type: "soundword_table",
      headers: ["Ends with…", "Use", "Example"],
      rows: [
        { word: "Consonant (받침)", phonetic: "은 / 이 / 을", meaning: "학생은, 책이, 물을" },
        { word: "Vowel", phonetic: "는 / 가 / 를", meaning: "저는, 커피가, 사과를" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Tiny practice (recognize the role)" },
    {
      type: "paragraph",
      text: "Don’t memorize every rule here. Just practice spotting which noun is topic/subject/object/place.",
    },
    {
      type: "soundword_table",
      headers: ["Chunk", "Particle", "Role (simple)"],
      rows: [
        { word: "저는", phonetic: "는", meaning: "topic" },
        { word: "친구가", phonetic: "가", meaning: "subject" },
        { word: "밥을", phonetic: "을", meaning: "object" },
        { word: "집에", phonetic: "에", meaning: "to/at" },
        { word: "카페에서", phonetic: "에서", meaning: "at (action place)" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: understand what particles are (role markers) and why they make Korean word order flexible. Detailed usage comes in the grammar chapters.",
    },
  ],
};