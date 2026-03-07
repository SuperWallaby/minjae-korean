"use client";

import { getText } from "@/lib/examUtils";
import type { MatchPairsItem as MatchPairsItemType } from "@/types/exam";

type Props = {
  item: MatchPairsItemType;
  value: { leftId: string; rightId: string }[];
  onChange: (pairs: { leftId: string; rightId: string }[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function MatchPairsItem({ item, value: _value, onChange: _onChange, disabled: _disabled }: Props) {
  const instruction = getText(item.stem.instruction);
  const left = item.interaction.left;
  const right = item.interaction.right;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      <p className="text-xs text-muted-foreground">
        Match left with right (drag/drop UI coming soon). {left.length} × {right.length}
      </p>
    </div>
  );
}
