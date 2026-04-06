"use client";

import { getText, renderTextWithLineBreaks } from "@/lib/examUtils";
import type { ClozeItem as ClozeItemType } from "@/types/exam";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-wrap items-center gap-2">
        {blanks.map((b) => {
          const selectClass = cn(
            "h-11 rounded-md border border-border bg-background px-3 text-sm text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50",
            b.choices?.length ? "min-w-[7rem]" : "",
          );
          if (b.choices?.length) {
            return (
              <select
                key={b.id}
                aria-label={b.placeholder ?? b.id}
                value={value[b.id] ?? ""}
                onChange={(e) =>
                  onChange({ ...value, [b.id]: e.target.value })
                }
                disabled={disabled}
                className={selectClass}
              >
                <option value="">
                  {b.placeholder ? `(${b.placeholder})` : "—"}
                </option>
                {b.choices.map((opt) => {
                  const label = getText(opt.text);
                  return (
                    <option key={opt.id} value={label}>
                      {label}
                    </option>
                  );
                })}
              </select>
            );
          }
          return (
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
          );
        })}
      </div>
    </div>
  );
}
