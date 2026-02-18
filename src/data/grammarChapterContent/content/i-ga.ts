import type { GrammarChapterContent } from "../../grammarTypes";

export const content: GrammarChapterContent = {
    blocks: [
      { type: "heading_1", text: "이/가 — Subject" },
  
      { type: "heading_3", text: "이/가 shows the subject. Subject = who/what does it." },
  
      { type: "heading_2", text: "Form" },
      { type: "bulleted_list_item", text: "받침 O → 이 (책이, 밥이)" },
      { type: "bulleted_list_item", text: "받침 X → 가 (내가, 엄마가)" },
  
      { type: "heading_2", text: "When to use" },
  
      { type: "heading_3", text: "Who? What?" },
      { type: "bulleted_list_item", text: "누가 와요?" },
      { type: "bulleted_list_item", text: "고양이가 와요." },
  
      { type: "heading_3", text: "New / important info" },
      { type: "bulleted_list_item", text: "이게 뭐예요?" },
      { type: "bulleted_list_item", text: "이게 물이에요." },
  
      { type: "heading_3", text: "Not A, but B" },
      { type: "bulleted_list_item", text: "제가 해요. (not you)" },
      { type: "bulleted_list_item", text: "민재가 해요. (not 민수)" },
  
      { type: "heading_3", text: "Skip it" },
      {
        type: "paragraph",
        text: "In simple talk, you can skip 이/가 when the subject is clear.",
      },
      { type: "bulleted_list_item", text: "왔어요. (누가 왔어요)" },
      { type: "bulleted_list_item", text: "비 와요. (비가 와요)" },
      { type: "bulleted_list_item", text: "뭐예요? (이게 뭐예요?)" },
  
      { type: "heading_2", text: "Examples" },
      { type: "numbered_list_item", text: "고양이가 있어요." },
      { type: "numbered_list_item", text: "비가 와요." },
      { type: "numbered_list_item", text: "제가 해요." },
      { type: "numbered_list_item", text: "민재가 와요." },
      { type: "numbered_list_item", text: "책이 좋아요." },
      { type: "numbered_list_item", text: "물이 있어요." },
      { type: "numbered_list_item", text: "엄마가 좋아요." },
  
      { type: "divider" },
  
      { type: "callout", emoji: "💡", text: "이/가 = subject. Clear subject? You can skip it." },
    ],
  };
