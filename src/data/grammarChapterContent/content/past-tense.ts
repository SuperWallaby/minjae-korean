import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Past — -았/었 (before)" },
    { type: "heading_3", text: "-았/었 means “before” (past)." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "가요 → 갔어요" },
    { type: "bulleted_list_item", text: "먹어요 → 먹었어요" },

    { type: "heading_2", text: "When to use" },
    { type: "heading_3", text: "Talking about before" },
    { type: "bulleted_list_item", text: "어제 갔어요." },
    { type: "bulleted_list_item", text: "아까 먹었어요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "어제 갔어요." },
    { type: "numbered_list_item", text: "아까 먹었어요." },
    { type: "numbered_list_item", text: "비 왔어요." },

    { type: "divider" },
    { type: "callout", emoji: "💡", text: "-았/었 = past." },
  ],
};
