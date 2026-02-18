import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "는데 / 지만 — But" },

    { type: "heading_3", text: "Both mean “but”. 지만 = clear but. 는데 = softer, often a setup." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "지만: A but B (strong / clear)" },
    { type: "bulleted_list_item", text: "는데: A, but… (soft / context / next sentence)" },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "X + 지만" },
    { type: "bulleted_list_item", text: "X + 는데 (or 은데/인데)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "지만: clear contrast" },
    { type: "bulleted_list_item", text: "가고 싶지만 시간이 없어요." },
    { type: "bulleted_list_item", text: "맛있지만 비싸요." },

    { type: "heading_3", text: "는데: soft contrast / background" },
    { type: "bulleted_list_item", text: "가고 싶은데 시간이 없어요." },
    { type: "bulleted_list_item", text: "맛있는데 비싸요." },

    { type: "heading_3", text: "는데: asking / suggesting" },
    { type: "bulleted_list_item", text: "저기요, 이거 있는데요." },
    { type: "bulleted_list_item", text: "시간 있는데 커피 마실래요?" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "가고 싶지만 시간이 없어요." },
    { type: "numbered_list_item", text: "가고 싶은데 시간이 없어요." },
    { type: "numbered_list_item", text: "맛있지만 비싸요." },
    { type: "numbered_list_item", text: "맛있는데 비싸요." },
    { type: "numbered_list_item", text: "시간 있는데 커피 마실래요?" },
    { type: "numbered_list_item", text: "저기요, 이거 있는데요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "지만 = clear but. 는데 = soft but / setup." },
  ],
};