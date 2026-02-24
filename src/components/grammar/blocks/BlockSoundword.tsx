"use client";

import { Describe } from "@/components/article/Describe";
import { SoundPlayButton } from "@/components/article/SoundPlayButton";

type Props = {
  word: string;
  sound: string;
  phonetic?: string;
  meaning?: string;
};

export function BlockSoundword({ word, sound, phonetic, meaning }: Props) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="font-semibold text-primary">
            <Describe>{word}</Describe>
          </span>
          {phonetic ? (
            <span className="text-sm text-orange-600">/{phonetic}/</span>
          ) : null}
        </span>
        <SoundPlayButton
          src={sound}
          aria-label={`${word} pronunciation`}
        />
      </div>
      {meaning ? (
        <p className="text-sm text-muted-foreground">{meaning}</p>
      ) : null}
    </div>
  );
}
