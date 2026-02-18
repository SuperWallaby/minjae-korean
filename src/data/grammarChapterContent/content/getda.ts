import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "겠어요 — Will / Probably" },

    { type: "heading_3", text: "-겠어요 can mean “will” or “probably”." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "Will (my decision): 제가 하겠어요." },
    { type: "bulleted_list_item", text: "Probably (guess): 비 오겠어요." },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Will (decision now)" },
    { type: "bulleted_list_item", text: "제가 하겠어요. (I will do it.)" },
    { type: "bulleted_list_item", text: "그만하겠어요. (I will stop.)" },

    { type: "heading_3", text: "Probably (guess)" },
    { type: "bulleted_list_item", text: "비 오겠어요." },
    { type: "bulleted_list_item", text: "힘들겠어요. (probably hard)" },

    { type: "heading_3", text: "Common 느낌 (very common)" },
    { type: "bulleted_list_item", text: "맛있겠어요! (looks tasty)" },
    { type: "bulleted_list_item", text: "좋겠어요! (sounds nice)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "제가 하겠어요." },
    { type: "numbered_list_item", text: "내일은 쉬겠어요." },
    { type: "numbered_list_item", text: "비 오겠어요." },
    { type: "numbered_list_item", text: "늦겠어요." },
    { type: "numbered_list_item", text: "맛있겠어요!" },
    { type: "numbered_list_item", text: "좋겠어요!" },
    { type: "numbered_list_item", text: "힘들겠어요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "-겠어요 = will (decision) / probably (guess)." },
  ],
};