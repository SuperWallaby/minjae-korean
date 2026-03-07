"use client";

import { getText } from "@/lib/examUtils";
import type { DictationItem as DictationItemType } from "@/types/exam";
import { Input } from "@/components/ui/Input";

type Props = {
  item: DictationItemType;
  value: string;
  onChange: (text: string) => void;
  disabled?: boolean;
  showCorrect?: boolean;
};

export function DictationItem({ item, value, onChange, disabled }: Props) {
  const instruction = getText(item.stem.instruction);
  const audio = item.interaction.audio;

  return (
    <div className="space-y-4">
      <p className="font-medium text-foreground">{instruction}</p>
      {audio?.url && (
        <audio controls src={audio.url} className="w-full max-w-md" />
      )}
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type what you hear..."
        disabled={disabled}
      />
    </div>
  );
}
