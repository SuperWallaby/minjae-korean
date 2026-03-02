import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Dropping the Subject" },
    {
      type: "paragraph",
      text: "In Korean, subjects (and even objects) are often omitted when they’re obvious from context. If you don’t need to say it, Korean usually leaves it out. This makes speech feel natural and efficient.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core idea: context first" },
    {
      type: "callout",
      emoji: "💡",
      text: "If the listener can easily guess who/what you mean, you can drop it. Korean relies heavily on shared context.",
    },
    {
      type: "soundword_table",
      headers: ["With subject", "Natural (dropped)", "Meaning"],
      rows: [
        { word: "저는 먹어요.", phonetic: "먹어요.", meaning: "I eat. (subject is obvious)" },
        { word: "저는 커피 마셔요.", phonetic: "커피 마셔요.", meaning: "I drink coffee." },
        { word: "저는 지금 가요.", phonetic: "지금 가요.", meaning: "I’m leaving now." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "When it’s especially common" },
    {
      type: "soundword_table",
      headers: ["Situation", "What gets dropped", "Example (natural)"],
      rows: [
        { word: "Answering a question", phonetic: "subject (often)", meaning: "Q: 뭐 해요? → A: 공부해요." },
        { word: "Talking about yourself", phonetic: "저/나는", meaning: "배고파요. / 피곤해요." },
        { word: "Talking about ‘you’", phonetic: "너/당신", meaning: "괜찮아요? / 어디 가요?" },
        { word: "Same topic continues", phonetic: "repeated nouns", meaning: "커피 마셔요. 맛있어요." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "But sometimes you must say it" },
    {
      type: "callout",
      emoji: "⚠️",
      text: "If the subject could be unclear or confusing, you should include it (often with a particle like 은/는 or 이/가).",
    },
    {
      type: "soundword_table",
      headers: ["Situation", "Why you keep it", "Example"],
      rows: [
        { word: "Two possible subjects", phonetic: "avoid confusion", meaning: "민재는 가요. 디야나는 안 가요." },
        { word: "Contrast / emphasis", phonetic: "highlight difference", meaning: "저는 괜찮아요. 친구는 안 괜찮아요." },
        { word: "Introducing a new topic", phonetic: "set the topic", meaning: "이 영화는 재밌어요." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Tiny practice: answer naturally" },
    {
      type: "paragraph",
      text: "Try answering without repeating the subject unless needed.",
    },
    {
      type: "soundword_table",
      headers: ["Question", "Natural answer", "What’s dropped"],
      rows: [
        { word: "뭐 해요?", phonetic: "일해요.", meaning: "저는" },
        { word: "커피 마셔요?", phonetic: "네, 마셔요.", meaning: "저는 / 커피를" },
        { word: "지금 어디 가요?", phonetic: "집에 가요.", meaning: "저는" },
        { word: "오늘 바빠요?", phonetic: "네, 바빠요.", meaning: "저는" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: get comfortable omitting subjects when context is clear, and keeping them only when you need clarity or contrast.",
    },
  ],
};