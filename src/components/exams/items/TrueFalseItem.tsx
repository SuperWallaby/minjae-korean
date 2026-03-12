"use client";

import { getText, renderTextWithLineBreaks } from "@/lib/examUtils";
import type { TrueFalseItem as TrueFalseItemType } from "@/types/exam";
import { cn } from "@/lib/utils";

type Props = {
  item: TrueFalseItemType;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function TrueFalseItem({
  item,
  value,
  onChange,
  disabled,
  showCorrect,
}: Props) {
  const instruction = getText(item.stem.instruction);
  const statement = getText(item.interaction.statement);
  const correct = item.scoring.key.kind === "true_false" ? item.scoring.key.correct : false;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">
        {renderTextWithLineBreaks(instruction)}
      </p>
      <p className="rounded-md border border-border bg-muted/30 px-3 py-3 text-sm text-foreground">
        {renderTextWithLineBreaks(statement)}
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => !disabled && onChange(true)}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            "border-border bg-card hover:bg-muted/50",
            value === true && "border-primary bg-primary/10 ring-1 ring-primary/30",
            showCorrect && correct === true && "border-green-600 bg-green-500/10",
            showCorrect && value === true && !correct && "border-red-500 bg-red-500/10",
            disabled && "cursor-not-allowed opacity-80"
          )}
        >
          True
        </button>
        <button
          type="button"
          onClick={() => !disabled && onChange(false)}
          disabled={disabled}
          className={cn(
            "flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            "border-border bg-card hover:bg-muted/50",
            value === false && "border-primary bg-primary/10 ring-1 ring-primary/30",
            showCorrect && correct === false && "border-green-600 bg-green-500/10",
            showCorrect && value === false && correct && "border-red-500 bg-red-500/10",
            disabled && "cursor-not-allowed opacity-80"
          )}
        >
          False
        </button>
      </div>
    </div>
  );
}
