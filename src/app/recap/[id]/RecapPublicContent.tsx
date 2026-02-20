"use client";

import { SoundPlayButton } from "@/components/article/SoundPlayButton";
import { VocabularySection } from "@/components/article/VocabularySection";

type RecapListItem = {
  text: string;
  audioUrl?: string;
  phonetic?: string;
  imageUrl?: string;
  meaning?: string;
  example?: string;
  exampleTranslation?: string;
  examplePhonetic?: string;
  exampleAudioUrl?: string;
  content?: string;
};

type RecapPublic = {
  id: string;
  bookingId?: string;
  level?: 1 | 2 | 3 | 4 | 5;
  expression: RecapListItem[];
  grammarPoint: RecapListItem[];
  vocabulary: RecapListItem[];
  mistake: RecapListItem[];
  pronounce: RecapListItem[];
  createdAt: string;
  updatedAt: string;
};

export function RecapPublicContent({ recap }: { recap: RecapPublic }) {
  return (
    <div>
      {recap.level != null ? (
        <p className="text-sm text-muted-foreground mb-6">Level {recap.level}</p>
      ) : null}

      {/* Expression */}
      {recap.expression?.length ? (
        <section className="mt-12 border-t border-border pt-10 first:mt-0 first:border-t-0 first:pt-0">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Expression
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            {recap.expression.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 last:border-b-0"
              >
                <span className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold text-primary">{item.text}</span>
                  {item.phonetic ? (
                    <span className="text-sm text-orange-600 dark:text-orange-400">
                      /{item.phonetic}/
                    </span>
                  ) : null}
                </span>
                {item.audioUrl ? (
                  <SoundPlayButton src={item.audioUrl} aria-label={`${item.text} 재생`} />
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Grammar Point */}
      {recap.grammarPoint?.length ? (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Grammar Point
          </h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
            {recap.grammarPoint.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-1 border-b border-border p-4 last:border-b-0"
              >
                <span className="font-semibold text-primary">{item.text}</span>
                {item.content ? (
                  <p className="text-foreground/90">{item.content}</p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* Vocabulary — VocabularySection 공통 컴포넌트 사용 */}
      <VocabularySection
        className="mt-12 border-t border-border pt-10"
        items={recap.vocabulary.map((v) => ({
          word: v.text,
          phonetic: v.phonetic,
          sound: v.audioUrl,
          meaning: v.meaning,
          example: v.example,
          exampleTranslation: v.exampleTranslation,
          image: v.imageUrl,
        }))}
      />

      {/* Mistake & Pronounce */}
      {(recap.mistake?.length || recap.pronounce?.length) ? (
        <section className="mt-12 border-t border-border pt-10">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            Mistake
          </h2>
          {recap.mistake?.length ? (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
              {recap.mistake.map((item, idx) => (
                <div
                  key={idx}
                  className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 last:border-b-0"
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-primary">{item.text}</span>
                    {item.phonetic ? (
                      <span className="text-sm text-orange-600 dark:text-orange-400">
                        /{item.phonetic}/
                      </span>
                    ) : null}
                  </span>
                  {item.audioUrl ? (
                    <SoundPlayButton src={item.audioUrl} aria-label={`${item.text} 재생`} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {recap.pronounce?.length ? (
            <>
              <h3 className="mt-8 font-serif text-xl font-semibold tracking-tight sm:text-2xl">
                Pronounce
              </h3>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-card">
                {recap.pronounce.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col border-b border-border p-4 last:border-b-0"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-semibold text-primary">{item.text}</span>
                        {item.phonetic ? (
                          <span className="text-sm text-orange-600 dark:text-orange-400">
                            /{item.phonetic}/
                          </span>
                        ) : null}
                      </span>
                      {item.audioUrl ? (
                        <SoundPlayButton src={item.audioUrl} aria-label={`${item.text} 재생`} />
                      ) : null}
                    </div>
                    {item.example ? (
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-foreground/90">
                        <span>{item.example}</span>
                        {item.examplePhonetic ? (
                          <span className="text-orange-600 dark:text-orange-400">
                            /{item.examplePhonetic}/
                          </span>
                        ) : null}
                        {item.exampleAudioUrl ? (
                          <SoundPlayButton size="sm" src={item.exampleAudioUrl} aria-label="예문 재생" />
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
