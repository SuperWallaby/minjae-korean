"use client";

import { usePronouncePlayback } from "@/components/pronounce-site/PronouncePlayback";
import { GlobalPinExampleAudio } from "@/components/global-site/GlobalPinWordAudio";
import type { GlobalPinExample } from "@/lib/globalSite/catalog";

type Props = {
  lang: string;
  langName: string;
  examples: GlobalPinExample[];
};

export function GlobalPinExampleList({ lang, langName, examples }: Props) {
  const { activeHighlightKey } = usePronouncePlayback();
  if (!examples.length) return null;

  return (
    <section className="global-examples" aria-labelledby="examples-heading">
      <h2 id="examples-heading" className="global-subhead">
        Example sentences
      </h2>
      <ol className="global-example-list">
        {examples.map((ex, i) => {
          const key = `ex-${i}`;
          const active = activeHighlightKey === key;
          return (
            <li key={`${ex.target}-${i}`}>
              <div className="global-example-target-row">
                <p
                  className={`global-example-target${active ? " sound-track-active" : ""}`}
                  lang={lang}
                >
                  {ex.target}
                </p>
                {ex.ttsUrl ? (
                  <GlobalPinExampleAudio
                    example={ex}
                    lang={lang}
                    langName={langName}
                    index={i}
                  />
                ) : null}
              </div>
              <p className="global-example-en">{ex.english}</p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
