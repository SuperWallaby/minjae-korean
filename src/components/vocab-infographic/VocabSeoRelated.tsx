import Link from "next/link";

import type { VocabSeoPage } from "@/lib/vocabInfographic/seoTypes";
import { vocabSeoPath } from "@/lib/vocabInfographic/seo";

type Props = {
  items: VocabSeoPage[];
};

function wordPreview(page: VocabSeoPage): string {
  if (page.words.length > 0) {
    return page.words
      .slice(0, 4)
      .map((w) => w.hangul)
      .join(" · ");
  }
  return page.intro.slice(0, 80);
}

/** Related charts — rendered inside MarketingShell on the vocab SEO page. */
export function VocabSeoRelated({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="vocab-related">
      <div className="space-y-1">
        <h2
          id="vocab-related"
          className="text-lg font-semibold text-[var(--quiz-text)]"
        >
          More related charts
        </h2>
        <p className="text-sm text-[var(--quiz-text-sub)]">
          Keep browsing similar Korean word groups.{" "}
          <Link
            href="/vocab"
            className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
          >
            All vocab charts
          </Link>
        </p>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">
        {items.map((page) => (
          <li key={page.bundleId}>
            <Link
              href={vocabSeoPath(page.bundleId, page.slug)}
              className="flex h-full flex-col gap-0.5 rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-3.5 py-3 transition hover:border-[var(--quiz-primary)]/35 hover:bg-[var(--quiz-surface-muted)]"
            >
              <span className="font-semibold text-[var(--quiz-text)]">
                {page.titleEn}
              </span>
              <span className="text-sm text-[var(--quiz-text-sub)] line-clamp-1">
                {wordPreview(page)}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
