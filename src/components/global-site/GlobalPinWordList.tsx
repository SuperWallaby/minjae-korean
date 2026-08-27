"use client";

import { usePronouncePlayback } from "@/components/pronounce-site/PronouncePlayback";
import { GlobalPinWordAudio } from "@/components/global-site/GlobalPinWordAudio";
import type { GlobalPinWord } from "@/lib/globalSite/catalog";

type Props = {
  lang: string;
  langName: string;
  words: GlobalPinWord[];
};

export function GlobalPinWordList({ lang, langName, words }: Props) {
  const { activeHighlightKey } = usePronouncePlayback();

  return (
    <>
      <h2 className="global-subhead">Glossary · {langName}</h2>
      <ul className="global-word-list">
        {words.map((w, i) => {
          const key = `w-${i}`;
          const active = activeHighlightKey === key;
          return (
            <li key={`${w.english}-${w.target}-${i}`}>
              <span className="global-word-index">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="global-word-main">
                <span
                  className={`global-word-target${active ? " sound-track-active" : ""}`}
                  lang={lang}
                >
                  {w.target}
                </span>
                <span className="global-word-roma">
                  {w.romanization ? `[${w.romanization}]` : ""}
                </span>
              </div>
              {(w.ttsUrl || w.ttsLatam || w.ttsEs || lang === "zh") ? (
                <GlobalPinWordAudio
                  word={w}
                  lang={lang}
                  langName={langName}
                />
              ) : null}
              <span className="global-word-en">{w.english}</span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
