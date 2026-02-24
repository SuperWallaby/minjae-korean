"use client";

import * as React from "react";
import { SongChunkCard } from "@/components/song/SongChunkCard";
import type { SongChunk, Lexeme } from "@/lib/songsRepo";

type Props = {
  videoId: string;
  chunks: SongChunk[];
  lexicon?: Lexeme[];
  children: React.ReactNode;
};

export function SongPageContent({
  videoId,
  chunks,
  lexicon = [],
  children,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const playerRef = React.useRef<{
    seekTo(s: number): void;
    playVideo(): void;
    pauseVideo(): void;
  } | null>(null);
  const stopTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [apiReady, setApiReady] = React.useState(false);
  const [playingChunkId, setPlayingChunkId] = React.useState<string | null>(
    null,
  );
  const [countdownEndAt, setCountdownEndAt] = React.useState<number | null>(
    null,
  );
  const [countdownRemainingMs, setCountdownRemainingMs] =
    React.useState<number>(0);
  const createdRef = React.useRef(false);

  React.useEffect(() => {
    if (countdownEndAt == null) return;
    const tick = () => {
      const remaining = Math.max(0, countdownEndAt - Date.now());
      setCountdownRemainingMs(remaining);
      if (remaining <= 0) return false;
      return true;
    };
    tick();
    const id = setInterval(() => {
      if (!tick()) clearInterval(id);
    }, 200);
    return () => clearInterval(id);
  }, [countdownEndAt]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as unknown as { YT?: { Player: unknown } }).YT?.Player) {
      setApiReady(true);
      return;
    }
    const prev = (window as unknown as { onYouTubeIframeAPIReady?: () => void })
      .onYouTubeIframeAPIReady;
    (
      window as unknown as { onYouTubeIframeAPIReady?: () => void }
    ).onYouTubeIframeAPIReady = () => {
      setApiReady(true);
      prev?.();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(tag, first);
    return () => {
      (
        window as unknown as { onYouTubeIframeAPIReady?: () => void }
      ).onYouTubeIframeAPIReady = prev;
    };
  }, []);

  React.useEffect(() => {
    if (!videoId || !apiReady || !containerRef.current) return;
    if (createdRef.current) return;
    createdRef.current = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const YT = (window as any).YT;
    if (!YT) return;
    try {
      const player = new YT.Player(containerRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        events: {
          onReady(e: { target: unknown }) {
            playerRef.current = e.target as {
              seekTo(s: number): void;
              playVideo(): void;
              pauseVideo(): void;
            };
          },
        },
      });
      if (player && !playerRef.current) playerRef.current = player;
    } catch {
      createdRef.current = false;
    }
    return () => {
      playerRef.current = null;
      createdRef.current = false;
    };
  }, [videoId, apiReady]);

  const onStop = React.useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    try {
      playerRef.current?.pauseVideo();
    } catch {
      // ignore
    }
    setPlayingChunkId(null);
    setCountdownEndAt(null);
  }, []);

  const onPlayRange = React.useCallback(
    (chunkId: string, startMs: number, endMs: number) => {
      const p = playerRef.current;
      if (!p) return;
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current);
        stopTimerRef.current = null;
      }
      const startSec = startMs / 1000;
      const durationMs = endMs - startMs;
      p.seekTo(startSec);
      p.playVideo();
      setPlayingChunkId(chunkId);
      setCountdownEndAt(durationMs > 0 ? Date.now() + durationMs : null);
      if (durationMs > 0) {
        stopTimerRef.current = setTimeout(() => {
          stopTimerRef.current = null;
          try {
            p.pauseVideo();
          } catch {
            // ignore
          }
          setPlayingChunkId(null);
          setCountdownEndAt(null);
        }, durationMs);
      }
    },
    [],
  );

  return (
    <>
      {children}

      {videoId ? (
        <div className="mb-10 overflow-hidden rounded-xl border border-border bg-black aspect-video w-full">
          <div key={videoId} ref={containerRef} className="w-full h-full" />
        </div>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl mb-4">
          Lyrics
        </h2>

        {chunks.length === 0 ? (
          <p className="text-muted-foreground">No lyrics yet.</p>
        ) : (
          <div className="space-y-5">
            {chunks.map((chunk) => (
              <SongChunkCard
                key={chunk.id}
                chunk={chunk}
                lexicon={lexicon}
                onPlayRange={
                  videoId
                    ? (startMs, endMs) => onPlayRange(chunk.id, startMs, endMs)
                    : undefined
                }
                isPlaying={playingChunkId === chunk.id}
                countdownRemainingMs={
                  playingChunkId === chunk.id ? countdownRemainingMs : null
                }
                onStop={videoId ? onStop : undefined}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
