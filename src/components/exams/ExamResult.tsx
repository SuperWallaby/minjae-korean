"use client";

import type { AttemptGrading } from "@/types/exam";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

type Props = {
  grading: AttemptGrading;
  onRetry?: () => void;
  backHref?: string;
};

export function ExamResult({ grading, onRetry, backHref = "/exams" }: Props) {
  const { percent, earnedPoints, totalPoints, placement, byItem } = grading;

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
            Recommended level: {placement.level}
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
            {Object.entries(byItem).map(([itemId, r]) => (
              <li key={itemId} className="flex items-center gap-2">
                <span
                  className={
                    r.correct ? "text-green-600" : "text-red-600"
                  }
                >
                  {r.correct ? "✓" : "✗"}
                </span>
                <span className="text-muted-foreground">
                  {itemId.slice(-6)}: {r.earned}/{r.max}
                </span>
              </li>
            ))}
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
