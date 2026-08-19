"use client";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  KOREAN_TEXTBOOKS,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";

import { TextbookCarousel } from "@/components/site/TextbookCarousel";

type Props = {
  className?: string;
  placement?: string;
  books?: AmazonTextbook[];
  heading?: string;
  lede?: string;
  lang?: string;
  pinId?: string;
};

export function AmazonTextbookBanner({
  className = "",
  placement = "textbook_banner",
  books = KOREAN_TEXTBOOKS,
  heading = "Textbooks we recommend",
  lede = "Pair a chart with a structured course — swipe to browse.",
  lang,
  pinId,
}: Props) {
  if (books.length === 0) return null;

  const onBookClick = (book: AmazonTextbook) => {
    trackAffiliateClick({
      partner: "amazon",
      placement,
      asin: book.asin,
      lang,
      pinId,
    });
  };

  return (
    <aside
      className={`rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3.5 ${className}`.trim()}
      aria-label="Recommended language textbooks — Amazon affiliate"
      data-affiliate="amazon"
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]">
          Study next
        </p>
        <h2 className="text-sm font-semibold text-[var(--quiz-text)]">
          {heading}
        </h2>
      </div>
      {lede ? (
        <p className="mt-1 text-xs leading-snug text-[var(--quiz-text-sub)]">
          {lede}
        </p>
      ) : null}

      <TextbookCarousel books={books} onBookClick={onBookClick} />

      <p className="mt-2.5 text-[0.6rem] leading-snug text-[var(--quiz-text-muted)]">
        {AMAZON_ASSOCIATE_DISCLOSURE}
      </p>
    </aside>
  );
}
