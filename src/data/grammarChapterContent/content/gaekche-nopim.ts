import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Honorific object — 드리다, 여쭙다" },

    { type: "heading_3", text: "Use these when you do something to a respected person." },

    { type: "heading_2", text: "When to use" },
    { type: "bulleted_list_item", text: "To teacher / boss / older person" },
    { type: "bulleted_list_item", text: "Me → respected person" },

    { type: "heading_2", text: "드리다 (give to)" },
    { type: "heading_3", text: "드리다 = polite 주다 (give)" },
    { type: "bulleted_list_item", text: "선생님께 드려요." },
    { type: "bulleted_list_item", text: "엄마께 선물 드려요." },

    { type: "heading_2", text: "여쭙다 (ask)" },
    { type: "heading_3", text: "여쭙다 = polite 묻다 (ask)" },
    { type: "bulleted_list_item", text: "선생님께 여쭤요." },
    { type: "bulleted_list_item", text: "사장님께 여쭤요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "선생님께 드려요." },
    { type: "numbered_list_item", text: "할머니께 선물 드려요." },
    { type: "numbered_list_item", text: "사장님께 말씀 드려요." },
    { type: "numbered_list_item", text: "선생님께 여쭤요." },
    { type: "numbered_list_item", text: "사장님께 여쭤요." },
    { type: "numbered_list_item", text: "잠깐 여쭤도 돼요?" },
    { type: "numbered_list_item", text: "이거 드릴까요?" },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "To respected person: 주다 → 드리다, 묻다 → 여쭙다." },
  ],
};