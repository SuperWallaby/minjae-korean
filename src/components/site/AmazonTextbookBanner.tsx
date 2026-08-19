"use client";

import * as React from "react";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  amazonAffiliateUrl,
  amazonCoverImageUrl,
  KOREAN_TEXTBOOKS,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";

type Props = {
  className?: string;
  /** GA placement label */
  placement?: string;
  /** Override catalog (global site passes lang-specific book). */
  books?: AmazonTextbook[];
  heading?: string;
  lede?: string;
};

export function AmazonTextbookBanner({
  className = "",
  placement = "textbook_banner",
  books = KOREAN_TEXTBOOKS,
  heading = "Textbooks we recommend",
  lede = "Pair these charts with a structured course — links open on Amazon.",
}: Props) {
  if (books.length === 0) return null;

  const onBookClick = (book: AmazonTextbook) => {
    trackAffiliateClick({
      partner: "amazon",
      placement,
      asin: book.asin,
    });
  };

  return (
    <aside
      className={`rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-5 py-5 ${className}`.trim()}
      aria-label="Recommended language textbooks — Amazon affiliate"
      data-affiliate="amazon"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-sub)]">
        Study next
      </p>
      <h2 className="mt-1 text-base font-semibold text-[var(--quiz-text)]">
        {heading}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-[var(--quiz-text-sub)]">
        {lede}
      </p>

      <ul className="mt-4 space-y-3">
        {books.map((book) => {
          const href = amazonAffiliateUrl(book.asin);
          return (
            <li key={book.asin}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => onBookClick(book)}
                className="group flex items-start gap-3 rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] p-3 transition hover:border-[var(--quiz-primary)]/35 hover:bg-white"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={amazonCoverImageUrl(book.asin, 120)}
                  alt=""
                  width={60}
                  height={90}
                  className="h-[4.5rem] w-10 shrink-0 rounded object-cover shadow-sm"
                  loading="lazy"
                  decoding="async"
                />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[var(--quiz-text)] group-hover:text-[var(--quiz-primary)]">
                    {book.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-[var(--quiz-text-sub)]">
                    {book.subtitle}
                  </span>
                  <span className="mt-1.5 inline-block text-xs font-medium text-[var(--quiz-primary)]">
                    View on Amazon →
                  </span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 text-[0.68rem] leading-snug text-[var(--quiz-text-sub)]">
        {AMAZON_ASSOCIATE_DISCLOSURE}
      </p>
    </aside>
  );
}
