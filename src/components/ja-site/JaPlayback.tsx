"use client";

import * as React from "react";

export const JA_PLAYBACK_RATES = [0.7, 0.85, 1, 1.25] as const;

type Ctx = {
  rate: number;
  setRate: (n: number) => void;
};

const Ctx = React.createContext<Ctx | null>(null);

export function JaPlaybackProvider({ children }: { children: React.ReactNode }) {
  const [rate, setRateState] = React.useState(1);

  const setRate = React.useCallback((n: number) => {
    setRateState(n);
    try {
      window.localStorage.setItem("eigopin-tts-rate", String(n));
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo(() => ({ rate, setRate }), [rate, setRate]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useJaPlaybackRate(): number {
  return React.useContext(Ctx)?.rate ?? 1;
}

export function JaSpeedControl() {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;

  return (
    <div className="ja-speed" role="group" aria-label="再生速度">
      <span className="ja-speed-label">速度</span>
      {JA_PLAYBACK_RATES.map((r) => (
        <button
          key={r}
          type="button"
          className={ctx.rate === r ? "is-on" : undefined}
          aria-pressed={ctx.rate === r}
          onClick={() => ctx.setRate(r)}
        >
          {r === 1 ? "1×" : `${r}×`}
        </button>
      ))}
    </div>
  );
}
