import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Verbs Starter Pack" },
    {
      type: "paragraph",
      text: "Here are high-frequency Korean verbs you’ll see every day. Learn the meaning first, then get used to the polite -요 style (해요체). You don’t need perfect conjugation yet—just recognize these forms when reading and listening.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core everyday verbs" },
    {
      type: "soundword_table",
      headers: ["Verb (dictionary)", "Meaning", "Polite form (-요)"],
      rows: [
        { word: "하다", phonetic: "to do", meaning: "해요" },
        { word: "가다", phonetic: "to go", meaning: "가요" },
        { word: "오다", phonetic: "to come", meaning: "와요" },
        { word: "먹다", phonetic: "to eat", meaning: "먹어요" },
        { word: "마시다", phonetic: "to drink", meaning: "마셔요" },
        { word: "보다", phonetic: "to see / watch", meaning: "봐요" },
        { word: "듣다", phonetic: "to listen / hear", meaning: "들어요" },
        { word: "읽다", phonetic: "to read", meaning: "읽어요" },
        { word: "쓰다", phonetic: "to write / to use", meaning: "써요" },
        { word: "사다", phonetic: "to buy", meaning: "사요" },
        { word: "주다", phonetic: "to give", meaning: "줘요" },
        { word: "받다", phonetic: "to receive", meaning: "받아요" },
        { word: "만나다", phonetic: "to meet", meaning: "만나요" },
        { word: "좋아하다", phonetic: "to like", meaning: "좋아해요" },
        { word: "싫어하다", phonetic: "to dislike", meaning: "싫어해요" },
        { word: "알다", phonetic: "to know", meaning: "알아요" },
        { word: "모르다", phonetic: "to not know", meaning: "몰라요" },
        { word: "있다", phonetic: "to exist / to have", meaning: "있어요" },
        { word: "없다", phonetic: "to not exist / to not have", meaning: "없어요" },
        { word: "필요하다", phonetic: "to need", meaning: "필요해요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Super useful pairs" },
    {
      type: "soundword_table",
      headers: ["Pair", "Meaning", "Example idea"],
      rows: [
        { word: "가다 / 오다", phonetic: "go / come", meaning: "Where are you going? / I’m coming." },
        { word: "있다 / 없다", phonetic: "have / don’t have", meaning: "Do you have time? / I don’t have time." },
        { word: "알다 / 모르다", phonetic: "know / don’t know", meaning: "I know / I don’t know." },
        { word: "좋아하다 / 싫어하다", phonetic: "like / dislike", meaning: "I like coffee / I dislike coffee." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Mini reading practice" },
    {
      type: "paragraph",
      text: "Read these quickly. Focus on recognizing the verb chunk at the end.",
    },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Verb"],
      rows: [
        { word: "지금 가요.", phonetic: "I’m going now.", meaning: "가요" },
        { word: "커피 마셔요.", phonetic: "I drink coffee.", meaning: "마셔요" },
        { word: "영화 봐요.", phonetic: "I watch a movie.", meaning: "봐요" },
        { word: "책 읽어요.", phonetic: "I read a book.", meaning: "읽어요" },
        { word: "시간 있어요.", phonetic: "I have time.", meaning: "있어요" },
        { word: "잘 몰라요.", phonetic: "I don’t really know.", meaning: "몰라요" },
        { word: "필요해요.", phonetic: "I need it.", meaning: "필요해요" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick drill (say it out loud)" },
    {
      type: "paragraph",
      text: "Say the Korean sentence. Swap the verb to make new sentences.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Try swapping"],
      rows: [
        { word: "I’m going.", phonetic: "가요.", meaning: "와요 / 안 가요" },
        { word: "I’m eating.", phonetic: "먹어요.", meaning: "마셔요 / 안 먹어요" },
        { word: "I like it.", phonetic: "좋아해요.", meaning: "싫어해요" },
        { word: "I don’t know.", phonetic: "몰라요.", meaning: "알아요" },
        { word: "I need it.", phonetic: "필요해요.", meaning: "안 필요해요" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize these core verbs and their polite -요 forms so you can start building real sentences.",
    },
  ],
};