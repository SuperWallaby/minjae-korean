import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Why Verbs Change" },
    {
      type: "paragraph",
      text: "In Korean, verbs don’t “conjugate” like in many languages by changing the middle of the word. Instead, Korean builds meaning by attaching endings to a verb stem: stem + ending (먹- + 어요 → 먹어요). Politeness, tense, mood, and sentence type (statement/question) live in the endings.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core idea: verb stem + ending" },
    {
      type: "callout",
      emoji: "🧩",
      text: "Think of Korean verbs like LEGO: the stem carries the core meaning, and endings add meaning such as politeness, tense, and intention.",
    },
    {
      type: "soundword_table",
      headers: ["Meaning", "Stem", "Ending"],
      rows: [
        { word: "eat", phonetic: "먹-", meaning: "어요 → 먹어요" },
        { word: "go", phonetic: "가-", meaning: "요 → 가요" },
        { word: "do", phonetic: "하-", meaning: "어요 → 해요" },
        { word: "see", phonetic: "보-", meaning: "아요 → 봐요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "What endings can add" },
    {
      type: "soundword_table",
      headers: ["Category", "What it changes", "Simple example"],
      rows: [
        { word: "Politeness", phonetic: "how polite you sound", meaning: "먹어요 (polite) vs 먹어 (casual)" },
        { word: "Tense", phonetic: "past/present/future", meaning: "먹었어요 (past) / 먹어요 (present)" },
        { word: "Mood / intention", phonetic: "request, suggestion, plan", meaning: "먹을게요 (I’ll eat) / 먹어요? (question)" },
        { word: "Sentence type", phonetic: "statement vs question", meaning: "가요. vs 가요?" },
      ],
    },
    {
      type: "callout",
      emoji: "✅",
      text: "Same stem, different endings = different meaning. This is why Korean verbs seem to “change a lot.”",
    },

    { type: "divider" },

    { type: "heading_2", text: "Politeness (the first thing you’ll notice)" },
    {
      type: "paragraph",
      text: "You’ll see different speech levels in Korean. For beginners, the most practical starting point is the polite style ending -요 (해요체).",
    },
    {
      type: "soundword_table",
      headers: ["Situation", "Common style", "Example"],
      rows: [
        { word: "Most daily conversations", phonetic: "polite (-요)", meaning: "먹어요, 가요, 해요" },
        { word: "Close friends / casual", phonetic: "casual", meaning: "먹어, 가, 해" },
        { word: "Very formal", phonetic: "formal", meaning: "먹습니다, 갑니다 (later)" },
      ],
    },
    {
      type: "callout",
      emoji: "🧠",
      text: "This course will mostly use the polite -요 style first. It’s safe, common, and easy to apply.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Tense (quick preview)" },
    {
      type: "callout",
      emoji: "⏳",
      text: "You don’t need all tense rules yet—just recognize that tense also appears in endings.",
    },
    {
      type: "soundword_table",
      headers: ["Meaning", "Present", "Past"],
      rows: [
        { word: "eat", phonetic: "먹어요", meaning: "먹었어요 / 먹을게요" },
        { word: "go", phonetic: "가요", meaning: "갔어요 / 갈게요" },
        { word: "do", phonetic: "해요", meaning: "했어요 / 할게요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Questions: same ending + ? " },
    {
      type: "paragraph",
      text: "In Korean, a polite statement can become a question just by changing intonation and adding a question mark in writing.",
    },
    {
      type: "soundword_table",
      headers: ["Statement", "Question", "Meaning"],
      rows: [
        { word: "가요.", phonetic: "가요?", meaning: "I go. / Do you go?" },
        { word: "먹어요.", phonetic: "먹어요?", meaning: "I eat. / Do you eat?" },
        { word: "해요.", phonetic: "해요?", meaning: "I do it. / Do you do it?" },
      ],
    },
    {
      type: "callout",
      emoji: "🎧",
      text: "Listen for rising intonation in questions. The verb form may look identical.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini practice: spot the stem" },
    {
      type: "paragraph",
      text: "Try to identify the stem in each word. Don’t worry about perfect rules yet—just train your eyes to separate stem vs ending.",
    },
    {
      type: "soundword_table",
      headers: ["Word", "Stem", "Ending"],
      rows: [
        { word: "먹어요", phonetic: "먹-", meaning: "어요" },
        { word: "가요", phonetic: "가-", meaning: "요" },
        { word: "해요", phonetic: "하-", meaning: "어요 (changes to 해요)" },
        { word: "봤어요", phonetic: "보-", meaning: "았어요 (changes to 봤어요)" },
        { word: "갔어요", phonetic: "가-", meaning: "았어요 (changes to 갔어요)" },
      ],
    },

    { type: "divider" },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: understand the pattern ‘stem + ending’ and recognize that endings carry politeness, tense, mood, and questions.",
    },
  ],
};