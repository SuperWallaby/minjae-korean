import Link from "next/link";

import type { GrammarGuideCard, GrammarGuideType } from "@/lib/grammarGuidesRepo";
import { guideBasePath } from "@/lib/grammarGuidesRepo";
import { formatUsageGuideTitleEn } from "@/lib/grammarPatternDisplay";

type Props = {
  type: GrammarGuideType;
  currentId: number;
  related: GrammarGuideCard[];
};

const SECTION_TITLES: Record<GrammarGuideType, string> = {
  meaning: "More meaning guides",
  usage: "More usage guides",
};

const INDEX_LABELS: Record<GrammarGuideType, string> = {
  meaning: "View all meaning guides →",
  usage: "View all usage guides →",
};

export function GrammarGuideRelated({ type, currentId, related }: Props) {
  const links = related.filter((g) => g.id !== currentId);
  const basePath = guideBasePath(type);

  return (
    <section className="space-y-4 border-t border-[var(--quiz-border)] pt-10">
      <h2 className="text-lg font-bold text-[var(--quiz-text)]">
        {SECTION_TITLES[type]}
      </h2>

      {links.length > 0 ? (
        <ul className="divide-y divide-[var(--quiz-border)]">
          {links.map((item) => (
            <li key={item.id}>
              <Link
                href={`${basePath}/${item.id}/${encodeURIComponent(item.slug)}`}
                className="block py-3 text-base font-medium text-[var(--quiz-text)] transition-colors hover:text-emerald-800"
              >
                {type === "usage"
                  ? formatUsageGuideTitleEn(item.wordName)
                  : item.titleEn}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--quiz-text-sub)]">
          More guides are on the way.
        </p>
      )}

      <p className="pt-2 text-sm">
        <Link
          href={basePath}
          className="font-medium text-emerald-800 underline hover:text-emerald-950"
        >
          {INDEX_LABELS[type]}
        </Link>
      </p>
    </section>
  );
}
