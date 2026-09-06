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
import { AccentChoiceBar } from "@/components/listen/AccentChoiceBar";
import {
  FRENCH_ACCENTS,
  type FrenchAccentId,
} from "@/lib/globalSite/frenchAccents";

const STORAGE_KEY = "getpronounce-fr-accent";

type Ctx = {
  accent: FrenchAccentId;
  setAccent: (id: FrenchAccentId) => void;
};

const FrenchAccentContext = createContext<Ctx | null>(null);

function readStored(): FrenchAccentId {
  if (typeof window === "undefined") return "fr";
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (raw === "ca" || raw === "fr") return raw;
  return "fr";
}

export function FrenchAccentProvider({ children }: { children: ReactNode }) {
  const [accent, setAccentState] = useState<FrenchAccentId>("fr");

  useEffect(() => {
    setAccentState(readStored());
  }, []);

  const setAccent = useCallback((id: FrenchAccentId) => {
    setAccentState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ accent, setAccent }), [accent, setAccent]);
  return (
    <FrenchAccentContext.Provider value={value}>
      {children}
    </FrenchAccentContext.Provider>
  );
}

export function useFrenchAccent(): Ctx {
  const ctx = useContext(FrenchAccentContext);
  if (!ctx) {
    return {
      accent: "fr",
      setAccent: () => {},
    };
  }
  return ctx;
}

export function FrenchAccentToggle({ className }: { className?: string }) {
  const { accent, setAccent } = useFrenchAccent();
  return (
    <AccentChoiceBar
      className={className}
      value={accent}
      onChange={setAccent}
      options={FRENCH_ACCENTS}
    />
  );
}
