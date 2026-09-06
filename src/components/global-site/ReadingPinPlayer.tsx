"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { KoReading } from "@/lib/globalSite/catalog";
import {
  PronounceSpeedControl,
  usePronouncePlayback,
} from "@/components/pronounce-site/PronouncePlayback";

function fmt(sec: number) {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

type Props = { reading: KoReading; children?: ReactNode };

export function ReadingPinPlayer({ reading, children }: Props) {
  const { rate, stopAll, registerActiveAudio } = usePronouncePlayback();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackId, setTrackId] = useState(
    reading.defaultTrack || reading.tracks[0]?.voiceId || "",
  );
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);
  const [snBusy, setSnBusy] = useState(false);
  const [clipRate, setClipRate] = useState(1);
  const abortSn = useRef(false);

  const track =
    reading.tracks.find((tr) => tr.voiceId === trackId) || reading.tracks[0];
  const showVoices =
    reading.mode === "monologue" && reading.tracks.length > 1;

  const activeIndex = useMemo(() => {
    if (!track) return -1;
    const ms = t * 1000;
    const hit = track.cues.find((c) => ms >= c.startMs && ms < c.endMs);
    return hit ? hit.lineIndex : -1;
  }, [track, t]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !track?.ttsUrl) return;
    el.src = track.ttsUrl;
    el.load();
    setT(0);
    setPlaying(false);
  }, [track?.ttsUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.playbackRate = snBusy ? clipRate : rate;
  }, [rate, clipRate, snBusy, track?.ttsUrl]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setT(el.currentTime);
    const onMeta = () => setDur(el.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("loadedmetadata", onMeta);
    el.addEventListener("durationchange", onMeta);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onPause);
    return () => {
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("loadedmetadata", onMeta);
      el.removeEventListener("durationchange", onMeta);
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onPause);
    };
  }, [track?.ttsUrl]);

  if (!track?.ttsUrl) return null;

  const toggle = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      return;
    }
    stopAll();
    registerActiveAudio(el);
    void el.play();
  };

  const seek = (next: number) => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = next;
    setT(next);
  };

  const jumpLine = (i: number) => {
    const cue = track.cues.find((c) => c.lineIndex === i);
    if (!cue) return;
    seek(cue.startMs / 1000);
    const el = audioRef.current;
    if (el && !playing) {
      stopAll();
      registerActiveAudio(el);
      void el.play();
    }
  };

  const playRange = (
    el: HTMLAudioElement,
    startMs: number,
    endMs: number,
    nextRate: number,
  ) =>
    new Promise<void>((resolve, reject) => {
      const start = startMs / 1000;
      const end = Math.max(start + 0.05, endMs / 1000);
      el.pause();
      el.playbackRate = nextRate;
      setClipRate(nextRate);
      el.currentTime = start;
      const onTime = () => {
        if (el.currentTime >= end - 0.03) {
          el.pause();
          cleanup();
          resolve();
        }
      };
      const onEnd = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        reject(new Error("audio error"));
      };
      const cleanup = () => {
        el.removeEventListener("timeupdate", onTime);
        el.removeEventListener("ended", onEnd);
        el.removeEventListener("error", onErr);
      };
      el.addEventListener("timeupdate", onTime);
      el.addEventListener("ended", onEnd);
      el.addEventListener("error", onErr);
      void el.play().catch((err) => {
        cleanup();
        reject(err);
      });
    });

  const runSlowNormal = async () => {
    const el = audioRef.current;
    if (!el || !track?.ttsUrl) return;
    if (snBusy) {
      abortSn.current = true;
      el.pause();
      setSnBusy(false);
      return;
    }
    abortSn.current = false;
    setSnBusy(true);
    stopAll();
    registerActiveAudio(el);
    const slices = [...(track.cues || [])].sort((a, b) => a.startMs - b.startMs);
    const parts = slices.length
      ? slices
      : [{ startMs: 0, endMs: Math.max(1000, (dur || 1) * 1000), lineIndex: 0 }];
    try {
      for (const cue of parts) {
        if (abortSn.current) break;
        await playRange(el, cue.startMs, cue.endMs, 0.7);
        if (abortSn.current) break;
        await playRange(el, cue.startMs, cue.endMs, 1);
      }
    } catch {
      /* ignore */
    } finally {
      setSnBusy(false);
      setClipRate(rate);
    }
  };

  const slowHL = (snBusy ? clipRate : rate) < 1;

  const hasMeaning = reading.lines.some((line) => line.en?.trim());

  const scrollToMeaning = () => {
    document
      .getElementById("reading-meaning")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="reading-player">
      <div className="global-pin-controls">
        <p className="sound-listen-kicker">🎧 Listen</p>
        <div className="reading-player-dock">
          <audio ref={audioRef} preload="metadata" />
          {showVoices ? (
            <div className="reading-player-voices" role="group" aria-label="Voice">
              {reading.tracks.map((tr) => (
                <button
                  key={tr.voiceId}
                  type="button"
                  className={tr.voiceId === track.voiceId ? "is-on" : undefined}
                  onClick={() => setTrackId(tr.voiceId)}
                >
                  {tr.label}
                </button>
              ))}
            </div>
          ) : null}
          <div className="reading-player-bar">
            <div className="sound-hero-controls">
              <PronounceSpeedControl />
              <button
                type="button"
                className={`sound-playlist-btn sound-playlist-btn--primary${playing ? " is-on" : ""}`}
                onClick={toggle}
                aria-pressed={playing}
              >
                {playing ? (
                  <>
                    <span className="sound-playlist-icon" aria-hidden>
                      ■
                    </span>
                    Pause
                  </>
                ) : (
                  <>
                    <span className="sound-playlist-icon" aria-hidden>
                      ▶
                    </span>
                    Play
                  </>
                )}
              </button>
              <button
                type="button"
                className={`sound-playlist-btn${snBusy ? " is-on" : ""}`}
                onClick={() => void runSlowNormal()}
                aria-pressed={snBusy}
                title="Each line slow, then normal"
              >
                {snBusy ? "Stop" : "Slow → Normal"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={dur > 0 ? dur : 0}
              step={0.05}
              value={Math.min(t, dur || t)}
              aria-label="Audio timeline"
              onChange={(e) => seek(Number(e.target.value))}
            />
            <div className="reading-player-meta">
              <span>
                {fmt(t)} / {fmt(dur)}
              </span>
              <span>{rate === 1 ? "Normal" : `${rate}×`}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="reading-player-script">
        {reading.lines.map((line, i) => (
          <button
            key={`${i}-${line.ko}`}
            type="button"
            className={`reading-player-row${
              activeIndex === i ? (slowHL ? " is-slow" : " is-on") : ""
            }`}
            onClick={() => jumpLine(i)}
          >
            {line.speakerKo || line.speaker ? (
              <span className="reading-player-speaker">
                {line.speakerKo || line.speaker}
              </span>
            ) : null}
            <span className="reading-player-ko">{line.ko}</span>
          </button>
        ))}
        {hasMeaning ? (
          <button
            type="button"
            className="reading-meaning-jump"
            onClick={scrollToMeaning}
          >
            check the meaning 👇
          </button>
        ) : null}
      </div>
      {children}
    </div>
  );
}
