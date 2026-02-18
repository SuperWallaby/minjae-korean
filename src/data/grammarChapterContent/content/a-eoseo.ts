import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "아/어서 — So / And then" },

    { type: "heading_3", text: "아/어서 links two actions. Often: “so” or “and then”." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "Reason → result: 배고파서 밥 먹어요. (hungry, so eat)" },
    { type: "bulleted_list_item", text: "Action → next action: 집에 가서 쉬어요. (go home, then rest)" },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "가요 → 가서" },
    { type: "bulleted_list_item", text: "먹어요 → 먹어서" },
    { type: "bulleted_list_item", text: "좋아요 → 좋아서" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Reason → result" },
    { type: "bulleted_list_item", text: "피곤해서 자요." },
    { type: "bulleted_list_item", text: "비 와서 안 가요." },

    { type: "heading_3", text: "Action → next action" },
    { type: "bulleted_list_item", text: "집에 가서 쉬어요." },
    { type: "bulleted_list_item", text: "가게에 가서 빵 사요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "배고파서 밥 먹어요." },
    { type: "numbered_list_item", text: "피곤해서 자요." },
    { type: "numbered_list_item", text: "비 와서 안 가요." },
    { type: "numbered_list_item", text: "집에 가서 쉬어요." },
    { type: "numbered_list_item", text: "가게에 가서 빵 사요." },
    { type: "numbered_list_item", text: "좋아서 웃어요." },
    { type: "numbered_list_item", text: "바빠서 못 가요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "아/어서 = so / and then." },
  ],
};