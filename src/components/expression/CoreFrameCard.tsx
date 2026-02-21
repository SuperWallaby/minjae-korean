"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { Describe } from "@/components/article/Describe";
import type { CoreFrame } from "@/data/expressionTypes";

import { SwapChips } from "./SwapChips";

type Props = {
  frame: CoreFrame;
  index: number;
  slotValues: string[];
  activeSlot: number | null;
  onSlotFocus: (frameIndex: number, slotIndex: number) => void;
  onSlotChange: (frameIndex: number, slotIndex: number, value: string) => void;
  onSelectSwapResult?: (result: string) => void;
};

const PLACEHOLDER = "___";

function badgeClassByNumber(n: number): string {
  if (n === 0) return "bg-included-1 text-badge-muted-foreground";
  if (n <= 9) return "bg-included-2 text-foreground";
  if (n <= 18) return "bg-included-3 text-foreground";
  if (n <= 27) return "bg-[var(--level-4-bg)] text-foreground";
  return "bg-[var(--level-5-bg)] text-foreground";
}

function parseWithSlots(text: string): string[] {
  return text.split(PLACEHOLDER);
}

export function CoreFrameCard({
  frame,
  index,
  slotValues,
  onSlotFocus,
  onSlotChange,
  onSelectSwapResult,
}: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const num = index + 1;
  const parts = parseWithSlots(frame.korean);
  const slotCount = Math.max(0, parts.length - 1);
  const slotRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  React.useEffect(() => {
    slotValues.forEach((value, i) => {
      const el = slotRefs.current[i];
      if (el) {
        const next = value ?? "";
        if (el.textContent !== next) {
          el.textContent = next;
        }
      }
    });
  }, [slotValues]);

  const handleSlotInput = (i: number) => {
    const el = slotRefs.current[i];
    if (el) onSlotChange(index, i, el.textContent ?? "");
  };

  const hasSlots = slotCount > 0;

  return (
    <div className="border-b border-border last:border-b-0">
      <div className="flex w-full items-center justify-between gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
        <div
          className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
          onClick={() => setExpanded((v) => !v)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded((v) => !v);
            }
          }}
        >
          <span
            className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${badgeClassByNumber(num)}`}
            aria-hidden
          >
            {num}
          </span>
          <span className="text-base font-medium text-foreground inline-flex flex-wrap items-baseline gap-0.5">
            {hasSlots
              ? parts.map((part, i) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < parts.length - 1 ? (
                      <span
                        ref={(el) => {
                          slotRefs.current[i] = el;
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onFocus={() => onSlotFocus(index, i)}
                        onInput={() => handleSlotInput(i)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                        data-placeholder="..."
                        className="inline-block min-w-[4ch] max-w-[12ch] cursor-text border-b border-border px-1.5 pb-0.5 text-base font-medium text-foreground outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/50"
                      />
                    ) : null}
                  </React.Fragment>
                ))
              : frame.korean}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 p-1 -m-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          aria-expanded={expanded}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>
      {expanded && (
        <div className="px-4 pb-4 pl-10 space-y-3">
          <p className="text-base text-muted-foreground">{frame.english}</p>
          {frame.examples.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground/70">ex.</p>
              {frame.examples.map((ex, i) => (
                <p key={i} className="text-base text-foreground">
                  <Describe>{ex}</Describe>
                </p>
              ))}
            </div>
          )}
          {frame.swapCategories != null && frame.swapCategories.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-muted-foreground/70 mb-2">
                Swap Words
              </p>
              <SwapChips
                categories={frame.swapCategories}
                onSelectResult={onSelectSwapResult}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
