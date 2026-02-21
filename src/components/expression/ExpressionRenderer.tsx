"use client";

import * as React from "react";
import type { ExpressionChapterContent } from "@/data/expressionTypes";

import { ChallengeBlock } from "./ChallengeBlock";
import { CoreFrameCard } from "./CoreFrameCard";
import { QuestionReplyBlock } from "./QuestionReplyBlock";

const PLACEHOLDER = "___";

function slotCountForFrame(korean: string): number {
  const parts = korean.split(PLACEHOLDER);
  return Math.max(0, parts.length - 1);
}

function slotKey(frameIndex: number, slotIndex: number): string {
  return `${frameIndex}-${slotIndex}`;
}

type Props = {
  content: ExpressionChapterContent;
};

export function ExpressionRenderer({ content }: Props) {
  const { coreFrames, quickQuestions, replyPack, challenge } = content;

  const questionReplyPairs = React.useMemo(() => {
    const len = Math.max(quickQuestions.length, replyPack.length);
    return Array.from({ length: len }, (_, i) => ({
      question: quickQuestions[i] ?? "",
      reply: replyPack[i] ?? "",
    }));
  }, [quickQuestions, replyPack]);

  const [slotValues, setSlotValues] = React.useState<Record<string, string>>(
    () => {
      const init: Record<string, string> = {};
      coreFrames.forEach((frame, fi) => {
        const n = slotCountForFrame(frame.korean);
        for (let si = 0; si < n; si++) init[slotKey(fi, si)] = "";
      });
      return init;
    }
  );
  const [activeSlot, setActiveSlot] = React.useState<{
    frameIndex: number;
    slotIndex: number;
  } | null>(null);

  const getSlotValuesForFrame = React.useCallback(
    (frameIndex: number, count: number): string[] => {
      return Array.from({ length: count }, (_, si) =>
        slotValues[slotKey(frameIndex, si)] ?? ""
      );
    },
    [slotValues]
  );

  const onSlotFocus = React.useCallback(
    (frameIndex: number, slotIndex: number) => {
      setActiveSlot({ frameIndex, slotIndex });
    },
    []
  );

  const onSlotChange = React.useCallback(
    (frameIndex: number, slotIndex: number, value: string) => {
      setSlotValues((prev) => ({
        ...prev,
        [slotKey(frameIndex, slotIndex)]: value,
      }));
    },
    []
  );

  const onSwapSelectForFrame = React.useCallback(
    (frameIndex: number, resultText: string) => {
      const slotIdx =
        activeSlot?.frameIndex === frameIndex ? activeSlot.slotIndex : 0;
      setSlotValues((prev) => ({
        ...prev,
        [slotKey(frameIndex, slotIdx)]: resultText,
      }));
    },
    [activeSlot]
  );

  return (
    <div className="space-y-10">
      {/* Core Frames + Swap Words */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Core Frames
        </h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          {coreFrames.map((frame, i) => (
            <CoreFrameCard
              key={i}
              frame={frame}
              index={i}
              slotValues={getSlotValuesForFrame(
                i,
                slotCountForFrame(frame.korean)
              )}
              activeSlot={activeSlot?.frameIndex === i ? activeSlot.slotIndex : null}
              onSlotFocus={onSlotFocus}
              onSlotChange={onSlotChange}
              onSelectSwapResult={
                frame.swapCategories?.length
                  ? (result) => onSwapSelectForFrame(i, result)
                  : undefined
              }
            />
          ))}
        </div>
      </section>

      {/* Questions & Replies - Paired Q&A */}
      {questionReplyPairs.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Questions & Replies
          </h2>
          <QuestionReplyBlock pairs={questionReplyPairs} />
        </section>
      )}

      {/* Challenge */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Challenge!
        </h2>
        <ChallengeBlock challenge={challenge} />
      </section>
    </div>
  );
}
