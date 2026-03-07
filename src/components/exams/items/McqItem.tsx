"use client";

import { getText } from "@/lib/examUtils";
import type { MCQItem as MCQItemType } from "@/types/exam";
import { cn } from "@/lib/utils";

type Props = {
  item: MCQItemType;
  value: string | undefined;
  onChange: (optionId: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function McqItem({ item, value, onChange, disabled, showCorrect }: Props) {
  const correctId = item.scoring.key.kind === "mcq" ? item.scoring.key.correctOptionId : null;
  const instruction = getText(item.stem.instruction);
  const options = item.interaction.options;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      {item.stem.content && (
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
          {/* Simple text content if needed later */}
        </div>
      )}
      <ul className="space-y-2" role="listbox" aria-label="Choose one option">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const isCorrect = showCorrect && correctId === opt.id;
          const isWrong = showCorrect && isSelected && correctId !== opt.id;
          return (
            <li key={opt.id} role="option" aria-selected={isSelected}>
              <button
                type="button"
                onClick={() => !disabled && onChange(opt.id)}
                disabled={disabled}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors",
                  "border-border bg-card hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring",
                  isSelected && "border-primary bg-primary/10 ring-1 ring-primary/30",
                  isCorrect && "border-green-600 bg-green-500/10",
                  isWrong && "border-red-500 bg-red-500/10",
                  disabled && "cursor-not-allowed opacity-80"
                )}
              >
                {getText(opt.text)}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
