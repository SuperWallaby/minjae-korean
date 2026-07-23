"use client";

import * as React from "react";
import { Loader2, Volume2 } from "lucide-react";

type Props = {
  src: string;
  label: string;
  className?: string;
};

export function VocabSeoPlayButton({ src, label, className }: Props) {
  const [state, setState] = React.useState<"idle" | "loading" | "playing">(
    "idle",
  );
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  React.useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const stop = React.useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setState("idle");
  }, []);

  const play = React.useCallback(async () => {
    if (state === "playing") {
      stop();
      return;
    }
    const url = src.trim();
    if (!url) return;

    setState("loading");
    const audio = new Audio(url);
    audioRef.current = audio;

    const onEnd = () => {
      audioRef.current = null;
      setState("idle");
    };
    audio.addEventListener("ended", onEnd, { once: true });
    audio.addEventListener(
      "error",
      () => {
        audioRef.current = null;
        setState("idle");
      },
      { once: true },
    );

    try {
      await audio.play();
      setState("playing");
    } catch {
      audioRef.current = null;
      setState("idle");
    }
  }, [src, state, stop]);

  return (
    <button
      type="button"
      onClick={() => void play()}
      disabled={state === "loading"}
      className={
        className ||
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] text-[var(--quiz-text)] transition hover:bg-[var(--quiz-canvas)] disabled:opacity-60"
      }
      aria-label={label}
      title="Listen"
    >
      {state === "loading" ? (
        <Loader2 size={16} strokeWidth={2.25} className="animate-spin" aria-hidden />
      ) : (
        <Volume2 size={16} strokeWidth={2.25} aria-hidden />
      )}
    </button>
  );
}
