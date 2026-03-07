"use client";

import { getText } from "@/lib/examUtils";
import type { AudioMCQItem as AudioMCQItemType } from "@/types/exam";
import { cn } from "@/lib/utils";

type Props = {
  item: AudioMCQItemType;
  value: string | undefined;
  onChange: (optionId: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function AudioMcqItem({
  item,
  value,
  onChange,
  disabled,
  showCorrect,
}: Props) {
  const correctId =
    item.scoring.key.kind === "mcq" ? item.scoring.key.correctOptionId : null;
  const instruction = getText(item.stem.instruction);
  const options = item.interaction.options;
  const audio = item.interaction.audio;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      {audio?.url && (
        <audio controls src={audio.url} className="w-full max-w-md" />
      )}
      <ul className="space-y-2">
        {options.map((opt) => {
          const isSelected = value === opt.id;
          const isCorrect = showCorrect && correctId === opt.id;
          const isWrong = showCorrect && isSelected && correctId !== opt.id;
          return (
            <li key={opt.id}>
              <button
                type="button"
                onClick={() => !disabled && onChange(opt.id)}
                disabled={disabled}
                className={cn(
                  "w-full rounded-lg border px-4 py-3 text-left text-sm",
                  isSelected && "border-primary bg-primary/10",
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
