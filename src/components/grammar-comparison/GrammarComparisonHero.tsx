import type { Comparison } from "@/lib/grammarComparisonsRepo";

type Props = {
  comparison: Comparison;
};

/** Title + intro — English only on the page. */
export function GrammarComparisonHero({ comparison }: Props) {
  return (
    <header className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
        {comparison.titleEn}
      </h1>

      <p className="max-w-2xl border-l-2 border-emerald-500/40 pl-4 text-base leading-relaxed text-[var(--quiz-text-sub)]">
        {comparison.summaryEn}
      </p>
    </header>
  );
}
