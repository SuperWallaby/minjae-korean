"use client";

import { useMemo, useState } from "react";

import type { ComparisonQuiz } from "@/lib/grammarComparisonsRepo";
import { cn } from "@/lib/utils";

import { GrammarKoreanWithRomanization } from "./GrammarKoreanWithRomanization";

type Props = {
  quizzes: ComparisonQuiz[];
};

type AnswerState = "idle" | "correct" | "wrong";

export function GrammarComparisonQuiz({ quizzes }: Props) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});

  const score = useMemo(() => {
    let correct = 0;
    for (let i = 0; i < quizzes.length; i++) {
      const q = quizzes[i];
      if (!q) continue;
      if (answers[i] === q.answer) correct += 1;
    }
    return correct;
  }, [answers, quizzes]);

  if (quizzes.length === 0) return null;

  function pickOption(index: number, option: string) {
    setAnswers((prev) => ({ ...prev, [index]: option }));
    setRevealed((prev) => ({ ...prev, [index]: true }));
  }

  function stateFor(index: number, option: string, quiz: ComparisonQuiz): AnswerState {
    if (!revealed[index]) return "idle";
    if (option === quiz.answer) return "correct";
    if (answers[index] === option) return "wrong";
    return "idle";
  }

  const allAnswered = quizzes.every((_, i) => revealed[i]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <h2 className="text-xl font-bold text-[var(--quiz-text)]">Quick quiz</h2>
        {allAnswered ? (
          <p className="text-sm font-semibold text-emerald-700">
            Score: {score} / {quizzes.length}
          </p>
        ) : null}
      </div>

      <ol className="space-y-5">
        {quizzes.map((quiz, index) => (
          <li
            key={`${quiz.questionEn}-${index}`}
            className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-4"
          >
            <p className="font-medium leading-snug text-[var(--quiz-text)]">
              {quiz.questionEn.trim() || quiz.questionKo}
            </p>
            {quiz.questionKo.trim() &&
            quiz.questionEn.trim() &&
            quiz.questionKo.trim() !== quiz.questionEn.trim() &&
            /[가-힣]/.test(quiz.questionKo) ? (
              <GrammarKoreanWithRomanization
                word={quiz.questionKo}
                block
                koreanClassName="mt-1.5 text-sm text-[var(--quiz-text-sub)]"
                romanClassName="text-xs font-normal text-[var(--quiz-text-muted)]"
              />
            ) : null}

            <ul className="mt-3 flex flex-wrap gap-2">
              {quiz.options.map((option) => {
                const state = stateFor(index, option, quiz);
                return (
                  <li key={option}>
                    <button
                      type="button"
                      onClick={() => pickOption(index, option)}
                      disabled={revealed[index]}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        state === "idle" &&
                          "border-[var(--quiz-border)] bg-white hover:border-emerald-300 hover:bg-emerald-50",
                        state === "correct" &&
                          "border-emerald-500 bg-emerald-50 text-emerald-800",
                        state === "wrong" &&
                          "border-red-400 bg-red-50 text-red-800",
                      )}
                    >
                      {/[가-힣]/.test(option) ? (
                        <GrammarKoreanWithRomanization
                          word={option}
                          koreanClassName=""
                          romanClassName="text-[0.8em] font-normal opacity-80"
                        />
                      ) : (
                        option
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}
