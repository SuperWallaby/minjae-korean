import type { Comparison } from "@/lib/grammarComparisonsRepo";
import { formatKoreanWithRomanization } from "@/lib/grammarRomanization";

type Props = {
  comparison: Comparison;
};

/** Title + intro — English lead with Korean + romanization for SEO. */
export function GrammarComparisonHero({ comparison }: Props) {
  const pronunciationLine = comparison.items
    .map((item) => formatKoreanWithRomanization(item.wordName))
    .join(" · ");

  return (
    <header className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
        {comparison.titleEn}
      </h1>

      {pronunciationLine ? (
        <p className="font-mono text-sm leading-relaxed text-[var(--quiz-text-sub)]">
          {pronunciationLine}
        </p>
      ) : null}

      <p className="max-w-2xl border-l-2 border-emerald-500/40 pl-4 text-base leading-relaxed text-[var(--quiz-text-sub)]">
        {comparison.summaryEn}
      </p>
    </header>
  );
}
