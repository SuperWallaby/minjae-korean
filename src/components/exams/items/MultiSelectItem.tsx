"use client";

import { getText } from "@/lib/examUtils";
import type { MultiSelectItem as MultiSelectItemType } from "@/types/exam";
import { cn } from "@/lib/utils";

type Props = {
  item: MultiSelectItemType;
  value: string[];
  onChange: (optionIds: string[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function MultiSelectItem({
  item,
  value,
  onChange,
  disabled,
  showCorrect,
}: Props) {
  const instruction = getText(item.stem.instruction);
  const options = item.interaction.options;
  const correctIds =
    item.scoring.key.kind === "multi_select" ? item.scoring.key.correctOptionIds : [];

  const toggle = (optionId: string) => {
    if (disabled) return;
    const next = value.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...value, optionId];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      <ul className="space-y-2" role="group" aria-label="Select all that apply">
        {options.map((opt) => {
          const isSelected = value.includes(opt.id);
          const isCorrect = showCorrect && correctIds.includes(opt.id);
          const isWrong = showCorrect && isSelected && !correctIds.includes(opt.id);
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => toggle(opt.id)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  "border-border bg-card hover:bg-muted/50",
                  isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30",
                  isCorrect && "border-green-600 bg-green-500/10",
                  isWrong && "border-red-500 bg-red-500/10",
                  disabled && "cursor-not-allowed opacity-80"
                )}
              >
                <span
                  className={cn(
                    "h-5 w-5 shrink-0 rounded border",
                    isSelected ? "bg-primary border-primary" : "border-border"
                  )}
                />
                {getText(opt.text)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
