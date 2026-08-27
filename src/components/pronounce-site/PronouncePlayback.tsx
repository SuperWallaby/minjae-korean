"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  PRONOUNCE_GENDERS,
  PRONOUNCE_REGIONS,
  pronounceTtsUrl,
  type PronounceGenderId,
  type PronounceRegionId,
  type PronounceTtsFields,
} from "@/lib/pronounceSite/voices";

const RATE_KEY = "getpronounce-tts-rate";
const GENDER_KEY = "getpronounce-tts-voice";
const REGION_KEY = "getpronounce-tts-region";

export const PRONOUNCE_PLAYBACK_RATES = [0.7, 0.85, 1, 1.25] as const;
export type PronouncePlaybackRate = (typeof PRONOUNCE_PLAYBACK_RATES)[number];

type Ctx = {
  rate: PronouncePlaybackRate;
  setRate: (rate: PronouncePlaybackRate) => void;
  gender: PronounceGenderId;
  setGender: (gender: PronounceGenderId) => void;
  region: PronounceRegionId;
  setRegion: (region: PronounceRegionId) => void;
  activeHighlightKey: string | null;
  setActiveHighlightKey: (key: string | null) => void;
  stopAll: () => void;
  registerActiveAudio: (el: HTMLAudioElement | null) => void;
};

const PlaybackCtx = createContext<Ctx | null>(null);

function readRate(): PronouncePlaybackRate {
  if (typeof window === "undefined") return 1;
  const raw = Number(window.localStorage.getItem(RATE_KEY));
  return (PRONOUNCE_PLAYBACK_RATES as readonly number[]).includes(raw)
    ? (raw as PronouncePlaybackRate)
    : 1;
}

function readGender(): PronounceGenderId {
  if (typeof window === "undefined") return "female";
  const raw = window.localStorage.getItem(GENDER_KEY);
  return raw === "male" || raw === "female" ? raw : "female";
}

function readRegion(): PronounceRegionId {
  if (typeof window === "undefined") return "cn";
  const raw = window.localStorage.getItem(REGION_KEY);
  return raw === "tw" || raw === "hk" || raw === "cn" ? raw : "cn";
}

