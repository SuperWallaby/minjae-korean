import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Introduction" },

    {
      type: "heading_3",
      text:
        "It’s okay to be simple. Speak first. Grammar will follow.",
    },

    { type: "heading_2", text: "Focus" },
    { type: "bulleted_list_item", text: "Focus on being friendly with Korean." },
    { type: "bulleted_list_item", text: "Focus on speaking first." },
    { type: "bulleted_list_item", text: "Focus on saying simple sentences." },

    { type: "heading_2", text: "A message for you" },
    {
      type: "paragraph",
      text:
        "I hope you focus on be friendly with Korean.\n" +
        "If you understand only with your head, it can feel hard.\n" +
        "But if you hear it many times, it becomes natural.\n" +
        "So, keep going. It will feel natural with time."
    },
    { type: "heading_2", text: "Grammar is not absolute" },
    {
      type: "paragraph",
      text:
        "Grammar is not an absolute thing. " +
        "Many sentences are still okay, even if they are not perfect.",
    },


    { type: "divider" },

    {
      type: "callout",
      emoji: "💡",
      text: "Be friendly. Keep going. It will feel natural with time.",
    },
  ],
};