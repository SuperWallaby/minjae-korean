import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "(으)니까 — Because" },

    { type: "heading_3", text: "(으)니까 means “because”. It is a clear reason." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "받침 O → 으니까 (먹으니까, 있 으니까)" },
    { type: "bulleted_list_item", text: "받침 X → 니까 (가니까, 오니까)" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Reason → result" },
    { type: "bulleted_list_item", text: "비 오니까 안 가요." },
    { type: "bulleted_list_item", text: "늦었으니까 빨리 가요." },

    { type: "heading_3", text: "Suggestion / command" },
    { type: "bulleted_list_item", text: "늦었으니까 가요." },
    { type: "bulleted_list_item", text: "피곤하니까 쉬세요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "비 오니까 안 가요." },
    { type: "numbered_list_item", text: "늦었으니까 빨리 가요." },
    { type: "numbered_list_item", text: "피곤하니까 쉬어요." },
    { type: "numbered_list_item", text: "시간 없으니까 못 가요." },
    { type: "numbered_list_item", text: "좋으니까 사요." },
    { type: "numbered_list_item", text: "배고프니까 밥 먹어요." },
    { type: "numbered_list_item", text: "늦었으니까 가요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "(으)니까 = because." },
  ],
};