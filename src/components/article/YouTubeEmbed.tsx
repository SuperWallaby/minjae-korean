"use client";

import { parseYouTubeId, parseYouTubeStartTime } from "@/lib/youtube";

type Props = {
  /** YouTube URL or video ID (supports ?t=899 for start time in seconds) */
  urlOrId: string;
  className?: string;
};

/**
 * Renders a responsive YouTube embed (16:9). Use for article paragraphs.
 * Start time: use ?t=899 or &start=899 in the URL for 899 seconds.
 */
export function YouTubeEmbed({ urlOrId, className = "" }: Props) {
  const videoId = parseYouTubeId(urlOrId);
  if (!videoId) {
    return (
      <div
        className={`rounded-xl border border-border bg-muted/20 p-6 text-center text-sm text-muted-foreground ${className}`}
      >
        Invalid YouTube URL or ID
      </div>
    );
  }

  const startSec = parseYouTubeStartTime(urlOrId);
  const embedUrl =
    startSec != null
      ? `https://www.youtube.com/embed/${videoId}?rel=0&start=${startSec}`
      : `https://www.youtube.com/embed/${videoId}?rel=0`;

  return (
    <div
      className={`overflow-hidden rounded-xl border border-border bg-muted/10 ${className}`}
    >
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={embedUrl}
          title="YouTube video"
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}
