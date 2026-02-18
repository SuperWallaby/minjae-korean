import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Present — -는 (now)" },
    { type: "heading_3", text: "-는 means “doing now” (present)." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "가요 → 가는" },
    { type: "bulleted_list_item", text: "먹어요 → 먹는" },

    { type: "heading_2", text: "When to use" },
    { type: "heading_3", text: "Talking about something happening now" },
    { type: "bulleted_list_item", text: "가는 사람 (a person who is going)" },
    { type: "bulleted_list_item", text: "먹는 사람 (a person who is eating)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "가는 사람" },
    { type: "numbered_list_item", text: "먹는 사람" },
    { type: "numbered_list_item", text: "지금 가요." },

    { type: "divider" },
    { type: "callout", emoji: "💡", text: "-는 = doing now." },
  ],
};
