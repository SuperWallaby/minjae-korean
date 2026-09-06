"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  VOCAB_SEO_VOICE_CONTROLLER_IDS,
} from "@/lib/vocabInfographic/voiceControllerIds";

export { VOCAB_SEO_VOICE_CONTROLLER_IDS };

export const VOCAB_SEO_PLAYBACK_RATES = [0.7, 0.85, 1, 1.25] as const;
export type VocabSeoPlaybackRate = (typeof VOCAB_SEO_PLAYBACK_RATES)[number];
export type VocabSeoVoiceGender = "female" | "male";

const RATE_KEY = "kaja-vocab-tts-rate";
const GENDER_KEY = "kaja-vocab-tts-gender";

type Ctx = {
  rate: VocabSeoPlaybackRate;
  setRate: (rate: VocabSeoPlaybackRate) => void;
  gender: VocabSeoVoiceGender;
  setGender: (gender: VocabSeoVoiceGender) => void;
  /** True when this page has at least one male clip */
  maleAvailable: boolean;
};

const PlaybackCtx = createContext<Ctx | null>(null);

function readRate(): VocabSeoPlaybackRate {
  if (typeof window === "undefined") return 1;
  const raw = Number(window.localStorage.getItem(RATE_KEY));
  return (VOCAB_SEO_PLAYBACK_RATES as readonly number[]).includes(raw)
    ? (raw as VocabSeoPlaybackRate)
    : 1;
}

function readGender(): VocabSeoVoiceGender {
  if (typeof window === "undefined") return "female";
  const raw = window.localStorage.getItem(GENDER_KEY);
  return raw === "male" || raw === "female" ? raw : "female";
}

export function VocabSeoPlaybackProvider({
  children,
  maleAvailable = false,
}: {
  children: ReactNode;
  maleAvailable?: boolean;
}) {
  const [rate, setRateState] = useState<VocabSeoPlaybackRate>(1);
  const [gender, setGenderState] = useState<VocabSeoVoiceGender>("female");

  useEffect(() => {
    setRateState(readRate());
    setGenderState(readGender());
  }, []);

  const setRate = useCallback((next: VocabSeoPlaybackRate) => {
    setRateState(next);
    try {
      window.localStorage.setItem(RATE_KEY, String(next));
    } catch {
      /* ignore */
    }
  }, []);

  const setGender = useCallback((next: VocabSeoVoiceGender) => {
    setGenderState(next);
    try {
      window.localStorage.setItem(GENDER_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(
    () => ({
      rate,
      setRate,
      gender: maleAvailable ? gender : "female",
      setGender,
      maleAvailable,
    }),
    [rate, setRate, gender, setGender, maleAvailable],
  );

  return (
    <PlaybackCtx.Provider value={value}>{children}</PlaybackCtx.Provider>
  );
}

export function useVocabSeoPlayback(): Ctx {
  const ctx = useContext(PlaybackCtx);
  if (!ctx) {
    return {
      rate: 1,
      setRate: () => {},
      gender: "female",
      setGender: () => {},
      maleAvailable: false,
    };
  }
  return ctx;
}

/** Speed + optional male/female — for recently enriched pin pages. */
export function VocabSeoVoiceControls({ className }: { className?: string }) {
  const { rate, setRate, gender, setGender, maleAvailable } =
    useVocabSeoPlayback();

  return (
    <div
      className={
        className ||
        "flex flex-wrap items-center gap-3 rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Playback speed">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
          Speed
        </span>
        {VOCAB_SEO_PLAYBACK_RATES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={rate === r}
            onClick={() => setRate(r)}
            className={
              rate === r
                ? "rounded-full bg-[var(--quiz-primary)] px-2.5 py-1 text-xs font-semibold text-white"
                : "rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--quiz-text-sub)] transition hover:bg-[var(--quiz-canvas)]"
            }
          >
            {r === 1 ? "1×" : `${r}×`}
          </button>
        ))}
      </div>
      {maleAvailable ? (
        <div
          className="flex flex-wrap items-center gap-1.5"
          role="group"
          aria-label="Voice"
        >
          <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
            Voice
          </span>
          {(
            [
              ["female", "Female"],
              ["male", "Male"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={gender === id}
              onClick={() => setGender(id)}
              className={
                gender === id
                  ? "rounded-full bg-[var(--quiz-primary)] px-2.5 py-1 text-xs font-semibold text-white"
                  : "rounded-full border border-[var(--quiz-border)] bg-[var(--quiz-surface-muted)] px-2.5 py-1 text-xs font-medium text-[var(--quiz-text-sub)] transition hover:bg-[var(--quiz-canvas)]"
              }
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
