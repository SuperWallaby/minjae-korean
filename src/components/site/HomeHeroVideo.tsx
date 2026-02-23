"use client";

import * as React from "react";
import { Play } from "lucide-react";

const VIDEO_SRC = "https://file.kajakorean.com/timelaps2.mp4";

export function HomeHeroVideo() {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [showPlay, setShowPlay] = React.useState(true);

  const handleClick = React.useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setShowPlay(false)).catch(() => {});
    } else {
      video.pause();
      setShowPlay(true);
    }
  }, []);

  const handlePause = React.useCallback(() => {
    setShowPlay(true);
  }, []);

  return (
    <div className="order-1 overflow-hidden rounded-3xl border border-border bg-muted/60 lg:order-2">
      <div
        className="relative aspect-video w-full cursor-pointer"
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={showPlay ? "Play video" : "Pause video"}
      >
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          loop
          playsInline
          className="h-full w-full object-cover object-center"
          onPause={handlePause}
        />
        {showPlay ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <div className="grid size-16 place-items-center rounded-full bg-white/70 ring-1 ring-black/10 backdrop-blur-sm">
              <Play
                className="size-6 text-foreground/80"
                fill="currentColor"
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
