import Link from "next/link";

import type { GrammarGuideCard, GrammarGuideType } from "@/lib/grammarGuidesRepo";
import { guideBasePath } from "@/lib/grammarGuidesRepo";
import { formatUsageGuideTitleEn } from "@/lib/grammarPatternDisplay";

type CrossGuideLink = {
  type: GrammarGuideType;
  guide: Pick<GrammarGuideCard, "id" | "slug" | "wordName" | "titleEn">;
};

type Props = {
  type: GrammarGuideType;
  currentId: number;
  related: GrammarGuideCard[];
  crossGuide?: CrossGuideLink | null;
};

const SECTION_TITLES: Record<GrammarGuideType, string> = {
  meaning: "More meaning guides",
  usage: "More usage guides",
  "how-to-say": "More how-to-say guides",
};

const INDEX_LABELS: Record<GrammarGuideType, string> = {
  meaning: "View all meaning guides →",
  usage: "View all usage guides →",
  "how-to-say": "View all how-to-say guides →",
};

const CROSS_LABELS: Record<GrammarGuideType, string> = {
  meaning: "What does it mean?",
  usage: "How to use",
  "how-to-say": "How to say it",
};

export function GrammarGuideRelated({ type, currentId, related, crossGuide }: Props) {
  const links = related.filter((g) => g.id !== currentId);
  const basePath = guideBasePath(type);

  return (
    <section className="space-y-4 border-t border-[var(--quiz-border)] pt-10">
      {crossGuide ? (
        <div className="rounded-[1.125rem] border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-sm font-semibold text-[var(--quiz-text)]">
            {CROSS_LABELS[crossGuide.type]}
          </p>
          <Link
            href={`${guideBasePath(crossGuide.type)}/${crossGuide.guide.id}/${encodeURIComponent(crossGuide.guide.slug)}`}
            className="mt-2 inline-flex text-base font-medium text-emerald-800 underline hover:text-emerald-950"
          >
            {crossGuide.type === "usage"
              ? formatUsageGuideTitleEn(crossGuide.guide.wordName)
              : crossGuide.guide.titleEn}
          </Link>
        </div>
      ) : null}

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
