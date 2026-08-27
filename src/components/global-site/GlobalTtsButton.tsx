"use client";

import { useEffect, useRef, useState } from "react";
import { usePronouncePlayback } from "@/components/pronounce-site/PronouncePlayback";
import { resolveGlobalTtsSrc } from "@/lib/globalSite/tts";

type Props = {
  src: string;
  label?: string;
  className?: string;
  /** sound-* classes on getpronounce pin pages */
  variant?: "global" | "sound";
};

export function GlobalTtsButton({
  src,
  label = "Play pronunciation",
  className = "",
  variant = "global",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const { rate, registerActiveAudio } = usePronouncePlayback();
  const resolved = resolveGlobalTtsSrc(src);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !resolved) return;
    if (el.getAttribute("src") !== resolved) {
      el.pause();
      el.src = resolved;
      setPlaying(false);
    }
  }, [resolved]);

  if (!resolved) return null;

  const rootClass =
    variant === "sound"
      ? `sound-tts ${className}`.trim()
      : `global-tts ${className}`.trim();
  const btnClass =
    variant === "sound" ? "sound-tts-btn" : "global-tts-btn";

  const onClick = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      registerActiveAudio(null);
      return;
    }
    el.playbackRate = rate;
    registerActiveAudio(el);
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  return (
    <span className={rootClass}>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => {
          setPlaying(false);
          registerActiveAudio(null);
        }}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`${btnClass}${playing ? " is-playing" : ""}`}
        onClick={onClick}
        aria-label={label}
        aria-pressed={playing}
        title={label}
      >
        {playing ? "■" : "▶"}
      </button>
    </span>
  );
}
