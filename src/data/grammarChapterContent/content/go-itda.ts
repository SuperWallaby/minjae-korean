import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "고 있다 — In progress" },

    { type: "heading_3", text: "고 있다 means “doing now”. (in progress)" },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "+ 고 있어요" },
    { type: "bulleted_list_item", text: "먹다 → 먹고 있어요" },
    { type: "bulleted_list_item", text: "가다 → 가고 있어요" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Doing right now" },
    { type: "bulleted_list_item", text: "지금 밥 먹고 있어요." },
    { type: "bulleted_list_item", text: "지금 공부하고 있어요." },

    { type: "heading_3", text: "Working these days" },
    { type: "bulleted_list_item", text: "요즘 한국어 배우고 있어요." },
    { type: "bulleted_list_item", text: "요즘 운동하고 있어요." },

    { type: "heading_3", text: "Skip it" },
    { type: "paragraph", text: "You can skip it, but then “in progress” is weaker." },
    { type: "bulleted_list_item", text: "지금 밥 먹어요. (지금 밥 먹고 있어요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "지금 커피 마시고 있어요." },
    { type: "numbered_list_item", text: "지금 밥 먹고 있어요." },
    { type: "numbered_list_item", text: "지금 가고 있어요." },
    { type: "numbered_list_item", text: "요즘 한국어 공부하고 있어요." },
    { type: "numbered_list_item", text: "요즘 일하고 있어요." },
    { type: "numbered_list_item", text: "지금 뭐 하고 있어요?" },
    { type: "numbered_list_item", text: "저는 지금 쉬고 있어요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "고 있어요 = doing now / in progress." },
  ],
};