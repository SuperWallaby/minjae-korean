import type { ComparisonExample } from "@/lib/grammarComparisonsRepo";
import { filterConfidentExamples } from "@/lib/grammarComparisonExamples";

import { GrammarSentenceWithRomanization } from "./GrammarKoreanWithRomanization";

type Props = {
  examples: ComparisonExample[];
};

export function GrammarComparisonExamples({ examples }: Props) {
  const confident = filterConfidentExamples(examples);
  if (confident.length === 0) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold text-[var(--quiz-text)]">
        Real-world examples
      </h2>
      <ul className="space-y-3">
        {confident.map((ex, i) => (
          <li
            key={`${ex.sentence}-${i}`}
            className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 shrink-0 text-xl leading-none"
                aria-hidden
              >
                {ex.isCorrect ? "⭕" : "❌"}
              </span>
              <div className="min-w-0 flex-1">
                <GrammarSentenceWithRomanization
                  sentence={ex.sentence}
                  className="font-medium text-[var(--quiz-text)]"
                />
                <p className="mt-2 text-sm text-[var(--quiz-text-sub)]">{ex.reasonEn}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
