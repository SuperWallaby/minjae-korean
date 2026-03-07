"use client";

import type { AssessmentItem, ItemResponse } from "@/types/exam";
import { McqItem } from "./items/McqItem";
import { MultiSelectItem } from "./items/MultiSelectItem";
import { ShortAnswerItem } from "./items/ShortAnswerItem";
import { TrueFalseItem } from "./items/TrueFalseItem";
import { ClozeItem } from "./items/ClozeItem";
import { ReorderTokensItem } from "./items/ReorderTokensItem";
import { DictationItem } from "./items/DictationItem";
import { AudioMcqItem } from "./items/AudioMcqItem";
import { MatchPairsItem } from "./items/MatchPairsItem";

type Props = {
  item: AssessmentItem;
  response: ItemResponse | undefined;
  onChange: (response: ItemResponse) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function ExamItemRenderer({
  item,
  response,
  onChange,
  disabled,
  showCorrect,
}: Props) {
  switch (item.type) {
    case "mcq":
      return (
        <McqItem
          item={item}
          value={response?.type === "mcq" ? response.optionId : undefined}
          onChange={(optionId) => onChange({ type: "mcq", optionId })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "multi_select":
      return (
        <MultiSelectItem
          item={item}
          value={response?.type === "multi_select" ? response.optionIds : []}
          onChange={(optionIds) => onChange({ type: "multi_select", optionIds })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "short_answer":
      return (
        <ShortAnswerItem
          item={item}
          value={response?.type === "short_answer" ? response.text : ""}
          onChange={(text) => onChange({ type: "short_answer", text })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "true_false":
      return (
        <TrueFalseItem
          item={item}
          value={response?.type === "true_false" ? response.value : undefined}
          onChange={(value) => onChange({ type: "true_false", value })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "cloze":
      return (
        <ClozeItem
          item={item}
          value={response?.type === "cloze" ? response.answersByBlankId : {}}
          onChange={(answersByBlankId) =>
            onChange({ type: "cloze", answersByBlankId })
          }
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "reorder_tokens":
      return (
        <ReorderTokensItem
          item={item}
          value={
            response?.type === "reorder_tokens" ? response.sequence : []
          }
          onChange={(sequence) =>
            onChange({ type: "reorder_tokens", sequence })
          }
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "dictation":
      return (
        <DictationItem
          item={item}
          value={response?.type === "dictation" ? response.text : ""}
          onChange={(text) => onChange({ type: "dictation", text })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "audio_mcq":
      return (
        <AudioMcqItem
          item={item}
          value={
            response?.type === "audio_mcq" ? response.optionId : undefined
          }
          onChange={(optionId) => onChange({ type: "audio_mcq", optionId })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    case "match_pairs":
      return (
        <MatchPairsItem
          item={item}
          value={response?.type === "match_pairs" ? response.pairs : []}
          onChange={(pairs) => onChange({ type: "match_pairs", pairs })}
          disabled={disabled}
          showCorrect={showCorrect}
        />
      );
    default:
      return (
        <p className="text-sm text-muted-foreground">
          Unsupported question type.
        </p>
      );
  }
}
