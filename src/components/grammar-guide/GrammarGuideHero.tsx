import type { GrammarGuide } from "@/lib/grammarGuidesRepo";
import { formatKoreanWithRomanization } from "@/lib/grammarRomanization";

type Props = {
  guide: GrammarGuide;
};

export function GrammarGuideHero({ guide }: Props) {
  const pronunciationLine = formatKoreanWithRomanization(guide.wordName);

  return (
    <header className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
        {guide.titleEn}
      </h1>

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
