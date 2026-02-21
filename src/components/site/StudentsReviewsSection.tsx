"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Container } from "./Container";
import { ReviewsScroller, type ReviewsScrollerHandle } from "./ReviewsScroller";
const items = [
  {
    quote:
      "“Minjae always comes prepared with plenty of materials, so the sessions feel super organized and productive.”",
    meta: "Aina",
  },
  {
    quote:
      "“The post-class captions/notes are honestly amazing—clear, natural, and exactly what I need to review.”",
    meta: "Jason",
  },
  {
    quote:
      "“I love how warm and friendly the 분위기 is. I feel comfortable making mistakes and just speaking.”",
    meta: "Lukas",
  },
  {
    quote:
      "“Every class has a solid plan, but Minjae still adapts to what I want to practice that day.”",
    meta: "Sophie",
  },
  {
    quote:
      "“The captions after class are gold. I keep re-reading them and I can actually hear the expressions in real life.”",
    meta: "Nurul",
  },
  {
    quote:
      "“Minjae explains things in a kind way and never makes it feel intimidating. It’s motivating.”",
    meta: "Emily",
  },
  {
    quote:
      "“There are so many useful examples and real-life phrases. It doesn’t feel like memorizing—more like building habits.”",
    meta: "Johannes",
  },
  {
    quote:
      "“The atmosphere is calm and supportive, so I end up talking way more than I normally would.”",
    meta: "Marta",
  },
  {
    quote:
      "“Minjae’s feedback is detailed but gentle, and the follow-up notes make everything stick.”",
    meta: "Fasha",
  },
  {
    quote:
      "“If you want a teacher who’s prepared, warm, and gives you great after-class summaries, this is it.”",
    meta: "Hannah",
  },
  {
    quote:
      "“I didn’t expect the after-class captions to be this helpful—perfect for shadowing and self-practice.”",
    meta: "Wei Lin",
  },
  {
    quote:
      "“Minjae makes the class feel safe and friendly, and the materials are always on point.”",
    meta: "Anya",
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
              What members say
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
