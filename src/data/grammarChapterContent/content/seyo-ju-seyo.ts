import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
  blocks: [
    { type: "heading_1", text: "Please do — -(으)세요, -아/어 주세요" },

    { type: "heading_3", text: "-(으)세요 = please do. -아/어 주세요 = please do for me." },

    { type: "heading_2", text: "Meaning" },
    { type: "bulleted_list_item", text: "-(으)세요: polite command / request" },
    { type: "bulleted_list_item", text: "-아/어 주세요: polite request (for me)" },

    { type: "heading_2", text: "Form" },

    { type: "heading_3", text: "-(으)세요" },
    { type: "bulleted_list_item", text: "받침 O → 으세요 (먹으세요)" },
    { type: "bulleted_list_item", text: "받침 X → 세요 (가세요)" },

    { type: "heading_3", text: "-아/어 주세요" },
    { type: "bulleted_list_item", text: "가요 → 가 주세요" },
    { type: "bulleted_list_item", text: "먹어요 → 먹어 주세요" },
    { type: "bulleted_list_item", text: "해요 → 해 주세요" },

    { type: "heading_2", text: "When to use" },

    { type: "heading_3", text: "-(으)세요: simple request" },
    { type: "bulleted_list_item", text: "여기 앉으세요." },
    { type: "bulleted_list_item", text: "천천히 가세요." },

    { type: "heading_3", text: "-아/어 주세요: do it for me" },
    { type: "bulleted_list_item", text: "문 열어 주세요." },
    { type: "bulleted_list_item", text: "물 좀 주세요." },

    { type: "heading_3", text: "Never Skip it" },
    {
      type: "paragraph",
      text: "Don’t skip these in requests. They sound rude without them.",
    },
    { type: "bulleted_list_item", text: "물! (rude) → 물 좀 주세요." },

    { type: "heading_2", text: "Examples" },
    { type: "numbered_list_item", text: "기다리세요." },
    { type: "numbered_list_item", text: "조용히 하세요." },
    { type: "numbered_list_item", text: "문 닫으세요." },
    { type: "numbered_list_item", text: "문 열어 주세요." },
    { type: "numbered_list_item", text: "물 주세요." },
    { type: "numbered_list_item", text: "사진 찍어 주세요." },
    { type: "numbered_list_item", text: "천천히 말해 주세요." },

    { type: "divider" },

    { type: "callout", emoji: "💡", text: "-(으)세요 = please do. -아/어 주세요 = please do for me." },
  ],
};