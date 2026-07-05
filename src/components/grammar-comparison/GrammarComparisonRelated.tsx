import Link from "next/link";

import type { ComparisonCard } from "@/lib/grammarComparisonsRepo";

type Props = {
  currentId: number;
  related: ComparisonCard[];
};

export function GrammarComparisonRelated({ currentId, related }: Props) {
  const links = related.filter((c) => c.id !== currentId);

  return (
    <section className="space-y-4 border-t border-[var(--quiz-border)] pt-10">
      <h2 className="text-lg font-bold text-[var(--quiz-text)]">
        More comparisons to explore
      </h2>

      {links.length > 0 ? (
        <ul className="divide-y divide-[var(--quiz-border)]">
          {links.map((item) => (
            <li key={item.id}>
              <Link
                href={`/grammar/${item.id}/${encodeURIComponent(item.slug)}`}
                className="block py-3 text-base font-medium text-[var(--quiz-text)] transition-colors hover:text-emerald-800"
              >
                {item.titleEn}
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
          href="/grammar/compare"
          className="font-medium text-emerald-800 underline hover:text-emerald-950"
        >
          View all word comparisons →
        </Link>
      </p>
    </section>
  );
}
