import type { GrammarGuide } from "@/lib/grammarGuidesRepo";
import {
  formatGrammarPatternDisplay,
  formatUsageGuideTitleEn,
} from "@/lib/grammarPatternDisplay";
import { formatKoreanWithRomanization } from "@/lib/grammarRomanization";

type Props = {
  guide: GrammarGuide;
};

export function GrammarGuideHero({ guide }: Props) {
  const pronunciationLine = formatKoreanWithRomanization(guide.wordName);
  const headline =
    guide.type === "usage"
      ? formatUsageGuideTitleEn(guide.wordName)
      : guide.titleEn;
  const patternLabel =
    guide.type === "usage"
      ? formatGrammarPatternDisplay(guide.wordName)
      : null;

  return (
    <header className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
        {headline}
      </h1>

      {patternLabel && patternLabel !== guide.wordName ? (
        <p className="font-mono text-sm text-[var(--quiz-text-sub)]">
          Pattern: {guide.wordName}
        </p>
      ) : null}

      {pronunciationLine ? (
        <p className="font-mono text-sm leading-relaxed text-[var(--quiz-text-sub)]">
          {pronunciationLine}
        </p>
      ) : null}

      <p className="max-w-2xl border-l-2 border-emerald-500/40 pl-4 text-base leading-relaxed text-[var(--quiz-text-sub)]">
        {guide.summaryEn}
      </p>
    </header>
  );
}
