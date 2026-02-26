"use client";

import * as React from "react";
import { X } from "lucide-react";
import { SongChunkCard } from "@/components/song/SongChunkCard";
import type { SongChunk, Lexeme } from "@/lib/songsRepo";

const isDev = process.env.NODE_ENV === "development";

type Props = {
  videoId: string;
  chunks: SongChunk[];
  lexicon?: Lexeme[];
  children: React.ReactNode;
  /** 개발 모드에서 단어 타이밍 저장 시 필요 */
  slug?: string;
};

export function SongPageContent({
  videoId,
  chunks: initialChunks,
  lexicon = [],
  children,
  slug,
}: Props) {
  const [chunks, setChunks] = React.useState<SongChunk[]>(initialChunks);
  React.useEffect(() => {
    setChunks(initialChunks);
  }, [initialChunks]);

  const videoSectionRef = React.useRef<HTMLDivElement>(null);
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
  const [miniVisible, setMiniVisible] = React.useState(false);
  const [miniDismissed, setMiniDismissed] = React.useState(false);
  const createdRef = React.useRef(false);

  const onWordTimingChange = React.useCallback(
    (chunkId: string, wordIndex: number, startMs: number, endMs: number) => {
      if (!slug) return;
      setChunks((prev) => {
        const next = prev.map((c) => {
          if (c.id !== chunkId) return c;
          const timings = [...(c.wordTimings ?? [])];
          while (timings.length <= wordIndex)
            timings.push({ startMs: 0, endMs: 0 });
          timings[wordIndex] = { startMs, endMs };
          return { ...c, wordTimings: timings };
        });
        fetch("/api/admin/songs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, chunks: next }),
        }).catch(() => {});
        return next;
      });
    },
    [slug],
  );

  React.useEffect(() => {
    const el = videoSectionRef.current;
    if (!el || !videoId) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (!e) return;
        const past = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (!past) setMiniDismissed(false);
        setMiniVisible((v) => (past && !miniDismissed ? true : past ? v : false));
      },
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [videoId, miniDismissed]);

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

  const showMini = miniVisible && miniDismissed === false;

  return (
    <>
      {children}

      {videoId ? (
        <section ref={videoSectionRef} className="relative">
          {showMini && (
            <div
              className="mb-10 aspect-video w-full rounded-xl border border-transparent"
              aria-hidden
            />
          )}
          <div
            className={
              showMini
                ? "fixed bottom-4 right-4 z-50 w-72 aspect-video overflow-hidden rounded-xl border border-border bg-black shadow-lg sm:w-80"
                : "mb-10 overflow-hidden rounded-xl border border-border bg-black aspect-video w-full"
            }
          >
            <div key={videoId} ref={containerRef} className="w-full h-full" />
            {showMini && (
              <div className="absolute right-1 top-1 flex gap-1">
                <button
                  type="button"
                  onClick={() => videoSectionRef.current?.scrollIntoView({ behavior: "smooth" })}
                  className="rounded bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                  title="Scroll to video"
                  aria-label="Scroll to video"
                >
                  <span className="text-xs font-medium">↑</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMiniDismissed(true)}
                  className="rounded bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
                  title="Close mini player"
                  aria-label="Close mini player"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl mb-4">
          Lyrics
        </h2>

        {chunks.length === 0 ? (
          <p className="text-muted-foreground">No lyrics yet.</p>
        ) : (
          <div className="space-y-5">
            {chunks.map((chunk) => {
              const isPlaying = playingChunkId === chunk.id;
              const currentTimeMs =
                isPlaying &&
                chunk.range &&
                countdownRemainingMs != null
                  ? chunk.range.endMs - countdownRemainingMs
                  : null;
              return (
                <SongChunkCard
                  key={chunk.id}
                  chunk={chunk}
                  lexicon={lexicon}
                  onPlayRange={
                    videoId
                      ? (startMs, endMs) =>
                          onPlayRange(chunk.id, startMs, endMs)
                      : undefined
                  }
                  isPlaying={isPlaying}
                  countdownRemainingMs={
                    isPlaying ? countdownRemainingMs : null
                  }
                  onStop={videoId ? onStop : undefined}
                  devMode={isDev && !!slug}
                  currentTimeMs={currentTimeMs}
                  onWordTimingChange={
                    isDev && slug ? onWordTimingChange : undefined
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
