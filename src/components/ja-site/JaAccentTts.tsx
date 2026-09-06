"use client";

import * as React from "react";

import {
  JA_EN_ACCENTS,
  jaEnAccentUrls,
  type JaEnAccentId,
  type JaEnTtsFields,
} from "@/lib/jaSite/accents";

import { useJaPlaybackRate } from "./JaPlayback";

function UsFlag() {
  return (
    <svg viewBox="0 0 21 15" aria-hidden>
      <rect width="21" height="15" fill="#b22234" />
      <path
        d="M0 1.15h21M0 3.46h21M0 5.77h21M0 8.08h21M0 10.38h21M0 12.69h21"
        stroke="#fff"
        strokeWidth="1.15"
      />
      <rect width="8.4" height="8.08" fill="#3c3b6e" />
    </svg>
  );
}

function UkFlagInner() {
  return (
    <>
      <rect width="21" height="15" fill="#012169" />
      <path
        d="M0 0l21 15M21 0L0 15"
        stroke="#fff"
        strokeWidth="3"
      />
      <path
        d="M0 0l21 15M21 0L0 15"
        stroke="#c8102e"
        strokeWidth="1.2"
      />
      <path d="M10.5 0v15M0 7.5h21" stroke="#fff" strokeWidth="5" />
      <path d="M10.5 0v15M0 7.5h21" stroke="#c8102e" strokeWidth="2.6" />
    </>
  );
}

function UkFlag() {
  return (
    <svg viewBox="0 0 21 15" aria-hidden>
      <UkFlagInner />
    </svg>
  );
}

function AuFlag() {
  return (
    <svg viewBox="0 0 21 15" aria-hidden>
      <rect width="21" height="15" fill="#012169" />
      <svg x="0" y="0" width="10.5" height="7.5" viewBox="0 0 21 15">
        <UkFlagInner />
      </svg>
      <circle cx="15.6" cy="8.4" r="0.55" fill="#fff" />
      <circle cx="17.4" cy="6.2" r="0.45" fill="#fff" />
      <circle cx="18.2" cy="9.5" r="0.4" fill="#fff" />
      <circle cx="14.4" cy="11.1" r="0.4" fill="#fff" />
      <circle cx="16.4" cy="12.4" r="0.35" fill="#fff" />
      <circle cx="7.6" cy="11.2" r="0.85" fill="#fff" />
    </svg>
  );
}

export function JaAccentFlag({ id }: { id: JaEnAccentId }) {
  if (id === "uk") return <UkFlag />;
  if (id === "au") return <AuFlag />;
  return <UsFlag />;
}

function SoundIcon({ playing }: { playing: boolean }) {
  return (
    <svg className="ja-accent-sound" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M4.5 9.2h3.1L12 5.6v12.8L7.6 14.8H4.5a1.2 1.2 0 0 1-1.2-1.2v-3.2A1.2 1.2 0 0 1 4.5 9.2Z"
      />
      {playing ? (
        <path
          fill="currentColor"
          d="M15.2 8.2a5.4 5.4 0 0 1 0 7.6l-1.1-1.1a3.85 3.85 0 0 0 0-5.4Zm2.7-2.6a9 9 0 0 1 0 12.8l-1.15-1.15a7.4 7.4 0 0 0 0-10.5Z"
        />
      ) : (
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          d="M15.4 9.1a3.6 3.6 0 0 1 0 5.8M18.1 7a6.4 6.4 0 0 1 0 10"
        />
      )}
    </svg>
  );
}

type Props = {
  item: JaEnTtsFields;
  wordLabel: string;
};

export function JaAccentTts({ item, wordLabel }: Props) {
  const urls = jaEnAccentUrls(item);
  const accents = JA_EN_ACCENTS.filter((a) => urls[a.id]);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState<JaEnAccentId | null>(null);
  const rate = useJaPlaybackRate();

  if (!accents.length) return null;

  const applyRate = (el: HTMLAudioElement) => {
    el.playbackRate = rate;
    el.preservesPitch = true;
  };

  const toggle = (id: JaEnAccentId, src: string) => {
    const el = audioRef.current;
    if (!el) return;
    if (playing === id && !el.paused) {
      el.pause();
      el.currentTime = 0;
      setPlaying(null);
      return;
    }
    if (el.src !== src) el.src = src;
    applyRate(el);
    el.play()
      .then(() => setPlaying(id))
      .catch(() => setPlaying(null));
  };

  return (
    <div
      className="ja-accent-row"
      role="group"
      aria-label={`${wordLabel} の発音`}
    >
      <audio
        ref={audioRef}
        preload="none"
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (el) applyRate(el);
        }}
        onEnded={() => setPlaying(null)}
        onPause={() => {
          const el = audioRef.current;
          if (el?.paused) setPlaying(null);
        }}
      />
      {accents.map((accent) => {
        const src = urls[accent.id];
        const isPlaying = playing === accent.id;
        return (
          <button
            key={accent.id}
            type="button"
            className={`ja-accent-btn${isPlaying ? " is-playing" : ""}`}
            onClick={() => toggle(accent.id, src)}
            aria-pressed={isPlaying}
            aria-label={`${wordLabel} · ${accent.hint}を再生`}
            title={accent.hint}
          >
            <span className="ja-accent-flag">
              <JaAccentFlag id={accent.id} />
            </span>
            <SoundIcon playing={isPlaying} />
            <span className="ja-accent-code">{accent.labelJa}</span>
          </button>
        );
      })}
    </div>
  );
}
