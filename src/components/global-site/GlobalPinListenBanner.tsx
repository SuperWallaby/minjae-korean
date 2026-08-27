"use client";

import {
  AtlasPlayAllButton,
  PronouncePlayAllButton,
  PronounceRegionToggle,
  PronounceSlowNormalButton,
  PronounceSpeedControl,
  PronounceVoiceToggle,
} from "@/components/pronounce-site/PronouncePlayback";
import {
  SpanishAccentToggle,
  useSpanishAccent,
} from "@/components/global-site/SpanishAccentToggle";
import type { GlobalPinExample, GlobalPinWord } from "@/lib/globalSite/catalog";
import {
  globalWordToPronounceTts,
  pinHasExampleAudio,
  pinHasWordAudio,
  resolveGlobalTtsSrc,
} from "@/lib/globalSite/tts";
import { spanishTtsUrl } from "@/lib/globalSite/spanishAccents";

type Props = {
  lang: string;
  langName: string;
  words: GlobalPinWord[];
  examples?: GlobalPinExample[];
};

export function GlobalPinListenBanner({
  lang,
  langName,
  words,
  examples = [],
}: Props) {
  const isZh = lang === "zh";
  const isEs = lang === "es";
  const { accent } = useSpanishAccent();
  const hasWords = pinHasWordAudio(words);
  const hasExamples = pinHasExampleAudio(examples);
  if (!hasWords && !hasExamples) return null;

  const pronounceItems = words.map((w, i) => ({
    ...globalWordToPronounceTts(w),
    highlightKey: `w-${i}`,
  }));
  const firstWord = pronounceItems.find((it) =>
    Boolean(it.ttsUrl || it.ttsFemaleCn),
  );

  const wordSrc = (w: GlobalPinWord) =>
    isEs
      ? resolveGlobalTtsSrc(spanishTtsUrl(w, accent))
      : resolveGlobalTtsSrc(w.ttsUrl);
  const exSrc = (ex: GlobalPinExample) =>
    isEs
      ? resolveGlobalTtsSrc(spanishTtsUrl(ex, accent))
      : resolveGlobalTtsSrc(ex.ttsUrl);

  const playAllTracks = [
    ...words.map((w, i) => ({
      src: wordSrc(w),
      highlightKey: `w-${i}`,
    })),
    ...examples.map((ex, i) => ({
      src: exSrc(ex),
      highlightKey: `ex-${i}`,
    })),
  ].filter((t) => t.src);

  return (
    <aside className="sound-listen-banner" aria-label="Listening controls">
      <p className="sound-listen-kicker">
        {isZh
          ? "Sound desk · Mandarin CN (TW / HK optional)"
          : isEs
            ? `Listen · Spanish (${accent === "es" ? "Spain" : "LatAm"})`
            : `Listen · ${langName}`}
      </p>
      <div className="sound-hero-controls">
        {isZh ? (
          <>
            <PronounceVoiceToggle />
            <PronounceRegionToggle />
          </>
        ) : null}
        {isEs ? <SpanishAccentToggle /> : null}
        <PronounceSpeedControl />
        {isZh ? (
          <>
            <PronouncePlayAllButton items={pronounceItems} />
            {firstWord ? (
              <PronounceSlowNormalButton item={firstWord} />
            ) : null}
          </>
        ) : (
          <AtlasPlayAllButton tracks={playAllTracks} />
        )}
      </div>
    </aside>
  );
}
