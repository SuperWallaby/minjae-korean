import type { GrammarChapterContent } from "@/data/grammarTypes";

/**
 * Block type names are in English (callout, soundword, paragraph, etc.).
 * soundword: word + sound URL, same pattern as news/recap vocabulary.
 */
export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Consonants & Vowels" },
    {
      type: "paragraph",
      text: "한글의 기본 자음(ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ)과 모음(ㅏㅓㅗㅜㅡㅣ 등)을 익혀 봅시다.",
    },
    { type: "heading_2", text: "Basic consonants (자음)" },
    {
      type: "soundword",
      word: "ㄱ",
      sound: "/audio/giyeok.mp3",
      phonetic: "g/k",
      meaning: "기역",
    },
    {
      type: "soundword",
      word: "ㄴ",
      sound: "/audio/nieun.mp3",
      phonetic: "n",
      meaning: "니은",
    },
    {
      type: "soundword",
      word: "ㄷ",
      sound: "/audio/digeut.mp3",
      phonetic: "d/t",
      meaning: "디귿",
    },
    { type: "heading_2", text: "Basic vowels (모음)" },
    {
      type: "soundword",
      word: "ㅏ",
      sound: "/audio/a.mp3",
      phonetic: "a",
      meaning: "아",
    },
    {
      type: "soundword",
      word: "ㅓ",
      sound: "/audio/eo.mp3",
      phonetic: "eo",
      meaning: "어",
    },
    {
      type: "soundword",
      word: "ㅗ",
      sound: "/audio/o.mp3",
      phonetic: "o",
      meaning: "오",
    },
    { type: "divider" },
    {
      type: "callout",
      emoji: "💡",
      text: "자음과 모음을 조합하면 글자 블록이 됩니다. 예: ㄱ + ㅏ = 가",
    },
  ],
};
