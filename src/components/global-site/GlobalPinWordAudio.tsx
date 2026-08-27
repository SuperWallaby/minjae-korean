"use client";

import { GlobalTtsButton } from "@/components/global-site/GlobalTtsButton";
import { PronounceTtsButton } from "@/components/pronounce-site/PronouncePlayback";
import { useSpanishAccent } from "@/components/global-site/SpanishAccentToggle";
import type { GlobalPinExample, GlobalPinWord } from "@/lib/globalSite/catalog";
import {
  globalWordToPronounceTts,
  resolveGlobalTtsSrc,
} from "@/lib/globalSite/tts";
import { spanishTtsUrl } from "@/lib/globalSite/spanishAccents";

export function GlobalPinWordAudio({
  word,
  lang,
  langName,
}: {
  word: GlobalPinWord;
  lang: string;
  langName: string;
}) {
  const { accent } = useSpanishAccent();
  const label = `Play ${word.target} in ${langName}`;

  if (lang === "zh") {
    return (
      <PronounceTtsButton
        item={globalWordToPronounceTts(word)}
        label={`${word.target}${word.romanization ? ` ${word.romanization}` : ""}`}
      />
    );
  }

  const raw =
    lang === "es"
      ? spanishTtsUrl(word, accent)
      : String(word.ttsUrl || "").trim();
  const src = resolveGlobalTtsSrc(raw);
  if (!src) return null;
  return <GlobalTtsButton src={src} label={label} variant="sound" />;
}

export function GlobalPinExampleAudio({
  example,
  lang,
  langName,
  index,
}: {
  example: GlobalPinExample;
  lang: string;
  langName: string;
  index: number;
}) {
  const { accent } = useSpanishAccent();
  const raw =
    lang === "es"
      ? spanishTtsUrl(example, accent)
      : String(example.ttsUrl || "").trim();
  const src = resolveGlobalTtsSrc(raw);
  if (!src) return null;
  return (
    <GlobalTtsButton
      src={src}
      label={`Play example ${index + 1} in ${langName}`}
      variant="sound"
    />
  );
}
