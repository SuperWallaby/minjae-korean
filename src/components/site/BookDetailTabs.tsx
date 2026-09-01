"use client";

import * as React from "react";
import { Star } from "lucide-react";

import styles from "@/components/site/home-blog.module.css";
import { cn } from "@/lib/utils";

type TabKey = "content" | "reviews";

const CONTENT_POINTS = [
  "You already know some basic Korean, but your sentences still feel too direct or too dictionary-like.",
  "You want short pages you can actually finish, revisit, and apply while speaking.",
  "You learn better from side-by-side examples, visual dialogue, and explanation of feeling rather than grammar labels alone.",
  "You care about tone, softness, implication, and what a listener hears behind the words.",
];

const REVIEW_QUOTES = [
  {
    name: "Sarah K.",
    rating: 5,
    quote:
      "This feels closer to being coached through Korean nuance than reading a normal vocab list.",
    role: "For learners who want usage, not just translation",
  },
  {
    name: "James L.",
    rating: 5,
    quote:
      "The visual comparisons make it obvious why one sentence sounds softer, lighter, or more natural.",
    role: "For learners who need quick pattern recognition",
  },
  {
    name: "Yuki M.",
    rating: 4,
    quote:
      "Each page is short enough to review often, but specific enough to actually change how you speak.",
    role: "For learners building speaking instinct",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={cn(
              "size-4 shrink-0",
              filled
                ? "fill-[#1a8917] stroke-[#1a8917] text-[#1a8917]"
                : "fill-transparent stroke-[#d0d0d0] text-[#d0d0d0]",
            )}
            strokeWidth={1.5}
            aria-hidden
          />
        );
      })}
    </div>
  );
}

export function BookDetailTabs() {
  const [tab, setTab] = React.useState<TabKey>("content");

  return (
    <div>
      <div className={styles.bookTabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "content"}
          className={cn(
            styles.bookTab,
            tab === "content" && styles.bookTabActive,
          )}
          onClick={() => setTab("content")}
        >
          Content
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "reviews"}
          className={cn(
            styles.bookTab,
            tab === "reviews" && styles.bookTabActive,
          )}
          onClick={() => setTab("reviews")}
        >
          Reviews
        </button>
      </div>

      {tab === "content" ? (
        <div className="mt-6">
          <p className={styles.bookSectionLabel}>Content</p>
          <h2 className={styles.bookSectionTitle}>Is this book right for me?</h2>
          <p className={styles.bookSectionBody}>
            This book is best for learners who are no longer struggling with
            basic grammar, but still feel that their Korean sounds a little too
            flat, literal, or abrupt.
          </p>
          <ul className={styles.bookPointList}>
            {CONTENT_POINTS.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="mt-6">
          <p className={styles.bookSectionLabel}>Reviews</p>
          <h2 className={styles.bookSectionTitle}>
            What readers are likely to value most
          </h2>
          <div className="mt-2">
            {REVIEW_QUOTES.map((item) => (
              <div key={item.quote} className={styles.bookReview}>
                <div className={styles.bookReviewHead}>
                  <span className={styles.bookReviewName}>{item.name}</span>
                  <StarRating rating={item.rating} />
                </div>
                <p className={styles.bookReviewQuote}>
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className={styles.bookReviewRole}>{item.role}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
