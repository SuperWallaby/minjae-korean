"use client";

import * as React from "react";
import { Star } from "lucide-react";

import { SegmentedToggle } from "@/components/ui/SegmentedToggle";
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
    <div
      className="flex gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < rating;
        return (
          <Star
            key={i}
            className={cn(
              "size-4.5 shrink-0",
              filled
                ? "fill-yellow-400 stroke-yellow-400 text-yellow-400"
                : "fill-transparent stroke-muted-foreground/35 text-muted-foreground/35"
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
    <div className="rounded-4xl border border-border bg-card px-6 py-7 shadow-(--shadow-card) sm:px-8">
      <SegmentedToggle
        value={tab}
        onChange={setTab}
        size="lg"
        options={[
          { value: "content", label: "Content" },
          { value: "reviews", label: "Reviews" },
        ]}
      />

      {tab === "content" ? (
        <div className="mt-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
            Content
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Is this book right for me?
          </h2>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            This book is best for learners who are no longer struggling with
            basic grammar, but still feel that their Korean sounds a little too
            flat, literal, or abrupt.
          </p>
          <div className="mt-5 grid gap-3">
            {CONTENT_POINTS.map((point) => (
              <div
                key={point}
                className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3 text-sm leading-6 text-foreground"
              >
                {point}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/70">
            Reviews
          </div>
          <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            What readers are likely to value most
          </h2>
          <div className="mt-5 grid gap-4">
            {REVIEW_QUOTES.map((item) => (
              <div
                key={item.quote}
                className="rounded-2xl border border-border/70 bg-muted/25 px-5 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {item.name}
                  </span>
                  <StarRating rating={item.rating} />
                </div>
                <p className="mt-3 text-base leading-7 text-foreground">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
