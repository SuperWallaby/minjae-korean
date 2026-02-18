import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Future — -(으)ㄹ (later)" },
    { type: "heading_3", text: "-(으)ㄹ means “later / will” (future)." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 을 (먹을)" },
    { type: "bulleted_list_item", text: "받침 X → ㄹ (갈)" },

    { type: "heading_2", text: "When to use" },
    { type: "heading_3", text: "Talking about later" },
    { type: "bulleted_list_item", text: "갈 거예요." },
    { type: "bulleted_list_item", text: "먹을 거예요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "내일 갈 거예요." },
    { type: "numbered_list_item", text: "내일 먹을 거예요." },
    { type: "numbered_list_item", text: "갈 사람" },

    { type: "divider" },
    { type: "callout", emoji: "💡", text: "-(으)ㄹ = future / will." },
  ],
};
