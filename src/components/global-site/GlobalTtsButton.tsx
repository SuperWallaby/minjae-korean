"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  label?: string;
  className?: string;
};

export function GlobalTtsButton({
  src,
  label = "Play pronunciation",
  className = "",
}: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  if (!src) return null;

  const onClick = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      return;
    }
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio
        ref={audioRef}
        src={src}
        preload="none"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`global-tts-btn ${className}`.trim()}
        onClick={onClick}
        aria-label={label}
        title={label}
      >
        {playing ? "■" : "▶"}
      </button>
    </>
  );
}
