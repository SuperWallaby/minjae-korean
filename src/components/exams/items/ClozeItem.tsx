"use client";

import { getText, renderTextWithLineBreaks } from "@/lib/examUtils";
import type { ClozeItem as ClozeItemType } from "@/types/exam";
import { Input } from "@/components/ui/Input";

type Props = {
  item: ClozeItemType;
  value: Record<string, string>;
  onChange: (answersByBlankId: Record<string, string>) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function ClozeItem({ item, value, onChange, disabled }: Props) {
  const instruction = getText(item.stem.instruction);
  const template = getText(item.interaction.template);
  const blanks = item.interaction.blanks;

  // Minimal: show instruction and placeholders for blanks (full template parsing can be added later)
  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">
        {renderTextWithLineBreaks(instruction)}
      </p>
      <p className="text-sm text-muted-foreground">
        {renderTextWithLineBreaks(template)}
      </p>
      <div className="flex flex-wrap gap-2">
        {blanks.map((b) => (
          <Input
            key={b.id}
            value={value[b.id] ?? ""}
            onChange={(e) =>
              onChange({ ...value, [b.id]: e.target.value })
            }
            placeholder={b.placeholder ?? "..."}
            disabled={disabled}
            className="w-24"
          />
        ))}
      </div>
    </div>
  );
}
