"use client";

import * as React from "react";
import { Loader2, Volume2 } from "lucide-react";

import { grammarGuidePronunciationApiUrl } from "@/lib/grammarGuideTts";

type Props = {
  guideId: number;
  pronunciationUrl?: string;
  wordName: string;
};

export function GrammarGuidePronunciationButton({
  guideId,
  pronunciationUrl,
  wordName,
}: Props) {
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

    setState("loading");
    const src = pronunciationUrl?.trim() || grammarGuidePronunciationApiUrl(guideId);
    const audio = new Audio(src);
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
  }, [guideId, pronunciationUrl, state, stop]);

  return (
    <button
      type="button"
      onClick={() => void play()}
      disabled={state === "loading"}
      className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] text-emerald-800 shadow-sm transition-colors hover:bg-emerald-50 hover:text-emerald-950 disabled:opacity-60"
      aria-label={`Play pronunciation of ${wordName}`}
      title="Listen"
    >
      {state === "loading" ? (
        <Loader2 size={20} strokeWidth={2.25} className="animate-spin" aria-hidden />
      ) : (
        <Volume2 size={20} strokeWidth={2.25} aria-hidden />
      )}
    </button>
  );
}
