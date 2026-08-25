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
  SOUND_ACCENTS,
  SOUND_GENDERS,
  soundTtsUrl,
  type SoundAccentId,
  type SoundGenderId,
  type SoundTtsFields,
} from "@/lib/soundSite/voices";

const RATE_KEY = "eigosound-tts-rate";
const GENDER_KEY = "eigosound-tts-voice";
const ACCENT_KEY = "eigosound-tts-accent";

export const SOUND_PLAYBACK_RATES = [0.7, 0.85, 1, 1.25] as const;
export type SoundPlaybackRate = (typeof SOUND_PLAYBACK_RATES)[number];

type Ctx = {
  rate: SoundPlaybackRate;
  setRate: (rate: SoundPlaybackRate) => void;
  gender: SoundGenderId;
  setGender: (gender: SoundGenderId) => void;
  /** @deprecated use gender */
  voice: SoundGenderId;
  /** @deprecated use setGender */
  setVoice: (voice: SoundGenderId) => void;
  accent: SoundAccentId;
  setAccent: (accent: SoundAccentId) => void;
  /** Stop any in-flight playlist / single play */
  stopAll: () => void;
  registerActiveAudio: (el: HTMLAudioElement | null) => void;
};

const PlaybackCtx = createContext<Ctx | null>(null);

function readRate(): SoundPlaybackRate {
  if (typeof window === "undefined") return 1;
  const raw = Number(window.localStorage.getItem(RATE_KEY));
  return (SOUND_PLAYBACK_RATES as readonly number[]).includes(raw)
    ? (raw as SoundPlaybackRate)
    : 1;
}

function readGender(): SoundGenderId {
  if (typeof window === "undefined") return "female";
  const raw = window.localStorage.getItem(GENDER_KEY);
  return raw === "male" || raw === "female" ? raw : "female";
}

function readAccent(): SoundAccentId {
  if (typeof window === "undefined") return "us";
  const raw = window.localStorage.getItem(ACCENT_KEY);
  return raw === "uk" || raw === "au" || raw === "us" ? raw : "us";
}

export function SoundPlaybackProvider({ children }: { children: ReactNode }) {
  const [rate, setRateState] = useState<SoundPlaybackRate>(1);
  const [gender, setGenderState] = useState<SoundGenderId>("female");
  const [accent, setAccentState] = useState<SoundAccentId>("us");
  const activeRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRateState(readRate());
    setGenderState(readGender());
    setAccentState(readAccent());
  }, []);

  const stopAll = useCallback(() => {
    const el = activeRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    activeRef.current = null;
  }, []);

  const registerActiveAudio = useCallback((el: HTMLAudioElement | null) => {
    if (activeRef.current && activeRef.current !== el) {
      activeRef.current.pause();
      activeRef.current.currentTime = 0;
    }
    activeRef.current = el;
  }, []);

  const setRate = (next: SoundPlaybackRate) => {
    setRateState(next);
    try {
      window.localStorage.setItem(RATE_KEY, String(next));
    } catch {
      /* ignore */
    }
  };

  const setGender = (next: SoundGenderId) => {
    setGenderState(next);
    try {
      window.localStorage.setItem(GENDER_KEY, next);
    } catch {
      /* ignore */
    }
  };

  const setAccent = (next: SoundAccentId) => {
    setAccentState(next);
    try {
      window.localStorage.setItem(ACCENT_KEY, next);
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
      voice: gender,
      setVoice: setGender,
      accent,
      setAccent,
      stopAll,
      registerActiveAudio,
    }),
    [rate, gender, accent, stopAll, registerActiveAudio],
  );

  return (
    <PlaybackCtx.Provider value={value}>{children}</PlaybackCtx.Provider>
  );
}

export function useSoundPlayback(): Ctx {
  return (
    useContext(PlaybackCtx) ?? {
      rate: 1,
      setRate: () => {},
      gender: "female" as SoundGenderId,
      setGender: () => {},
      voice: "female" as SoundGenderId,
      setVoice: () => {},
      accent: "us" as SoundAccentId,
      setAccent: () => {},
      stopAll: () => {},
      registerActiveAudio: () => {},
    }
  );
}

export function SoundVoiceToggle() {
  const { gender, setGender } = useSoundPlayback();
  return (
    <div className="sound-voice" role="group" aria-label="Voice">
      <span className="sound-voice-label">Voice</span>
      {SOUND_GENDERS.map((g) => (
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

export function SoundAccentToggle() {
  const { accent, setAccent } = useSoundPlayback();
  return (
    <div className="sound-accent" role="group" aria-label="Accent">
      <span className="sound-accent-label">Accent</span>
      {SOUND_ACCENTS.map((a) => (
        <button
          key={a.id}
          type="button"
          className={accent === a.id ? "is-on" : undefined}
          aria-pressed={accent === a.id}
          title={a.hint}
          onClick={() => setAccent(a.id)}
        >
          {a.label}
        </button>
      ))}
    </div>
  );
}

export function SoundSpeedControl() {
  const { rate, setRate } = useSoundPlayback();
  return (
    <div className="sound-speed" role="group" aria-label="Playback speed">
      <span className="sound-speed-label">Speed</span>
      {SOUND_PLAYBACK_RATES.map((r) => (
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

type PlaylistItem = SoundTtsFields & { label?: string };

async function playSrc(
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

/** Play every item in order at the current voice/accent/speed. */
export function SoundPlayAllButton({
  items,
  label = "Play all",
}: {
  items: PlaylistItem[];
  label?: string;
}) {
  const { rate, gender, accent, stopAll, registerActiveAudio } =
    useSoundPlayback();
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const urls = items
    .map((it) => soundTtsUrl(it, gender, accent))
    .filter(Boolean);
  if (!urls.length) return null;

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
      for (const src of urls) {
        if (abortRef.current) break;
        await playSrc(el, src, rate);
      }
    } catch {
      /* stop quietly */
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
      >
        {busy ? "Stop" : label}
      </button>
    </span>
  );
}

/** Play current selection slow (0.7×) then normal (1×). */
export function SoundSlowNormalButton({
  item,
  label = "Slow → Normal",
}: {
  item: SoundTtsFields;
  label?: string;
}) {
  const { gender, accent, stopAll, registerActiveAudio } = useSoundPlayback();
  const [busy, setBusy] = useState(false);
  const abortRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const src = soundTtsUrl(item, gender, accent);
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
      if (!abortRef.current) await playSrc(el, src, 0.7);
      if (!abortRef.current) await playSrc(el, src, 1);
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
