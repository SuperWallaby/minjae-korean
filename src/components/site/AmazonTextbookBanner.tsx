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
  heading = "Recommended Korean textbooks",
  lede,
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
      className={`mx-auto w-full max-w-md rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-4 py-3.5 ${className}`.trim()}
      aria-label="Recommended language textbooks — Amazon affiliate"
      data-affiliate="amazon"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-[var(--quiz-text)]">
          {heading}
        </h2>
        <span className="shrink-0 text-[0.65rem] text-[var(--quiz-text-muted)]">
          Swipe →
        </span>
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
