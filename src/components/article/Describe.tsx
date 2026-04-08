"use client";

import * as React from "react";
import { BookOpenText, ChevronDown, X } from "lucide-react";

type DescribeResult = {
  translation: string;
  explanation: string;
  vocabulary: Array<{ word: string; meaning: string }>;
};

type Props = {
  children: React.ReactNode;
  className?: string;
  /** Called once when user opens the describe panel (click to see meaning). Use to hide "Click to see meaning" hint per device. */
  onReveal?: () => void;
  /** `"text"`: click Korean text (default). `"icon"`: separate interpretation button next to text (e.g. news articles). */
  interpretationTrigger?: "text" | "icon";
};

function ToggleSection({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <span className="block w-full border-t border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-3 text-left text-base font-normal text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 text-[hsl(var(--border))] transition-transform ${open ? "rotate-180" : ""}`}
        />
        <span>{label}</span>
      </button>
      {open && <span className="block w-full px-4 pb-4 pl-10">{children}</span>}
    </span>
  );
}

export function Describe({
  children,
  className = "",
  onReveal,
  interpretationTrigger = "text",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<DescribeResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showVocabulary, setShowVocabulary] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);
  const textRef = React.useRef<HTMLSpanElement>(null);
  const onRevealRef = React.useRef(onReveal);
  onRevealRef.current = onReveal;

  const handleClick = async () => {
    if (open) {
      setOpen(false);
      return;
    }

    const text = textRef.current?.textContent?.trim();
    if (!text) return;

    setOpen(true);
    onRevealRef.current?.();

    if (result) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? "Failed to get description");
      }
      setResult(json.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get description",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
  };

  const openFromIcon = (e: React.MouseEvent) => {
    e.stopPropagation();
    void handleClick();
  };

  const textInteractive =
    interpretationTrigger === "text"
      ? "inline-block cursor-pointer rounded-sm px-0.5 -mx-0.5 transition-[colors,box-shadow] duration-200 hover:bg-muted/50 hover:shadow-[0_0_0_4px_#2c2a2526]"
      : "inline";

  const textOpenHighlight =
    interpretationTrigger === "text" && open
      ? "bg-muted/55 shadow-[0_0_0_6px_#2c2a2533]"
      : "";

  const formatExplanation = (text: string) => {
    return text.split(/\n\n+/).map((paragraph, i) => (
      <span key={i} className="block mb-3 last:mb-0">
        {paragraph.split(/\n/).map((line, j) => (
          <span key={j} className="block">
            {line}
          </span>
        ))}
      </span>
    ));
  };

  return (
    <span className={`group ${className}`}>
      {interpretationTrigger === "icon" ? (
        <span className="inline-flex max-w-full flex-wrap items-baseline gap-1.5 align-middle">
          <span
            ref={textRef}
            className={`${textInteractive} ${textOpenHighlight}`}
          >
            {children}
          </span>
          <button
            type="button"
            onClick={openFromIcon}
            className={`inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-transparent bg-transparent text-muted-foreground/38 transition hover:border-border/45 hover:bg-muted/20 hover:text-muted-foreground/62 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${open ? "border-border/50 text-muted-foreground/68 bg-muted/25" : ""}`}
            aria-label="Translation and explanation"
            title="Translation and explanation"
          >
            <BookOpenText className="h-4 w-4" aria-hidden />
          </button>
        </span>
      ) : (
        <span
          ref={textRef}
          onClick={handleClick}
          className={`${textInteractive} ${textOpenHighlight}`}
        >
          {children}
        </span>
      )}
      {open && (
        <span className="relative z-20 my-3 block w-full overflow-hidden rounded-lg border border-border bg-card">
          {loading && (
            <span className="block px-4 py-4 text-base font-normal text-muted-foreground animate-pulse">
              Analyzing...
            </span>
          )}
          {error && (
            <span className="block px-4 py-4 text-base font-normal text-rose-600">
              {error}
            </span>
          )}
          {result && (
            <>
              {/* 1단계: 번역 + X 버튼 */}
              <span className="flex items-center gap-2 px-4 py-4">
                <span className="flex-1 text-base font-normal text-foreground leading-relaxed">
                  {result.translation}
                </span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="shrink-0 cursor-pointer p-1.5 rounded text-[hsl(var(--border))] hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </span>

              {/* 2단계: 단어 - 토글 */}
              {result.vocabulary.length > 0 && (
                <ToggleSection
                  label={`Words (${result.vocabulary.length})`}
                  open={showVocabulary}
                  onToggle={() => setShowVocabulary((v) => !v)}
                >
                  <span className="block space-y-1.5">
                    {result.vocabulary.map((v, i) => (
                      <span key={i} className="block text-base font-normal">
                        <span className="text-foreground">{v.word}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          — {v.meaning}
                        </span>
                      </span>
                    ))}
                  </span>
                </ToggleSection>
              )}

              {/* 3단계: 해설 - 토글 */}
              {result.explanation && (
                <ToggleSection
                  label="Explanation"
                  open={showExplanation}
                  onToggle={() => setShowExplanation((v) => !v)}
                >
                  <span className="block w-full text-base font-normal text-foreground/80 leading-7">
                    {formatExplanation(result.explanation)}
                  </span>
                </ToggleSection>
              )}
            </>
          )}
        </span>
      )}
    </span>
  );
}
