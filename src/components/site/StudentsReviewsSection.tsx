"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { ReviewsScroller, type ReviewsScrollerHandle } from "./ReviewsScroller";

const items = [
  {
    quote:
      "“It felt more like using Korean than studying it, having real conversations.”",
    meta: "Member",
  },
  {
    quote:
      "Talking was easier because minjae always bring up a good topic to talk about.”",
    meta: "Member",
  },
  {
    quote:
      "“Sometimes you can just only hear what minjae says he is good at story telling.”",
    meta: "Member",
  },
];

export function MembersReviewsSection() {
  const scrollerRef = React.useRef<ReviewsScrollerHandle>(null);

  return (
    <section id="Members-say" className="scroll-mt-24 py-10 sm:py-16">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-4">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              What people say
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Someone who used Korean with Minjae. And felt the time was worth
              it.
            </p>

            {/* Desktop arrows (mobile can swipe) */}
            <div className="mt-6 hidden items-center justify-end gap-2 lg:flex">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/60 text-foreground/70 transition hover:bg-white hover:text-foreground"
                aria-label="Previous reviews"
                onClick={() => scrollerRef.current?.scrollBy(-1)}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white/60 text-foreground/70 transition hover:bg-white hover:text-foreground"
                aria-label="Next reviews"
                onClick={() => scrollerRef.current?.scrollBy(1)}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>

          <div className="w-full max-lg:max-w-[calc(100vw-3rem)] lg:col-span-8">
            <div className="-mx-4 overflow-hidden sm:mx-0">
              <ReviewsScroller ref={scrollerRef} items={items} />
            </div>

            {/* Mobile arrows */}
            <div className="mt-4 flex items-center justify-end gap-2 lg:hidden">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
                aria-label="Previous reviews"
                onClick={() => scrollerRef.current?.scrollBy(-1)}
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white/70 text-foreground/70 transition hover:bg-white hover:text-foreground"
                aria-label="Next reviews"
                onClick={() => scrollerRef.current?.scrollBy(1)}
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
