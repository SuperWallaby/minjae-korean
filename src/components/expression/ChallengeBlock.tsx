"use client";

import * as React from "react";
import type { ExpressionChallenge } from "@/data/expressionTypes";

type Props = {
  challenge: ExpressionChallenge;
};

export function ChallengeBlock({ challenge }: Props) {
  const count = challenge.inputCount;
  const [values, setValues] = React.useState<string[]>(() =>
    Array.from({ length: count }, () => ""),
  );
  const [loading, setLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [error, setError] = React.useState<"TOO_LONG" | string | null>(null);

  const handleChange = (i: number, v: string) => {
    setValues((prev) => {
      const next = prev.slice();
      next[i] = v;
      return next;
    });
    setFeedback(null);
    setError(null);
  };

  const handleSubmit = async () => {
    const sentences = values.map((v) => v.trim()).filter(Boolean);
    if (sentences.length === 0) return;

    setLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/public/expression-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sentences }),
      });
      const json = await res.json();

      if (json.error === "TOO_LONG") {
        setError("TOO_LONG");
        return;
      }
      if (!res.ok || !json.ok) {
        setError(json.error ?? "Request failed");
        return;
      }
      setFeedback(json.feedback ?? "");
    } catch {
      setError("Request failed");
    } finally {
      setLoading(false);
    }
  };

  const inputs = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-6">
      <p className="text-lg font-medium text-foreground text-center mb-5">
        {challenge.prompt}
      </p>
      <div className="space-y-3">
        {inputs.map((num, i) => (
          <div key={num} className="flex items-center gap-3">
            <span
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-semibold"
              aria-hidden
            >
              {num}
            </span>
            <input
              type="text"
              value={values[i] ?? ""}
              onChange={(e) => handleChange(i, e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-lg placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Write your sentence here..."
            />
          </div>
        ))}
      </div>

      <div className="mt-5 flex justify-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || values.every((v) => !v.trim())}
          className="rounded-xl bg-primary px-8 py-3.5 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none min-h-[48px] min-w-[140px]"
        >
          {loading ? "Checking…" : "Submit"}
        </button>
      </div>

      {error === "TOO_LONG" && (
        <p className="mt-4 text-center text-sm text-amber-600">
          너무 길어요! 문장을 짧게 써 주세요.
        </p>
      )}
      {error && error !== "TOO_LONG" && (
        <p className="mt-4 text-center text-sm text-rose-600">{error}</p>
      )}
      {feedback && (
        <div className="mt-4 rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground">
          {feedback}
        </div>
      )}
    </div>
  );
}
