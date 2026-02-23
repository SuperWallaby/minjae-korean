"use client";

import { parseYouTubeId } from "@/lib/youtube";

type Props = {
  /** YouTube URL or video ID */
  urlOrId: string;
  className?: string;
};

/**
 * Renders a responsive YouTube embed (16:9). Use for article paragraphs.
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

  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0`;

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