export function PronouncePlaybackProvider({ children }: { children: ReactNode }) {
  const [rate, setRateState] = useState<PronouncePlaybackRate>(1);
  const [gender, setGenderState] = useState<PronounceGenderId>("female");
  const [region, setRegionState] = useState<PronounceRegionId>("cn");
  const [activeHighlightKey, setActiveHighlightKey] = useState<string | null>(
    null,
  );
  const activeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRateState(readRate());
    setGenderState(readGender());
    setRegionState(readRegion());
  }, []);

  const stopAll = useCallback(() => {
    const el = activeRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    activeRef.current = null;
    setActiveHighlightKey(null);
  }, []);

  const registerActiveAudio = useCallback((el: HTMLAudioElement | null) => {
    if (activeRef.current && activeRef.current !== el) {
      activeRef.current.pause();
      activeRef.current.currentTime = 0;
    }
    activeRef.current = el;
  }, []);

  const setRate = (next: PronouncePlaybackRate) => {
    setRateState(next);
    try {
      window.localStorage.setItem(RATE_KEY, String(next));
    } catch {
      /* ignore */
    }
  };

  const setGender = (next: PronounceGenderId) => {
    setGenderState(next);
    try {
      window.localStorage.setItem(GENDER_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const setRegion = (next: PronounceRegionId) => {
    setRegionState(next);
    try {
      window.localStorage.setItem(REGION_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo(
    () => ({
      rate,
      setRate,
      gender,
      setGender,
      region,
      setRegion,
      activeHighlightKey,
      setActiveHighlightKey,
      stopAll,
      registerActiveAudio,
    }),
    [
      rate,
      gender,
      region,
      activeHighlightKey,
      stopAll,
      registerActiveAudio,
    ],
  );

  return (
    <PlaybackCtx.Provider value={value}>{children}</PlaybackCtx.Provider>
  );
}

export function usePronouncePlayback(): Ctx {
  return (
    useContext(PlaybackCtx) ?? {
      rate: 1,
      setRate: () => {},
      gender: "female",
      setGender: () => {},
      region: "cn",
      setRegion: () => {},
      activeHighlightKey: null,
      setActiveHighlightKey: () => {},
      stopAll: () => {},
      registerActiveAudio: () => {},
    }
  );
}

export function PronounceVoiceToggle() {
  const { gender, setGender } = usePronouncePlayback();
  return (
    <div className="sound-voice" role="group" aria-label="Voice">
      <span className="sound-voice-label">Voice</span>
      {PRONOUNCE_GENDERS.map((g) => (
        <button
          key={g.id}
          type="button"
          className={gender === g.id ? "is-on" : undefined}
          aria-pressed={gender === g.id}
          onClick={() => setGender(g.id)}
        >
          {g.label}
        </button>
      ))}
    </div>
  );
}

export function PronounceRegionToggle() {
  const { region, setRegion } = usePronouncePlayback();
  return (
    <div className="sound-accent" role="group" aria-label="Region">
      <span className="sound-accent-label">Region</span>
      {PRONOUNCE_REGIONS.map((r) => (
        <button
          key={r.id}
          type="button"
          className={region === r.id ? "is-on" : undefined}
          aria-pressed={region === r.id}
          title={r.hint}
          onClick={() => setRegion(r.id)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

export function PronounceSpeedControl() {
  const { rate, setRate } = usePronouncePlayback();
  return (
    <div className="sound-speed" role="group" aria-label="Playback speed">
      <span className="sound-speed-label">Speed</span>
      {PRONOUNCE_PLAYBACK_RATES.map((r) => (
        <button
          key={r}
          type="button"
          className={rate === r ? "is-on" : undefined}
          aria-pressed={rate === r}
          onClick={() => setRate(r)}
        >
          {r === 1 ? "1×" : `${r}×`}
        </button>
      ))}
    </div>
  );
}

export function PronounceTtsButton({
  item,
  label,
}: {
  item: PronounceTtsFields;
  label: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const { rate, gender, region, registerActiveAudio } = usePronouncePlayback();
  const src = pronounceTtsUrl(item, gender, region);

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

type PlaylistItem = PronounceTtsFields & {
  label?: string;
  highlightKey?: string;
};

type PlayTrack = { src: string; highlightKey: string };

async function playSrcAtRate(
  el: HTMLAudioElement,
  src: string,
  rate: number,
): Promise<void> {
  el.src = src;
  el.playbackRate = rate;
  await el.play();
  await new Promise<void>((resolve, reject) => {
    const onEnd = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error("audio error"));
    };
    const cleanup = () => {
      el.removeEventListener("ended", onEnd);
      el.removeEventListener("error", onErr);
    };
    el.addEventListener("ended", onEnd);
    el.addEventListener("error", onErr);
  });
}

/** Play glossary words in order (CN/TW/HK × gender aware). */
export function PronouncePlayAllButton({
  items,
  label = "Play all",
}: {
  items: PlaylistItem[];
  label?: string;
}) {
  const { rate, gender, region, stopAll, registerActiveAudio, setActiveHighlightKey } =
    usePronouncePlayback();
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tracks: PlayTrack[] = items
    .map((it, i) => ({
      src: pronounceTtsUrl(it, gender, region),
      highlightKey: it.highlightKey ?? `w-${i}`,
    }))
    .filter((t): t is PlayTrack => Boolean(t.src));
  if (!tracks.length) return null;

  const run = async () => {
    if (busy) {
      abortRef.current = true;
      stopAll();
      audioRef.current?.pause();
      setBusy(false);
      return;
    }
    abortRef.current = false;
    setBusy(true);
    const el = audioRef.current;
    if (!el) {
      setBusy(false);
      return;
    }
    registerActiveAudio(el);
    try {
      for (const track of tracks) {
        if (abortRef.current) break;
        setActiveHighlightKey(track.highlightKey);
        await playSrcAtRate(el, track.src, rate);
      }
    } catch {
      /* stop quietly */
    } finally {
      setActiveHighlightKey(null);
      registerActiveAudio(null);
      setBusy(false);
    }
  };

  return (
    <span className="sound-playlist">
      <audio ref={audioRef} preload="none" />
      <button
        type="button"
        className={`sound-playlist-btn${busy ? " is-on" : ""}`}
        onClick={() => void run()}
        aria-pressed={busy}
      >
        {busy ? (
          "Stop"
        ) : (
          <>
            {label}
            <span className="sound-playlist-icon" aria-hidden>
              ▶
            </span>
          </>
        )}
      </button>
    </span>
  );
}

/** Slow (0.7×) then normal for one headword. */
export function PronounceSlowNormalButton({
  item,
  label = "Slow → Normal",
}: {
  item: PronounceTtsFields;
  label?: string;
}) {
  const { gender, region, stopAll, registerActiveAudio } = usePronouncePlayback();
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const src = pronounceTtsUrl(item, gender, region);
  if (!src) return null;

  const run = async () => {
    if (busy) {
      abortRef.current = true;
      stopAll();
      audioRef.current?.pause();
      setBusy(false);
      return;
    }
    abortRef.current = false;
    setBusy(true);
    const el = audioRef.current;
    if (!el) {
      setBusy(false);
      return;
    }
    registerActiveAudio(el);
    try {
      if (!abortRef.current) await playSrcAtRate(el, src, 0.7);
      if (!abortRef.current) await playSrcAtRate(el, src, 1);
    } catch {
      /* ignore */
    } finally {
      registerActiveAudio(null);
      setBusy(false);
    }
  };

  return (
    <span className="sound-playlist">
      <audio ref={audioRef} preload="none" />
      <button
        type="button"
        className={`sound-playlist-btn${busy ? " is-on" : ""}`}
        onClick={() => void run()}
        aria-pressed={busy}
        title="Hear slow, then normal speed"
      >
        {busy ? "Stop" : label}
      </button>
    </span>
  );
}

export type AtlasPlayTrack = { src: string; highlightKey: string };

/** Single-voice charts (es/fr/de/…) — speed-aware play-all. */
export function AtlasPlayAllButton({
  tracks,
  label = "Play all",
}: {
  tracks: AtlasPlayTrack[];
  label?: string;
}) {
  const { rate, stopAll, registerActiveAudio, setActiveHighlightKey } =
    usePronouncePlayback();
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playable = tracks
    .map((t) => ({ ...t, src: String(t.src || "").trim() }))
    .filter((t) => t.src);
  if (!playable.length) return null;

  const run = async () => {
    if (busy) {
      abortRef.current = true;
      stopAll();
      audioRef.current?.pause();
      setBusy(false);
      return;
    }
    abortRef.current = false;
    setBusy(true);
    const el = audioRef.current;
    if (!el) {
      setBusy(false);
      return;
    }
    registerActiveAudio(el);
    try {
      for (const track of playable) {
        if (abortRef.current) break;
        setActiveHighlightKey(track.highlightKey);
        await playSrcAtRate(el, track.src, rate);
      }
    } catch {
      /* ignore */
    } finally {
      setActiveHighlightKey(null);
      registerActiveAudio(null);
      setBusy(false);
    }
  };

  return (
    <span className="sound-playlist">
      <audio ref={audioRef} preload="none" />
      <button
        type="button"
        className={`sound-playlist-btn${busy ? " is-on" : ""}`}
        onClick={() => void run()}
        aria-pressed={busy}
      >
        {busy ? (
          "Stop"
        ) : (
          <>
            {label}
            <span className="sound-playlist-icon" aria-hidden>
              ▶
            </span>
          </>
        )}
      </button>
    </span>
  );
}
