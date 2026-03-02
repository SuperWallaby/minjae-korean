"use client";

import { Volume2 } from "lucide-react";
import * as React from "react";

/** 오디오 재생 시 캐시 무효화용. 오디오 재생성 후 올리면 됨 */
const AUDIO_VERSION = 2;

export function SoundPlayButton({
  src,
  size = "sm",
  "aria-label": ariaLabel = "재생",
}: {
  src: string;
  size?: "sm" | "md";
  "aria-label"?: string;
}) {
  const url =
    src.startsWith("/audio/") ? `${src}${src.includes("?") ? "&" : "?"}v=${AUDIO_VERSION}` : src;
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  const toggle = React.useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("soundplay:play", { detail: el }));
      }
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
  }, [url]);

  React.useEffect(() => {
    const el = audioRef.current;
    if (!el || typeof window === "undefined") return;
    const onOtherPlay = (e: Event) => {
      const ev = e as CustomEvent<HTMLAudioElement>;
      if (ev.detail !== el && !el.paused) el.pause();
    };
    window.addEventListener("soundplay:play", onOtherPlay);
    return () => window.removeEventListener("soundplay:play", onOtherPlay);
  }, [url]);

  return (
    <>
      <audio ref={audioRef} src={url} preload="metadata" className="hidden" />
      <button
        type="button"
        onClick={toggle}
        aria-label={ariaLabel}
        className={`
          inline-flex items-center justify-center rounded-full w-fit border border-border cursor-pointer transition
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
          ${size === "sm" ? "p-1.5" : "p-2"}
          ${isPlaying ? "bg-primary/15 text-primary shadow-[0_0_0_2px] shadow-primary/30" : "text-muted-foreground hover:bg-muted hover:text-foreground"}
        `}
      >
        <Volume2 className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
      </button>
    </>
  );
}
