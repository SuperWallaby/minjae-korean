import Image from "next/image";

import type { GrammarGuide } from "@/lib/grammarGuidesRepo";

type Props = {
  guide: GrammarGuide;
};

export function GrammarGuideInfographic({ guide }: Props) {
  if (!guide.imageUrl) return null;

  return (
    <figure className="overflow-hidden rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
      <Image
        src={guide.imageUrl}
        alt={guide.imageAlt ?? guide.titleEn}
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
