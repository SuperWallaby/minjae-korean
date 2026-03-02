import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "People & Relationships" },
    {
      type: "paragraph",
      text: "Learn the most common Korean words for people and relationships. These nouns appear constantly in simple introductions and everyday conversations.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Core pronouns and people words" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "나", phonetic: "I / me", meaning: "Casual (informal)" },
        { word: "너", phonetic: "you", meaning: "Casual (informal) — use carefully" },
        { word: "우리", phonetic: "we / our", meaning: "Often used for ‘my’ (우리 엄마)" },
        { word: "사람", phonetic: "person", meaning: "General word" },
        { word: "친구", phonetic: "friend", meaning: "Common and flexible" },
        { word: "선생님", phonetic: "teacher", meaning: "Also used to address instructors, tutors" },
        { word: "가족", phonetic: "family", meaning: "Family as a group" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Family basics" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "엄마", phonetic: "mom", meaning: "Casual" },
        { word: "아빠", phonetic: "dad", meaning: "Casual" },
        { word: "부모님", phonetic: "parents", meaning: "Polite / respectful" },
        { word: "형", phonetic: "older brother (male speaker)", meaning: "Used by men" },
        { word: "오빠", phonetic: "older brother (female speaker)", meaning: "Used by women" },
        { word: "누나", phonetic: "older sister (male speaker)", meaning: "Used by men" },
        { word: "언니", phonetic: "older sister (female speaker)", meaning: "Used by women" },
      ],
    },
    {
      type: "callout",
      emoji: "💡",
      text: "Family words depend on the speaker. For example, 형/누나 are used by men, and 오빠/언니 are used by women.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Relationship words (useful starters)" },
    {
      type: "soundword_table",
      headers: ["Korean", "Meaning", "Note"],
      rows: [
        { word: "이름", phonetic: "name", meaning: "Used in introductions" },
        { word: "남자", phonetic: "man", meaning: "Gender word (neutral noun)" },
        { word: "여자", phonetic: "woman", meaning: "Gender word (neutral noun)" },
        { word: "아이", phonetic: "child / kid", meaning: "Casual" },
        { word: "학생", phonetic: "student", meaning: "Common noun" },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Very useful sentence patterns" },
    {
      type: "callout",
      emoji: "✅",
      text: "You can make many sentences with just nouns + 이에요/예요 (to be).",
    },
    {
      type: "soundword_table",
      headers: ["Pattern", "Example", "Meaning"],
      rows: [
        { word: "A예요/이에요", phonetic: "저는 학생이에요.", meaning: "I’m a student." },
        { word: "A는/은 B예요/이에요", phonetic: "이 사람은 선생님이에요.", meaning: "This person is a teacher." },
        { word: "누구예요?", phonetic: "저 사람 누구예요?", meaning: "Who is that person?" },
        { word: "A 있어요", phonetic: "친구 있어요.", meaning: "I have friends / I have a friend." },
      ],
    },

    { type: "divider" },

    { type: "heading_2", text: "Quick practice" },
    {
      type: "paragraph",
      text: "Read these aloud. Try to respond quickly using the pattern words.",
    },
    {
      type: "soundword_table",
      headers: ["Prompt", "Answer (example)", "Focus"],
      rows: [
        { word: "Say: I’m a student.", phonetic: "저는 학생이에요.", meaning: "A이에요" },
        { word: "Say: This is my friend.", phonetic: "이 사람은 제 친구예요.", meaning: "noun + 예요" },
        { word: "Ask: Who is that?", phonetic: "저 사람 누구예요?", meaning: "누구예요?" },
        { word: "Say: I have family.", phonetic: "가족 있어요.", meaning: "있어요" },
      ],
    },

    {
      type: "callout",
      emoji: "🎯",
      text: "Chapter goal: recognize core people words and build simple identity/relationship sentences with 예요/이에요.",
    },
  ],
};