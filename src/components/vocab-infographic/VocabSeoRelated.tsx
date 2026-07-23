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

export function VocabSeoRelated({ items }: Props) {
  if (items.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="vocab-related">
      <h2
        id="vocab-related"
        className="text-lg font-semibold text-[var(--quiz-text)]"
      >
        More related charts
      </h2>
      <p className="text-sm text-[var(--quiz-text-sub)]">
        Keep browsing similar Korean word groups — each chart links to more.
      </p>
      <ul className="divide-y divide-[var(--quiz-border)] overflow-hidden rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
        {items.map((page) => (
          <li key={page.bundleId}>
            <Link
              href={vocabSeoPath(page.bundleId, page.slug)}
              className="flex items-baseline justify-between gap-4 px-4 py-3.5 transition hover:bg-[var(--quiz-surface-muted)] sm:px-5"
            >
              <span className="min-w-0">
                <span className="block font-semibold text-[var(--quiz-text)]">
                  {page.titleEn}
                </span>
                <span className="mt-0.5 block text-sm text-[var(--quiz-text-sub)] line-clamp-1">
                  {wordPreview(page)}
                </span>
              </span>
              <span
                aria-hidden
                className="shrink-0 text-sm text-[var(--quiz-text-muted)]"
              >
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="text-sm text-[var(--quiz-text-sub)]">
        Or browse the full index:{" "}
        <Link
          href="/vocab"
          className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
        >
          All vocab charts
        </Link>
      </p>
    </section>
  );
}
