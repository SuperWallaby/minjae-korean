"use client";

import { useState } from "react";
import type { AttemptGrading } from "@/types/exam";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  grading: AttemptGrading;
  onRetry?: () => void;
  backHref?: string;
  onSelectItem?: (itemId: string) => void;
  selectedItemId?: string | null;
  /** Explain 클릭 시 해당 문항 행 바로 아래에 렌더할 내용 */
  renderExplanation?: (itemId: string) => React.ReactNode;
};

export function ExamResult({
  grading,
  onRetry,
  backHref = "/exams",
  onSelectItem,
  selectedItemId,
  renderExplanation,
}: Props) {
  const { percent, earnedPoints, totalPoints, placement, byItem } = grading;
  const [explainedItemId, setExplainedItemId] = useState<string | null>(null);

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <h2 className="font-serif text-xl font-semibold">Result</h2>
      <div className="flex flex-wrap items-baseline gap-4">
        <span className="text-3xl font-bold tabular-nums">{percent}%</span>
        <span className="text-muted-foreground">
          {earnedPoints} / {totalPoints} points
        </span>
      </div>
      {placement && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-primary">
            Recommended level <br></br>
            <b className="text-primary text-3xl">{placement.level}</b>
          </p>
          {placement.rationale && (
            <p className="mt-1 text-xs text-muted-foreground">
              {placement.rationale}
            </p>
          )}
        </div>
      )}
      {byItem && Object.keys(byItem).length > 0 && (
        <div className="border-t border-border pt-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            By question
          </p>
          <ul className="space-y-1 text-sm">
            {Object.entries(byItem).map(([itemId, r], idx) => {
              const isSelected = selectedItemId === itemId;
              const showExplain = explainedItemId === itemId;
              return (
                <li key={itemId} className="flex flex-col gap-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectItem?.(itemId)}
                      className={`flex-1 flex items-center gap-2 rounded px-1 py-0.5 text-left hover:bg-muted/60 ${
                        isSelected ? "bg-muted/80" : ""
                      }`}
                    >
                      <span className={r.correct ? "text-green-600" : "text-red-600"}>
                        {r.correct ? "✓" : "✗"}
                      </span>
                      <span className="text-muted-foreground">
                        Q{idx + 1}: {r.earned}/{r.max}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExplainedItemId((prev) => (prev === itemId ? null : itemId))
                      }
                      className={`text-xs hover:underline ${showExplain ? "text-primary font-medium" : "text-primary"}`}
                    >
                      {showExplain ? "Explain ▲" : "Explain"}
                    </button>
                  </div>
                  {showExplain && renderExplanation?.(itemId) && (
                    <div className="ml-5 mt-1 mb-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-sm">
                      {renderExplanation(itemId)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-3 pt-2">
        {onRetry && (
          <Button variant="secondary" size="md" onClick={onRetry}>
            Try again
          </Button>
        )}
        <Button variant="outline" size="md" asChild>
          <Link href={backHref}>Back to Exams</Link>
        </Button>
      </div>
    </div>
  );
}
