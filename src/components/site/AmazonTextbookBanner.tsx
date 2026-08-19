"use client";

import * as React from "react";

import {
  AMAZON_ASSOCIATE_DISCLOSURE,
  amazonAffiliateUrl,
  KOREAN_TEXTBOOKS,
  textbookCoverSrc,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";
import { trackAffiliateClick } from "@/lib/ga";

const COVER_FALLBACK = "/brand/textbooks/book-placeholder.svg";

type Props = {
  className?: string;
  /** GA placement label */
  placement?: string;
  /** Override catalog (global site passes lang-specific book). */
  books?: AmazonTextbook[];
  heading?: string;
  lede?: string;
  /** compact = smaller footprint for in-article / footer placement */
  variant?: "compact" | "card";
};

function BookCover({
  book,
  compact,
}: {
  book: AmazonTextbook;
  compact: boolean;
}) {
  const [src, setSrc] = React.useState(textbookCoverSrc(book));

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt=""
      width={compact ? 28 : 60}
      height={compact ? 42 : 90}
      className={
        compact
          ? "h-[2.625rem] w-[1.75rem] shrink-0 rounded object-cover bg-[var(--quiz-border)]"
          : "h-[4.5rem] w-10 shrink-0 rounded object-cover bg-[var(--quiz-border)] shadow-sm"
      }
      loading="lazy"
      decoding="async"
      onError={() => {
        if (src !== COVER_FALLBACK) setSrc(COVER_FALLBACK);
      }}
    />
  );
}

export function AmazonTextbookBanner({
  className = "",
  placement = "textbook_banner",
  books = KOREAN_TEXTBOOKS,
  heading = "Textbooks we recommend",
  lede,
  variant = "compact",
}: Props) {
  if (books.length === 0) return null;

  const onBookClick = (book: AmazonTextbook) => {
    trackAffiliateClick({
      partner: "amazon",
      placement,
      asin: book.asin,
    });
  };

  const isCompact = variant === "compact";
  const defaultLede = isCompact
    ? undefined
    : "Pair these charts with a structured course — links open on Amazon.";

  return (
    <aside
      className={`border border-[var(--quiz-border)] bg-[var(--quiz-surface)] ${
        isCompact
          ? "rounded-xl px-3.5 py-3"
          : "rounded-[1.25rem] px-5 py-5"
      } ${className}`.trim()}
      aria-label="Recommended language textbooks — Amazon affiliate"
      data-affiliate="amazon"
    >
      <div className={isCompact ? "flex flex-wrap items-baseline gap-x-2 gap-y-0.5" : ""}>
        <p
          className={
            isCompact
              ? "text-[0.65rem] font-semibold uppercase tracking-wide text-[var(--quiz-text-muted)]"
              : "text-xs font-semibold uppercase tracking-wide text-[var(--quiz-text-sub)]"
          }
        >
          Study next
        </p>
        <h2
          className={
            isCompact
              ? "text-sm font-semibold text-[var(--quiz-text)]"
              : "mt-1 text-base font-semibold text-[var(--quiz-text)]"
          }
        >
          {heading}
        </h2>
      </div>
      {(lede ?? defaultLede) ? (
        <p
          className={
            isCompact
              ? "mt-1 text-xs leading-snug text-[var(--quiz-text-sub)]"
              : "mt-1 text-sm leading-relaxed text-[var(--quiz-text-sub)]"
          }
        >
          {lede ?? defaultLede}
        </p>
      ) : null}

      <ul
        className={
          isCompact
            ? "mt-2.5 grid gap-2 sm:grid-cols-3"
            : "mt-4 space-y-3"
        }
      >
        {books.map((book) => {
          const href = amazonAffiliateUrl(book.asin);
          return (
            <li key={book.asin}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => onBookClick(book)}
                className={
                  isCompact
                    ? "group flex min-h-[3.25rem] items-center gap-2 rounded-lg border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] px-2 py-1.5 transition hover:border-[var(--quiz-primary)]/35 hover:bg-white"
                    : "group flex items-start gap-3 rounded-xl border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] p-3 transition hover:border-[var(--quiz-primary)]/35 hover:bg-white"
                }
                title={`${book.title} — ${book.subtitle}`}
              >
                <BookCover book={book} compact={isCompact} />
                <span className="min-w-0 flex-1">
                  <span
                    className={
                      isCompact
                        ? "block text-xs font-semibold leading-snug text-[var(--quiz-text)] line-clamp-2 group-hover:text-[var(--quiz-primary)]"
                        : "block text-sm font-semibold text-[var(--quiz-text)] group-hover:text-[var(--quiz-primary)]"
                    }
                  >
                    {book.title}
                  </span>
                  {!isCompact ? (
                    <>
                      <span className="mt-0.5 block text-xs leading-snug text-[var(--quiz-text-sub)]">
                        {book.subtitle}
                      </span>
                      <span className="mt-1.5 inline-block text-xs font-medium text-[var(--quiz-primary)]">
                        View on Amazon →
                      </span>
                    </>
                  ) : null}
                </span>
              </a>
            </li>
          );
        })}
      </ul>

      <p
        className={
          isCompact
            ? "mt-2 text-[0.6rem] leading-snug text-[var(--quiz-text-muted)]"
            : "mt-4 text-[0.68rem] leading-snug text-[var(--quiz-text-sub)]"
        }
      >
        {AMAZON_ASSOCIATE_DISCLOSURE}
      </p>
    </aside>
  );
}
