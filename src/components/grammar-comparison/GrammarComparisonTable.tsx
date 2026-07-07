import type { ComparisonItem } from "@/lib/grammarComparisonsRepo";
import { cn } from "@/lib/utils";

import { GrammarKoreanWithRomanization } from "./GrammarKoreanWithRomanization";

type Props = {
  items: ComparisonItem[];
};

export function GrammarComparisonTable({ items }: Props) {
  if (items.length === 0) return null;

  const twoCol = items.length === 2;

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[var(--quiz-text)]">Word-by-word breakdown</h2>
        <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
          One lane per word — no nested boxes, just the gist.
        </p>
      </div>

      <div
        className={cn(
          "divide-y divide-[var(--quiz-border)]",
          twoCol &&
            "md:grid md:grid-cols-2 md:gap-0 md:divide-x md:divide-y-0",
        )}
      >
        {items.map((item) => (
          <article
            key={item.wordName}
            className={cn(
              "py-6 first:pt-0 last:pb-0",
              twoCol && "md:px-6 md:py-6 md:first:pl-0 md:last:pr-0",
            )}
          >
            <GrammarKoreanWithRomanization
              word={item.wordName}
              block
              koreanClassName="font-mono text-2xl font-bold tracking-tight text-[var(--quiz-text)]"
              romanClassName="font-mono text-sm font-normal text-[var(--quiz-text-muted)]"
            />
            <p className="mt-2 text-base leading-snug text-[var(--quiz-text)]">
              {item.meaningEn}
            </p>

            {item.situationsEn.length > 0 ? (
              <div className="mt-5">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--quiz-text-muted)]">
                  When to use
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--quiz-text-sub)]">
                  {item.situationsEn.join(", ")}
                </p>
              </div>
            ) : null}

            <div className="mt-5">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--quiz-text-muted)]">
                The nuance
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--quiz-text)]">
                {item.ruleEn}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
