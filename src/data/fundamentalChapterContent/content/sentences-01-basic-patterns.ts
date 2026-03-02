import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Basic Sentence Patterns" },
    {
      type: "paragraph",
      text: "Korean sentences can be built with a few simple templates. In this chapter, you’ll practice two core patterns: (1) noun + object + verb, and (2) noun + ‘to be’ (이에요/예요). Don’t overthink grammar—use the templates to produce sentences quickly.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Pattern 1: 저는 N(을/를) V-아요/어요" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Template: 저는 + (noun + 을/를) + verb(-아요/어요). You can drop 저는 when it’s obvious (later).",
    },
    {
      type: "soundword_table",
      headers: ["Template", "Example", "Meaning"],
      rows: [
        { word: "저는 N을 V해요.", phonetic: "저는 밥을 먹어요.", meaning: "I eat rice / a meal." },
        { word: "저는 N를 V해요.", phonetic: "저는 커피를 마셔요.", meaning: "I drink coffee." },
        { word: "저는 N를 V해요.", phonetic: "저는 영화를 봐요.", meaning: "I watch a movie." },
        { word: "저는 N을 V해요.", phonetic: "저는 책을 읽어요.", meaning: "I read a book." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "How to choose 을/를 (quick rule)" },
    {
      type: "soundword_table",
      headers: ["Noun ends with…", "Use", "Example"],
      rows: [
        { word: "Consonant (받침)", phonetic: "을", meaning: "밥을, 책을, 물을" },
        { word: "Vowel", phonetic: "를", meaning: "커피를, 사과를, 영화(를)" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Beginner shortcut: attach 을/를 directly to the noun (no space). Then put the verb at the end.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Pattern 2: N이/가 N이에요/예요" },
    {
      type: "callout",
      emoji: "🧱",
      text: "Use this to identify or label something: “X is Y.” It’s extremely common in introductions and simple descriptions.",
    },
    {
      type: "soundword_table",
      headers: ["Template", "Example", "Meaning"],
      rows: [
        { word: "A는 B예요.", phonetic: "이거는 커피예요.", meaning: "This is coffee." },
        { word: "A는 B예요.", phonetic: "저는 학생이에요.", meaning: "I’m a student." },
        { word: "A가 B예요.", phonetic: "저 사람이 선생님이에요.", meaning: "That person is a teacher." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "How to choose 이에요/예요 (quick rule)" },
    {
      type: "soundword_table",
      headers: ["Noun ends with…", "Use", "Example"],
      rows: [
        { word: "Consonant (받침)", phonetic: "이에요", meaning: "학생이에요, 책이에요" },
        { word: "Vowel", phonetic: "예요", meaning: "커피예요, 친구예요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini mix-and-match" },
    {
      type: "paragraph",
      text: "Use the templates. Replace the nouns and verbs to create many sentences.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Template"],
      rows: [
        { word: "Say: I drink water.", phonetic: "저는 물을 마셔요.", meaning: "저는 N(을/를) V-아요/어요" },
        { word: "Say: I meet a friend.", phonetic: "저는 친구를 만나요.", meaning: "저는 N(을/를) V-아요/어요" },
        { word: "Say: This is a menu.", phonetic: "이거는 메뉴예요.", meaning: "A는 B예요" },
        { word: "Say: That person is a student.", phonetic: "저 사람은 학생이에요.", meaning: "A는 B예요" },
        { word: "Ask: Is this coffee?", phonetic: "이거 커피예요?", meaning: "same form + question" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice: make it natural" },
    {
      type: "paragraph",
      text: "Read the natural version. Notice how Korean often keeps sentences short.",
    },
    {
      type: "soundword_table",
      headers: ["Long", "Natural", "Note"],
      rows: [
        { word: "저는 지금 커피를 마셔요.", phonetic: "커피 마셔요.", meaning: "subject can drop" },
        { word: "저는 지금 집에 가요.", phonetic: "집에 가요.", meaning: "short and natural" },
        { word: "이것은 물입니다.", phonetic: "이거는 물이에요.", meaning: "common spoken style" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: build sentences fast using two templates: (1) 저는 N(을/를) V-아요/어요 and (2) A는/이/가 B예요/이에요.",
    },
  ],
};