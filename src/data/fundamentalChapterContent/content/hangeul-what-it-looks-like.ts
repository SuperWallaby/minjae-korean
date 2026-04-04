import type { GrammarChapterContent } from "@/data/grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "What Hangeul Looks Like" },
    {
      type: "paragraph",
      text:
        "Hangeul does not write letters in a long horizontal line the way English does. Instead, Korean letters are grouped together into square-shaped syllable blocks. Each block is read as one unit.",
    },
    {
      type: "paragraph",
      text:
        "A block usually contains an initial consonant and a vowel, and it can also include a final consonant at the bottom. So when you read Korean, you are not reading one isolated letter at a time. You are reading one block, then the next block.",
    },

    { type: "divider" },

    { type: "heading_2", text: "Syllable blocks (글자)" },
    {
      type: "callout",
      emoji: "🧱",
      text:
        "Think of one Korean character as one small block. It is usually made of 초성 (initial consonant) + 중성 (vowel), and sometimes 받침 (final consonant).",
    },
    {
      type: "paragraph",
      text:
        "For example, 가 is made of ㄱ + ㅏ. 강 is made of ㄱ + ㅏ + ㅇ. In both cases, the letters are combined into one visible block, not written separately.",
    },
    {
      type: "bulleted_list_item",
      text: "가 = ㄱ + ㅏ",
    },
    {
      type: "bulleted_list_item",
      text: "나 = ㄴ + ㅏ",
    },
    {
      type: "bulleted_list_item",
      text: "한 = ㅎ + ㅏ + ㄴ",
    },
    {
      type: "bulleted_list_item",
      text: "국 = ㄱ + ㅜ + ㄱ",
    },

    { type: "heading_2", text: "How blocks are read" },
    {
      type: "paragraph",
      text:
        "When you see Korean text, try to divide it into blocks first. Each block is one beat. For example, 한국어 is not read as separate letters. It is read as three blocks: 한 / 국 / 어.",
    },
    {
      type: "bulleted_list_item",
      text: "가나다 → 가 / 나 / 다",
    },
    {
      type: "bulleted_list_item",
      text: "한국어 → 한 / 국 / 어",
    },
    {
      type: "bulleted_list_item",
      text: "커피 → 커 / 피",
    },

    { type: "heading_2", text: "Why this matters" },
    {
      type: "paragraph",
      text:
        "Many beginners get confused because they try to read Korean letter by letter. That feels slow and unnatural. It is much easier to read when you train your eyes to recognize complete syllable blocks.",
    },
    {
      type: "bulleted_list_item",
      text:
        "You can read more smoothly when you look for whole blocks instead of single letters.",
    },
    {
      type: "bulleted_list_item",
      text:
        "You will understand word structure more easily because Korean words are built from these blocks.",
    },
    {
      type: "bulleted_list_item",
      text:
        "Pronunciation becomes easier because each block usually matches one spoken syllable.",
    },

    { type: "callout", emoji: "👀", text: "When reading Korean, do not scan letter by letter. Look for the block first, then read the sound." },
  ],
};