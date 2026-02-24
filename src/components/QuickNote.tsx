"use client";

import * as React from "react";

const DURATION_MS = 200;

const QUICKNOTE_FONT_STEP_KEY = "quicknote-font-step";
const FONT_STEPS = [24, 32, 40, 48, 56, 64, 72] as const;
const DEFAULT_FONT_STEP_INDEX = 3; // 48px ≈ text-5xl

function getStoredFontStep(): number {
  if (typeof window === "undefined") return DEFAULT_FONT_STEP_INDEX;
  const raw = window.localStorage.getItem(QUICKNOTE_FONT_STEP_KEY);
  const n = parseInt(raw ?? "", 10);
  if (!Number.isFinite(n) || n < 0 || n >= FONT_STEPS.length) return DEFAULT_FONT_STEP_INDEX;
  return n;
}

export function QuickNote() {
  const [open, setOpen] = React.useState(false);
  const [closing, setClosing] = React.useState(false);
  const [entered, setEntered] = React.useState(false);
  const [text, setText] = React.useState("");
  const [fontStepIndex, setFontStepIndex] = React.useState(DEFAULT_FONT_STEP_INDEX);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    setFontStepIndex(getStoredFontStep());
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === ".") {
        e.preventDefault();
        if (open) {
          setClosing(true);
        } else {
          setOpen(true);
          setEntered(false);
        }
      }
      if (e.key === "Escape" && open && !closing) {
        setClosing(true);
      }

      if (open && !closing && e.shiftKey && (e.metaKey || e.ctrlKey)) {
        if (e.key === "]") {
          e.preventDefault();
          setFontStepIndex((i) => {
            const next = Math.min(FONT_STEPS.length - 1, i + 1);
            if (typeof window !== "undefined") window.localStorage.setItem(QUICKNOTE_FONT_STEP_KEY, String(next));
            return next;
          });
        } else if (e.key === "[") {
          e.preventDefault();
          setFontStepIndex((i) => {
            const next = Math.max(0, i - 1);
            if (typeof window !== "undefined") window.localStorage.setItem(QUICKNOTE_FONT_STEP_KEY, String(next));
            return next;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, closing]);

  React.useEffect(() => {
    if (open && !closing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open, closing]);

  // Enter: after mount, go from opacity 0 → 1
  React.useEffect(() => {
    if (!open || closing) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
    return () => cancelAnimationFrame(t);
  }, [open, closing]);

  // Exit: after fade-out, unmount
  React.useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setEntered(false);
    }, DURATION_MS);
    return () => clearTimeout(t);
  }, [closing]);

  const opacity = closing ? 0 : entered ? 1 : 0;

  const canDecrease = fontStepIndex > 0;
  const canIncrease = fontStepIndex < FONT_STEPS.length - 1;

  const decreaseFont = () => {
    if (!canDecrease) return;
    const next = fontStepIndex - 1;
    setFontStepIndex(next);
    if (typeof window !== "undefined") window.localStorage.setItem(QUICKNOTE_FONT_STEP_KEY, String(next));
  };

  const increaseFont = () => {
    if (!canIncrease) return;
    const next = fontStepIndex + 1;
    setFontStepIndex(next);
    if (typeof window !== "undefined") window.localStorage.setItem(QUICKNOTE_FONT_STEP_KEY, String(next));
  };

  if (!open && !closing) return null;

  return (
    <div
      className="fixed inset-0 z-9999 bg-background/95 backdrop-blur-sm invisible-scrollbar overflow-auto transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden={!open}
    >
      <div className="sticky top-0 z-10 flex items-center justify-end gap-2 px-4 py-2 bg-background/80 border-b border-border">
        <button
          type="button"
          onClick={decreaseFont}
          disabled={!canDecrease}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          줄이기
        </button>
        <button
          type="button"
          onClick={increaseFont}
          disabled={!canIncrease}
          className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-40 disabled:pointer-events-none"
        >
          키우기
        </button>
      </div>
      <div className="max-w-4xl mx-auto px-8 min-h-screen">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ fontSize: `${FONT_STEPS[fontStepIndex]}px` }}
          className="w-full min-h-screen bg-transparent font-medium !leading-[1.4] resize-none outline-none font-sans"
          spellCheck={false}
        />
      </div>
    </div>
  );
}
