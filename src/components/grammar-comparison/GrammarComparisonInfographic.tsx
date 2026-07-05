import Image from "next/image";

import type { Comparison } from "@/lib/grammarComparisonsRepo";

type Props = {
  comparison: Comparison;
};

/** Capybara cheat-sheet — below the page intro. */
export function GrammarComparisonInfographic({ comparison }: Props) {
  if (!comparison.imageUrl) return null;

  return (
    <figure className="overflow-hidden rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
        <Image
          src={comparison.imageUrl}
          alt={comparison.imageAlt ?? comparison.titleEn}
          width={960}
          height={590}
          className="mx-auto h-auto w-full max-w-[960px]"
          sizes="(max-width: 960px) 100vw, 960px"
        priority
        unoptimized
      />
    </figure>
  );
}
