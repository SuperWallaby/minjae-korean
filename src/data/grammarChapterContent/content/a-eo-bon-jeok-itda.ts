import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "아/어 본 적 있다 — Experience" },

    { type: "heading_3", text: "아/어 본 적 있어요 means “have done before”." },

    { type: "heading_2", text: "Form" },
    { type: "bulleted_list_item", text: "+ 아/어 본 적 있어요" },
    { type: "bulleted_list_item", text: "가다 → 가 본 적 있어요" },
    { type: "bulleted_list_item", text: "먹다 → 먹어 본 적 있어요" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "Have you ever…?" },
    { type: "bulleted_list_item", text: "한국에 가 본 적 있어요?" },
    { type: "bulleted_list_item", text: "김치 먹어 본 적 있어요?" },

    { type: "heading_3", text: "Yes / No" },
    { type: "bulleted_list_item", text: "네, 가 본 적 있어요." },
    { type: "bulleted_list_item", text: "아니요, 가 본 적 없어요." },

    { type: "heading_3", text: "Time word (optional)" },
    { type: "bulleted_list_item", text: "전에 가 본 적 있어요." },
    { type: "bulleted_list_item", text: "한 번 먹어 본 적 있어요." },

    { type: "heading_3", text: "Skip it" },
    {
      type: "paragraph",
      text: "You can skip 본 적, but then “ever / experience” is gone.",
    },
    { type: "bulleted_list_item", text: "김치 먹었어요. (김치 먹어 본 적 있어요)" },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "한국에 가 본 적 있어요." },
    { type: "numbered_list_item", text: "한국에 가 본 적 없어요." },
    { type: "numbered_list_item", text: "김치 먹어 본 적 있어요?" },
    { type: "numbered_list_item", text: "이 영화 본 적 있어요." },
    { type: "numbered_list_item", text: "커피 마셔 본 적 있어요." },
    { type: "numbered_list_item", text: "한 번 해 본 적 있어요." },
    { type: "numbered_list_item", text: "그거 들어 본 적 있어요?" },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "본 적 있어요 = have done before (experience)." },
  ],
};