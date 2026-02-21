"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import type { SongChunk } from "@/lib/songsRepo";

type Props = {
  chunk: SongChunk;
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
    <div className="border-t border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center gap-1.5 px-4 py-3 text-left text-sm font-normal text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-colors"
      >
        <ChevronDown
          className={`h-4 w-4 text-[hsl(var(--border))] transition-transform ${open ? "rotate-180" : ""}`}
        />
        <span>{label}</span>
      </button>
      {open && <div className="px-4 pb-4 pl-10">{children}</div>}
    </div>
  );
}

export function SongChunkCard({ chunk }: Props) {
  const [open, setOpen] = React.useState(false);
  const [showExplanation, setShowExplanation] = React.useState(false);
  const [showVocab, setShowVocab] = React.useState(false);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    setShowExplanation(false);
    setShowVocab(false);
  };

  const lines = chunk.text.split("\n");

  return (
    <div className="group">
      <div
        onClick={() => setOpen((v) => !v)}
        className={`cursor-pointer rounded-lg px-4 py-3 transition-all duration-200 hover:shadow-[0_0_0_4px_rgba(74,156,134,0.15)] ${open ? "shadow-[0_0_0_6px_rgba(74,156,134,0.18)]" : ""}`}
      >
        <div className="text-lg leading-relaxed whitespace-pre-line">
          {lines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-muted/20 overflow-hidden">
          {/* Translation - always visible */}
          <div className="flex items-start gap-2 px-4 py-4">
            <div className="flex-1 text-base font-normal text-foreground leading-relaxed">
              {chunk.aid.translation}
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="shrink-0 cursor-pointer p-1.5 rounded text-[hsl(var(--border))] hover:text-muted-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Vocabulary - toggle */}
          {chunk.aid.vocab.length > 0 && (
            <ToggleSection
              label={`Words (${chunk.aid.vocab.length})`}
              open={showVocab}
              onToggle={() => setShowVocab((v) => !v)}
            >
              <div className="space-y-2">
                {chunk.aid.vocab.map((v, i) => (
                  <div key={i} className="text-sm font-normal">
                    <span className="text-foreground font-medium">{v.word}</span>
                    <span className="text-muted-foreground"> — {v.meaning}</span>
                    {v.note && (
                      <span className="text-muted-foreground/70 text-xs ml-2">
                        ({v.note})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ToggleSection>
          )}

          {/* Explanation - toggle */}
          {chunk.aid.explanation && (
            <ToggleSection
              label="Explanation"
              open={showExplanation}
              onToggle={() => setShowExplanation((v) => !v)}
            >
              <div className="text-sm font-normal text-foreground/80 leading-7 whitespace-pre-line">
                {chunk.aid.explanation}
              </div>
            </ToggleSection>
          )}
        </div>
      )}
    </div>
  );
}
