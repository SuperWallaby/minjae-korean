"use client";

import * as React from "react";
import Image from "next/image";
import { Play } from "lucide-react";

import { NewsDescribe } from "@/components/article/NewsDescribe";
import { YouTubeEmbed } from "@/components/article/YouTubeEmbed";
import type { ParagraphBlock, ReadingCue } from "@/lib/articleReading";
import { cn } from "@/lib/utils";

type Props = {
  audio: string;
  title: string;
  paragraphs: ParagraphBlock[];
  readingCues: ReadingCue[];
};

export function ReadingAudioSync({
  audio,
  title,
  paragraphs,
  readingCues,
}: Props) {
  const audioRef = React.useRef<HTMLAudioElement>(null);
  const [currentTimeMs, setCurrentTimeMs] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;

    const syncTime = () => {
      setCurrentTimeMs(Math.round(audioEl.currentTime * 1000));
    };
    const onPlay = () => {
      setIsPlaying(true);
      syncTime();
    };
    const onPause = () => {
      setIsPlaying(false);
      syncTime();
    };
    const onEnded = () => {
      setIsPlaying(false);
      syncTime();
    };

    syncTime();
    audioEl.addEventListener("timeupdate", syncTime);
    audioEl.addEventListener("seeked", syncTime);
    audioEl.addEventListener("loadedmetadata", syncTime);
    audioEl.addEventListener("play", onPlay);
    audioEl.addEventListener("pause", onPause);
    audioEl.addEventListener("ended", onEnded);

    return () => {
      audioEl.removeEventListener("timeupdate", syncTime);
      audioEl.removeEventListener("seeked", syncTime);
      audioEl.removeEventListener("loadedmetadata", syncTime);
      audioEl.removeEventListener("play", onPlay);
      audioEl.removeEventListener("pause", onPause);
      audioEl.removeEventListener("ended", onEnded);
    };
  }, []);

  const orderedCues = React.useMemo(
    () => [...readingCues].sort((a, b) => a.order - b.order),
    [readingCues],
  );

  const cuesByParagraph = React.useMemo(() => {
    const grouped = new Map<number, ReadingCue[]>();
    for (const cue of orderedCues) {
      const list = grouped.get(cue.paragraphIndex) ?? [];
      list.push(cue);
      grouped.set(cue.paragraphIndex, list);
    }
    return grouped;
  }, [orderedCues]);

  const activeCueId = React.useMemo(() => {
    if (!orderedCues.length) return null;
    const active =
      orderedCues.find(
        (cue) => currentTimeMs >= cue.startMs && currentTimeMs < cue.endMs,
      ) ??
      (currentTimeMs >= (orderedCues[orderedCues.length - 1]?.endMs ?? 0)
        ? orderedCues[orderedCues.length - 1]
        : null);
    return active?.id ?? null;
  }, [currentTimeMs, orderedCues]);

  const jumpToCue = React.useCallback((cue: ReadingCue) => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.currentTime = cue.startMs / 1000;
    setCurrentTimeMs(cue.startMs);
    void audioEl.play().catch(() => {});
  }, []);

  return (
    <>
      <div className="sticky top-0 z-9999 -mx-4 mt-6 mb-6 rounded-xl border border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6">
        <div className="text-xs font-medium text-muted-foreground">Listen</div>
        <audio ref={audioRef} controls src={audio} className="mt-1 w-full" />
      </div>

      <div className="mt-10 space-y-6 text-base leading-8 sm:text-lg">
        {paragraphs.map((paragraph, paragraphIndex) => {
          const paragraphCues = cuesByParagraph.get(paragraphIndex) ?? [];
          const subtitleCue =
            paragraphCues.find((cue) => cue.kind === "subtitle") ?? null;
          const sentenceCues = paragraphCues.filter(
            (cue) => cue.kind === "sentence",
          );

          return (
            <div
              key={`${paragraphIndex}-${paragraph.subtitle}-${paragraph.youtube ?? ""}`}
            >
              {subtitleCue ? (
                <CueRow
                  cue={subtitleCue}
                  isActive={isPlaying && activeCueId === subtitleCue.id}
                  onJump={jumpToCue}
                  tone="subtitle"
                />
              ) : paragraph.subtitle ? (
                <p className="mb-2 font-semibold text-foreground">
                  <NewsDescribe>{paragraph.subtitle}</NewsDescribe>
                </p>
              ) : null}

              {sentenceCues.length > 0 ? (
                <div className="space-y-2">
                  {sentenceCues.map((cue) => (
                    <CueRow
                      key={cue.id}
                      cue={cue}
                      isActive={isPlaying && activeCueId === cue.id}
                      onJump={jumpToCue}
                      tone="sentence"
                    />
                  ))}
                </div>
              ) : paragraph.content ? (
                <div className="whitespace-pre-wrap text-foreground/90">
                  <NewsDescribe>
                    {String(paragraph.content ?? "").trim() || null}
                  </NewsDescribe>
                </div>
              ) : null}

              {paragraph.youtube ? (
                <div className="mt-4 mb-10">
                  <YouTubeEmbed urlOrId={paragraph.youtube} />
                </div>
              ) : null}
              {paragraph.image ? (
                <div className="mt-4 mb-10 overflow-hidden rounded-xl border border-border bg-muted/10">
                  <Image
                    src={paragraph.image}
                    alt={title}
                    width={1600}
                    height={900}
                    className="h-auto w-full max-w-full"
                    style={{ width: "100%", height: "auto" }}
                    unoptimized
                    sizes="(max-width: 896px) 100vw, 896px"
                  />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

function CueRow({
  cue,
  isActive,
  onJump,
  tone,
}: {
  cue: ReadingCue;
  isActive: boolean;
  onJump: (cue: ReadingCue) => void;
  tone: "subtitle" | "sentence";
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl px-2 py-1.5 transition-colors",
        isActive &&
          "bg-[rgba(74,156,134,0.10)] ring-1 ring-[rgba(74,156,134,0.18)]",
      )}
    >
      <button
        type="button"
        onClick={() => onJump(cue)}
        className={cn(
          "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition hover:text-foreground hover:bg-muted/60",
          isActive &&
            "border-transparent bg-[rgba(74,156,134,0.16)] text-foreground",
        )}
        aria-label="Jump audio to this line"
        title="Jump audio to this line"
      >
        <Play className="h-3.5 w-3.5 translate-x-px" />
      </button>
      <div className={cn("min-w-0", tone === "sentence" && "flex-1")}>
        {tone === "subtitle" ? (
          <p className="font-semibold text-foreground">
            <NewsDescribe>{cue.text}</NewsDescribe>
          </p>
        ) : (
          <div className="text-foreground/90">
            <NewsDescribe>{cue.text}</NewsDescribe>
          </div>
        )}
      </div>
    </div>
  );
}
