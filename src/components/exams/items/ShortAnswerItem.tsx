"use client";

import { getText } from "@/lib/examUtils";
import type { ShortAnswerItem as ShortAnswerItemType } from "@/types/exam";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

type Props = {
  item: ShortAnswerItemType;
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function ShortAnswerItem({
  item,
  value,
  onChange,
  disabled,
  showCorrect,
}: Props) {
  const instruction = getText(item.stem.instruction);
  const placeholder = getText(item.interaction.placeholder);
  const accepted = item.scoring.key.kind === "short_answer" ? item.scoring.key.accepted : [];
  const firstAccepted = accepted[0] ?? "";

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Type your answer..."}
        disabled={disabled}
        maxLength={item.interaction.maxLength}
        className={cn(
          showCorrect && value !== firstAccepted && "border-amber-500 bg-amber-500/5"
        )}
        autoComplete="off"
      />
      {showCorrect && (
        <p className="text-xs text-muted-foreground">
          Correct answer(s): {accepted.join(", ")}
        </p>
      )}
    </div>
  );
}
