import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Don’t — -지 마세요, -(으)면 안 돼요" },

    { type: "heading_3", text: "-지 마세요 = please don’t. -(으)면 안 돼요 = you must not." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "-지 마세요: please don’t do it" },
    { type: "bulleted_list_item", text: "-(으)면 안 돼요: don’t do it (rule)" },

    { type: "heading_2", text: "Form" },

    { type: "heading_3", text: "-지 마세요" },
    { type: "bulleted_list_item", text: "+ 지 마세요" },
    { type: "bulleted_list_item", text: "가다 → 가지 마세요" },
    { type: "bulleted_list_item", text: "먹다 → 먹지 마세요" },

    { type: "heading_3", text: "-(으)면 안 돼요" },
    { type: "bulleted_list_item", text: "+ (으)면 안 돼요" },
    { type: "bulleted_list_item", text: "가다 → 가면 안 돼요" },
    { type: "bulleted_list_item", text: "먹다 → 먹으면 안 돼요" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "-지 마세요: polite warning" },
    { type: "bulleted_list_item", text: "여기 앉지 마세요." },
    { type: "bulleted_list_item", text: "사진 찍지 마세요." },

    { type: "heading_3", text: "-(으)면 안 돼요: rule" },
    { type: "bulleted_list_item", text: "여기 들어가면 안 돼요." },
    { type: "bulleted_list_item", text: "여기서 담배 피우면 안 돼요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "가지 마세요." },
    { type: "numbered_list_item", text: "먹지 마세요." },
    { type: "numbered_list_item", text: "여기 앉지 마세요." },
    { type: "numbered_list_item", text: "사진 찍지 마세요." },
    { type: "numbered_list_item", text: "가면 안 돼요." },
    { type: "numbered_list_item", text: "먹으면 안 돼요." },
    { type: "numbered_list_item", text: "여기 들어가면 안 돼요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "-지 마세요 = please don’t. -(으)면 안 돼요 = must not." },
  ],
};