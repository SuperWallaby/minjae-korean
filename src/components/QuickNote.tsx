"use client";

import * as React from "react";
import { HelpCircle } from "lucide-react";

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

  const [promptMode, setPromptMode] = React.useState(false);
  const [helpPrompt, setHelpPrompt] = React.useState("");
  const [helpResponse, setHelpResponse] = React.useState<string | null>(null);
  const [helpLoading, setHelpLoading] = React.useState(false);
  const [helpError, setHelpError] = React.useState<string | null>(null);

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

  const askGemini = React.useCallback(async () => {
    const q = helpPrompt.trim();
    if (!q || helpLoading) return;
    setHelpLoading(true);
    setHelpError(null);
    setHelpResponse(null);
    try {
      const res = await fetch("/api/public/gemini-ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.ok) {
        setHelpError(json?.error ?? "Request failed");
        return;
      }
      setHelpResponse(json.text ?? "");
    } catch {
      setHelpError("Network error");
    } finally {
      setHelpLoading(false);
    }
  }, [helpPrompt, helpLoading]);

  if (!open && !closing) return null;

  return (
    <div
      className="fixed inset-0 z-9999 bg-background/95 backdrop-blur-sm invisible-scrollbar overflow-auto transition-opacity duration-200"
      style={{ opacity }}
      aria-hidden={!open}
    >
      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 px-4 py-2 bg-background/80 border-b border-border">
        <div className="flex items-center gap-2">
          {promptMode ? (
            <button
              type="button"
              onClick={() => {
                setPromptMode(false);
                setHelpResponse(null);
                setHelpError(null);
              }}
              className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
            >
              ← 메모
            </button>
          ) : null}
          {promptMode ? (
            <span className="text-sm text-muted-foreground">Gemini에게 물어보기</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setPromptMode(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                <HelpCircle className="size-4" />
                Help
              </button>
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
            </>
          )}
        </div>
      </div>

      {promptMode ? (
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex flex-col gap-3">
            <textarea
              value={helpPrompt}
              onChange={(e) => setHelpPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  void askGemini();
                }
              }}
              placeholder="질문을 입력하세요… (Ctrl+Enter로 전송)"
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              disabled={helpLoading}
            />
            <button
              type="button"
              onClick={() => void askGemini()}
              disabled={helpLoading || !helpPrompt.trim()}
              className="self-end rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
            >
              {helpLoading ? "응답 중…" : "보내기"}
            </button>
          </div>
          {helpError ? (
            <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {helpError}
            </div>
          ) : null}
          {helpResponse ? (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 px-4 py-4 text-sm leading-relaxed whitespace-pre-wrap">
              {helpResponse}
            </div>
          ) : null}
        </div>
      ) : (
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
      )}
    </div>
  );
}
