"use client";

import Image from "next/image";

import { SoundPlayButton } from "./SoundPlayButton";

export type VocabularyItem = {
  word: string;
  phonetic?: string;
  sound?: string;
  meaning?: string;
  example?: string;
  exampleTranslation?: string;
  exampleSound?: string;
  image?: string;
};

type Props = {
  title?: string;
  items: VocabularyItem[];
  className?: string;
};

export function VocabularySection({ title = "Vocabulary", items, className = "" }: Props) {
  if (!items.length) return null;

  return (
    <section className={className}>
      <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
        {items.map((v, idx) => (
          <div
            key={`${idx}-${v.word}`}
            className="flex flex-col border-b border-border last:border-b-0"
          >
            {/* Row 1: 단어 /발음기호/ | 발음버튼 */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-4 pb-0 sm:pb-4">
              <span className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-semibold text-primary">{v.word}</span>
                {v.phonetic ? (
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    /{v.phonetic}/
                  </span>
                ) : null}
              </span>
              {v.sound ? (
                <SoundPlayButton src={v.sound} aria-label={`${v.word} 발음 재생`} />
              ) : null}
            </div>
            {/* Row 2: 설명+예문 | 이미지 */}
            <div className="flex flex-row gap-4 p-4 min-w-0">
              <div className="min-w-0 flex-1 flex flex-col gap-1">
                {v.meaning ? <p className="text-foreground">{v.meaning}</p> : null}
                {v.example ? (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-sm text-foreground/90">{v.example}</span>
                    {v.exampleSound ? (
                      <SoundPlayButton size="sm" src={v.exampleSound} aria-label="예문 재생" />
                    ) : null}
                  </div>
                ) : null}
                {v.exampleTranslation ? (
                  <p className="text-xs text-muted-foreground">→ {v.exampleTranslation}</p>
                ) : null}
              </div>
              <div className="shrink-0 w-24 sm:w-28">
                {v.image ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted/20">
                    <Image
                      src={v.image}
                      alt=""
                      fill
                      className="object-cover object-center"
                      unoptimized
                      sizes="112px"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/10 text-muted-foreground">
                    —
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
