"use client";

import * as React from "react";

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
      document.documentElement.style.fontSize = "20px";
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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <EducationModeContext.Provider value={{ enabled, toggle }}>
      {children}
    </EducationModeContext.Provider>
  );
}
