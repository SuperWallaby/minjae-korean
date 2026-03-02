"use client";

import type { TestQuestion } from "@/data/grammarTypes";
import { DescribeKorean } from "../DescribeKorean";
import { useCallback, useState } from "react";

type Props = {
  title?: string;
  questions: TestQuestion[];
};

function normalize(s: string): string {
  return s.trim();
}

function isCorrect(selected: string, answer: string): boolean {
  return normalize(selected) === normalize(answer);
}

export function BlockTest({ title, questions }: Props) {
  const [state, setState] = useState<{ selected: string | null; submitted: boolean }[]>(
    () => questions.map(() => ({ selected: null, submitted: false }))
  );

  const selectAndSubmit = useCallback((index: number, choice: string) => {
    setState((prev) => {
      const next = [...prev];
      next[index] = { selected: choice, submitted: true };
      return next;
    });
  }, []);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {title ? (
        <div className="px-4 py-3 border-b border-border bg-muted/50 font-semibold text-sm">
          {title}
        </div>
      ) : null}
      <ul className="divide-y divide-border">
        {questions.map((q, i) => (
          <li key={i} className="px-4 py-3">
            <p className="text-sm font-medium text-foreground mb-2">
              {q.prompt.includes("\uAC00") || q.prompt.includes("\u3131") ? (
                <DescribeKorean text={q.prompt} />
              ) : (
                q.prompt
              )}
            </p>
            {!state[i].submitted ? (
              <div className="flex flex-wrap gap-2">
                {q.choices.map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => selectAndSubmit(i, choice)}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-background hover:bg-muted hover:border-foreground/30 transition"
                  >
                    <DescribeKorean text={choice} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-sm">
                <p className="text-muted-foreground">
                  Answer:{" "}
                  <span className="font-medium text-foreground">
                    <DescribeKorean text={q.answer} />
                  </span>
                </p>
                {isCorrect(state[i].selected ?? "", q.answer) ? (
                  <p className="mt-1 text-emerald-700 dark:text-emerald-600">Correct!</p>
                ) : (
                  <p className="mt-1 text-amber-700 dark:text-amber-600">
                    Oops! Your answer: &quot;<DescribeKorean text={state[i].selected ?? "(none)"} />&quot;
                  </p>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
