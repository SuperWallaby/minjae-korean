import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Spacing Basics" },
    {
      type: "paragraph",
      text: "Korean spacing can feel unfamiliar at first. Don’t try to master every rule—start by recognizing the most common chunks you’ll see in beginner sentences, especially verb endings like ~어요, ~입니다, and polite requests like ~주세요.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core idea: chunking" },
    {
      type: "callout",
      emoji: "🧩",
      text: "A helpful reading habit: split a sentence into chunks (words + particles) and verb/adjective endings. Spacing often separates these chunks.",
    },
    {
      type: "soundword_table",
      headers: ["Chunk type", "Looks like", "Example chunk"],
      rows: [
        { word: "Noun + particle", phonetic: "학생 + 이/가", meaning: "학생이, 커피를" },
        { word: "Verb/adj + ending", phonetic: "먹- + 어요", meaning: "먹어요, 가요" },
        { word: "Polite request", phonetic: "… + 주세요", meaning: "물 주세요, 커피 주세요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "~어요 / ~아요 / ~해요 (very common)" },
    {
      type: "paragraph",
      text: "These endings are usually attached to the verb/adjective with no space. You’ll see them as a single word chunk.",
    },
    {
      type: "soundword_table",
      headers: ["Meaning", "Written", "Spacing note"],
      rows: [
        { word: "eat", phonetic: "먹어요", meaning: "no space inside" },
        { word: "go", phonetic: "가요", meaning: "no space inside" },
        { word: "do", phonetic: "해요", meaning: "no space inside" },
        { word: "good", phonetic: "좋아요", meaning: "no space inside" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Beginner shortcut: if you see ~요 at the end, it usually sticks to the verb/adjective (no space).",
    },

    { type: "divider" },

    { type: "heading_2", text: "~입니다 / ~예요 / ~이에요" },
    {
      type: "paragraph",
      text: "These are ‘to be’ endings (polite). They attach to the noun phrase. You’ll often see them as one chunk with no extra spacing inside.",
    },
    {
      type: "soundword_table",
      headers: ["Meaning", "Written", "Chunking"],
      rows: [
        { word: "I am a student.", phonetic: "저는 학생입니다.", meaning: "저는 / 학생입니다" },
        { word: "This is coffee.", phonetic: "이거는 커피예요.", meaning: "이거는 / 커피예요" },
        { word: "It’s a book.", phonetic: "책이에요.", meaning: "책이에요 (one chunk)" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "~주세요 (polite request)" },
    {
      type: "paragraph",
      text: "주세요 is usually written as a separate word after what you want. This is one of the most consistent spacing patterns you’ll see.",
    },
    {
      type: "soundword_table",
      headers: ["Meaning", "Written", "Chunking"],
      rows: [
        { word: "Water, please.", phonetic: "물 주세요.", meaning: "물 / 주세요" },
        { word: "One coffee, please.", phonetic: "커피 한 잔 주세요.", meaning: "커피 / 한 잔 / 주세요" },
        { word: "Help me, please.", phonetic: "도와주세요.", meaning: "도와 + 주세요 (often 붙여쓰기 too)" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "You’ll see both 도와주세요 (no space) and 도와 주세요 (with space). For beginners, focus on recognizing 주세요 as a request marker.",
    },

    { type: "divider" },

    { type: "heading_2", text: "What you should notice (not memorize)" },
    {
      type: "soundword_table",
      headers: ["You often see", "Typical spacing", "Example"],
      rows: [
        { word: "Noun + particle", phonetic: "no space", meaning: "친구가, 책을, 학교에" },
        { word: "Verb + ending (~요)", phonetic: "no space", meaning: "먹어요, 가요, 있어요" },
        { word: "Request 주세요", phonetic: "usually spaced", meaning: "물 주세요, 여기 주세요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice: chunk the sentence" },
    {
      type: "paragraph",
      text: "Read each sentence and split it into chunks using spaces. This trains your eyes to recognize common patterns fast.",
    },
    {
      type: "soundword_table",
      headers: ["Sentence", "Chunked", "Focus"],
      rows: [
        {
          word: "저는 커피를 마셔요.",
          phonetic: "저는 / 커피를 / 마셔요",
          meaning: "particle chunks + verb ending",
        },
        {
          word: "이거는 물이에요.",
          phonetic: "이거는 / 물이에요",
          meaning: "noun + 이에요",
        },
        {
          word: "커피 한 잔 주세요.",
          phonetic: "커피 / 한 잔 / 주세요",
          meaning: "request pattern",
        },
        {
          word: "오늘 바빠요.",
          phonetic: "오늘 / 바빠요",
          meaning: "adjective + ~요",
        },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: read beginner sentences faster by recognizing common spacing chunks like ~어요, ~입니다, and (N) 주세요.",
    },
  ],
};