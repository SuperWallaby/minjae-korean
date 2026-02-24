"use client";

import * as React from "react";

const EDUCATION_FONT_STEPS = [16, 18, 20, 22, 24, 26, 28] as const;
const EDUCATION_FONT_STEP_KEY = "education-mode-font-step";
const DEFAULT_FONT_STEP_INDEX = 2; // 20px

function getStoredFontStep(): number {
  if (typeof window === "undefined") return DEFAULT_FONT_STEP_INDEX;
  const raw = window.localStorage.getItem(EDUCATION_FONT_STEP_KEY);
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 0 || n >= EDUCATION_FONT_STEPS.length) {
    return DEFAULT_FONT_STEP_INDEX;
  }
  return n;
}

function applyFontStep(stepIndex: number) {
  document.documentElement.style.fontSize = `${EDUCATION_FONT_STEPS[stepIndex]}px`;
}

type EducationModeContextType = {
  enabled: boolean;
  toggle: () => void;
};

const EducationModeContext = React.createContext<EducationModeContextType>({
  enabled: false,
  toggle: () => {},
});

export function useEducationMode() {
  return React.useContext(EducationModeContext);
}

export function EducationModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(false);

  const toggle = React.useCallback(() => {
    setEnabled((v) => !v);
  }, []);

  React.useEffect(() => {
    (window as unknown as { enableEducationMode: () => void }).enableEducationMode = () => {
      setEnabled(true);
      console.log("🎓 Education mode enabled");
    };
    (window as unknown as { disableEducationMode: () => void }).disableEducationMode = () => {
      setEnabled(false);
      console.log("🎓 Education mode disabled");
    };
    (window as unknown as { toggleEducationMode: () => void }).toggleEducationMode = () => {
      setEnabled((v) => {
        console.log(`🎓 Education mode ${!v ? "enabled" : "disabled"}`);
        return !v;
      });
    };
  }, []);

  React.useEffect(() => {
    if (enabled) {
      const step = getStoredFontStep();
      applyFontStep(step);
      document.body.classList.add("education-mode");
    } else {
      document.documentElement.style.fontSize = "";
      document.body.classList.remove("education-mode");
    }
  }, [enabled]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "e") {
        e.preventDefault();
        setEnabled((v) => {
          console.log(`🎓 Education mode ${!v ? "enabled" : "disabled"}`);
          return !v;
        });
        return;
      }

      if (!enabled) return;
      if (!e.shiftKey || (!e.metaKey && !e.ctrlKey)) return;

      const key = e.key.toLowerCase();
      if (key === "r") {
        e.preventDefault();
        const step = Math.min(
          EDUCATION_FONT_STEPS.length - 1,
          getStoredFontStep() + 1,
        );
        window.localStorage.setItem(EDUCATION_FONT_STEP_KEY, String(step));
        applyFontStep(step);
      } else if (key === "q") {
        e.preventDefault();
        const step = Math.max(0, getStoredFontStep() - 1);
        window.localStorage.setItem(EDUCATION_FONT_STEP_KEY, String(step));
        applyFontStep(step);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);

  return (
    <EducationModeContext.Provider value={{ enabled, toggle }}>
      {children}
    </EducationModeContext.Provider>
  );
}
