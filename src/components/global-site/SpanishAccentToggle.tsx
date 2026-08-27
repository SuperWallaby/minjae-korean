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
  SPANISH_ACCENTS,
  type SpanishAccentId,
} from "@/lib/globalSite/spanishAccents";

const STORAGE_KEY = "getpronounce-es-accent";

type Ctx = {
  accent: SpanishAccentId;
  setAccent: (id: SpanishAccentId) => void;
};

const SpanishAccentContext = createContext<Ctx | null>(null);

function readStored(): SpanishAccentId {
  if (typeof window === "undefined") return "latam";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "es" || raw === "latam") return raw;
  return "latam";
}

export function SpanishAccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<SpanishAccentId>("latam");

  useEffect(() => {
    setAccentState(readStored());
  }, []);

  const setAccent = useCallback((id: SpanishAccentId) => {
    setAccentState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ accent, setAccent }), [accent, setAccent]);
  return (
    <SpanishAccentContext.Provider value={value}>
      {children}
    </SpanishAccentContext.Provider>
  );
}

export function useSpanishAccent(): Ctx {
  const ctx = useContext(SpanishAccentContext);
  if (!ctx) {
    return {
      accent: "latam",
      setAccent: () => {},
    };
  }
  return ctx;
}

export function SpanishAccentToggle({ className }: { className?: string }) {
  const { accent, setAccent } = useSpanishAccent();
  return (
    <div
      className={className || "global-accent-toggle"}
      role="group"
      aria-label="Spanish accent"
    >
      {SPANISH_ACCENTS.map((a) => (
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
