import type { GrammarGuide } from "@/lib/grammarGuidesRepo";

import { GrammarKoreanWithRomanization } from "../grammar-comparison/GrammarKoreanWithRomanization";

type Props = {
  guide: GrammarGuide;
};

export function GrammarGuideContent({ guide }: Props) {
  const isMeaning = guide.type === "meaning";

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[var(--quiz-text)]">
          {isMeaning ? "Definition & nuance" : "Usage guide"}
        </h2>
        <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
          {isMeaning
            ? "Core meaning and shades learners miss."
            : "When and how native speakers actually use it."}
        </p>
      </div>

      <article className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-5">
        <GrammarKoreanWithRomanization
          word={guide.wordName}
          block
          koreanClassName="font-mono text-2xl font-bold tracking-tight text-[var(--quiz-text)]"
          romanClassName="font-mono text-sm font-normal text-[var(--quiz-text-muted)]"
        />
        <p className="mt-3 text-base leading-snug text-[var(--quiz-text)]">
          {guide.meaningEn}
        </p>

        {guide.nuancesEn.length > 0 ? (
          <div className="mt-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--quiz-text-muted)]">
              Nuances
            </p>
            <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm leading-relaxed text-[var(--quiz-text-sub)]">
              {guide.nuancesEn.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {guide.situationsEn.length > 0 ? (
          <div className="mt-5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--quiz-text-muted)]">
              When to use
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--quiz-text-sub)]">
              {guide.situationsEn.join(", ")}
            </p>
          </div>
        ) : null}

        <div className="mt-5">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-[var(--quiz-text-muted)]">
            {isMeaning ? "In context" : "The nuance"}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--quiz-text)]">
            {guide.ruleEn}
          </p>
        </div>
      </article>
    </section>
  );
}
