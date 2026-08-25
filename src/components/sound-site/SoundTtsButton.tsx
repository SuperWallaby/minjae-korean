"use client";

import { useEffect, useRef, useState } from "react";
import { useSoundPlayback } from "@/components/sound-site/SoundPlayback";
import { soundTtsUrl, type SoundTtsFields } from "@/lib/soundSite/voices";

type Props = {
  item: SoundTtsFields;
  label: string;
};

export function SoundTtsButton({ item, label }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const { rate, gender, accent, registerActiveAudio } = useSoundPlayback();
  const src = soundTtsUrl(item, gender, accent);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (el.getAttribute("src") !== src) {
      el.pause();
      el.removeAttribute("src");
      setPlaying(false);
    }
  }, [src]);

  if (!src) {
    return (
      <span className="sound-tts-empty" title="Audio coming soon">
        ···
      </span>
    );
  }

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (!el.paused) {
      el.pause();
      el.currentTime = 0;
      setPlaying(false);
      registerActiveAudio(null);
      return;
    }
    if (!el.getAttribute("src")) el.src = src;
    el.playbackRate = rate;
    registerActiveAudio(el);
    void el
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  return (
    <span className="sound-tts">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => {
          setPlaying(false);
          registerActiveAudio(null);
        }}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`sound-tts-btn${playing ? " is-playing" : ""}`}
        onClick={toggle}
        aria-label={`${playing ? "Stop" : "Play"} ${label}`}
        aria-pressed={playing}
      >
        {playing ? "■" : "▶"}
      </button>
    </span>
  );
}
