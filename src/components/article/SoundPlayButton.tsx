"use client";

import { Volume2 } from "lucide-react";
import * as React from "react";

export function SoundPlayButton({
  src,
  size = "md",
  "aria-label": ariaLabel = "재생",
}: {
  src: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const toggle = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, []);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onEnd = () => setIsPlaying(false);
    const onPause = () => setIsPlaying(false);
    el.addEventListener("play", onPlay);
    el.addEventListener("ended", onEnd);
    el.addEventListener("pause", onPause);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("pause", onPause);
    };
  }, [src]);

  return (
    <>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={toggle}
        aria-label={ariaLabel}
        className={`
          inline-flex items-center justify-center rounded-full w-fit p-${size === "sm" ? "2" : "3"} border border-border cursor-pointer transition
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          ${isPlaying ? "bg-primary/15 text-primary shadow-[0_0_0_2px] shadow-primary/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
        `}
      >
        <Volume2
          className={`h-${size === "sm" ? "4" : "5"} w-${size === "sm" ? "4" : "5"}`}
        />
      </button>
    </>
  );
}
