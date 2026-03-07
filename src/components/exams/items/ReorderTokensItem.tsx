"use client";

import { getText } from "@/lib/examUtils";
import type { ReorderTokensItem as ReorderTokensItemType } from "@/types/exam";

type Props = {
  item: ReorderTokensItemType;
  value: string[];
  onChange: (sequence: string[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function ReorderTokensItem({ item, value, onChange: _onChange, disabled: _disabled }: Props) {
  const instruction = getText(item.stem.instruction);
  const tokens = item.interaction.tokens;
  const displayOrder = value.length === tokens.length ? value : tokens;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      <p className="text-xs text-muted-foreground">
        Drag to reorder (UI coming soon). Current: {displayOrder.join(" ")}
      </p>
    </div>
  );
}
