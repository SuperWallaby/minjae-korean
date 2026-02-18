import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "에게 / 한테 / 께 — To (person)" },

    { type: "heading_3", text: "All mean “to” a person. 께 is polite." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "To someone: 친구에게 말해요. / 친구한테 말해요." },
    { type: "bulleted_list_item", text: "Polite to someone: 선생님께 말해요." },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "한테 (very common talk)" },
    { type: "bulleted_list_item", text: "친구한테 줘요." },
    { type: "bulleted_list_item", text: "엄마한테 전화해요." },

    { type: "heading_3", text: "에게 (more written / neutral)" },
    { type: "bulleted_list_item", text: "친구에게 편지 써요." },
    { type: "bulleted_list_item", text: "학생에게 말해요." },

    { type: "heading_3", text: "께 (polite)" },
    { type: "bulleted_list_item", text: "선생님께 드려요." },
    { type: "bulleted_list_item", text: "할머니께 전화해요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "In short talk, you can sometimes skip it if the person is clear.",
    },
    { type: "bulleted_list_item", text: "전화해요. (나한테 전화해요)" },
    { type: "bulleted_list_item", text: "선생님 드려요. (선생님께 드려요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "친구한테 줘요." },
    { type: "numbered_list_item", text: "친구에게 줘요." },
    { type: "numbered_list_item", text: "선생님께 드려요." },
    { type: "numbered_list_item", text: "엄마한테 말해요." },
    { type: "numbered_list_item", text: "학생에게 말해요." },
    { type: "numbered_list_item", text: "할머니께 전화해요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "한테 = talk. 에게 = neutral. 께 = polite." },
  ],
};