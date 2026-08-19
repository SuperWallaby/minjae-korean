"use client";

import * as React from "react";

import {
  amazonAffiliateUrl,
  textbookCoverSrc,
  type AmazonTextbook,
} from "@/lib/affiliateAmazon";

const COVER_FALLBACK = "/brand/textbooks/book-placeholder.svg";

type SlideProps = {
  book: AmazonTextbook;
  onClick: () => void;
  /** quiz (default) | global */
  theme?: "quiz" | "global";
};

function CarouselSlide({ book, onClick, theme = "quiz" }: SlideProps) {
  const [coverSrc, setCoverSrc] = React.useState(textbookCoverSrc(book));
  const isGlobal = theme === "global";

  return (
    <li
      className={
        isGlobal
          ? "global-textbook-slide"
          : "w-[8.5rem] shrink-0 snap-start sm:w-36"
      }
    >
      <a
        href={amazonAffiliateUrl(book.asin)}
        target="_blank"
        rel="noopener noreferrer sponsored"
        title={`${book.title} — ${book.subtitle}`}
        onClick={onClick}
        className={
          isGlobal
            ? "global-textbook-slide-link"
            : "group block"
        }
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={coverSrc}
          alt=""
          width={96}
          height={144}
          loading="lazy"
          decoding="async"
          onError={() => {
            if (coverSrc !== COVER_FALLBACK) setCoverSrc(COVER_FALLBACK);
          }}
          className={
            isGlobal
              ? "global-textbook-slide-cover"
              : "aspect-[2/3] w-full rounded-lg border border-[var(--quiz-border)] bg-[var(--quiz-canvas)] object-cover shadow-sm transition group-hover:border-[var(--quiz-primary)]/40"
          }
        />
        <span
          className={
            isGlobal
              ? "global-textbook-slide-title"
              : "mt-2 block text-xs font-semibold leading-snug text-[var(--quiz-text)] line-clamp-2 group-hover:text-[var(--quiz-primary)]"
          }
        >
          {book.title}
        </span>
        {!isGlobal ? (
          <span className="mt-0.5 block text-[0.65rem] leading-snug text-[var(--quiz-text-muted)] line-clamp-1">
            {book.subtitle}
          </span>
        ) : null}
      </a>
    </li>
  );
}

type Props = {
  books: AmazonTextbook[];
  onBookClick: (book: AmazonTextbook) => void;
  theme?: "quiz" | "global";
  ariaLabel?: string;
};

export function TextbookCarousel({
  books,
  onBookClick,
  theme = "quiz",
  ariaLabel = "Recommended textbooks",
}: Props) {
  const isGlobal = theme === "global";

  return (
    <div
      className={
        isGlobal ? "global-textbook-carousel-wrap" : "relative -mx-1 mt-2.5"
      }
    >
      {!isGlobal ? (
        <>
          <div
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-4 bg-gradient-to-r from-[var(--quiz-surface)] to-transparent"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-6 bg-gradient-to-l from-[var(--quiz-surface)] to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <ul
        className={
          isGlobal
            ? "global-textbook-carousel"
            : "flex gap-3 overflow-x-auto px-1 pb-1.5 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        }
        aria-label={ariaLabel}
      >
        {books.map((book) => (
          <CarouselSlide
            key={book.asin}
            book={book}
            theme={theme}
            onClick={() => onBookClick(book)}
          />
        ))}
      </ul>
    </div>
  );
}
