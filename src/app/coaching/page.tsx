import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { FlexibleMonthlyRhythmCard } from "@/components/stripe/FlexibleMonthlyRhythmCard";
import { Container } from "@/components/site/Container";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import { Button } from "@/components/ui/Button";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Coaching options | Kaja",
  description:
    "Compare Kaja coaching options: diagnosis session, single sessions, and flexible monthly rhythm to build your Korean consistently.",
};

export default function CoachingPage() {
  return (
    <main className="py-12 sm:py-16">
      <Container>
        <RevealOnScroll as="section" className="space-y-8 sm:space-y-10">
          <StaggerReveal className="text-center">
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Coaching options
            </h1>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">
              Pick the way you want to work with Minjae: a one-time diagnosis,
              a focused single session, or an ongoing rhythm.
            </p>
          </StaggerReveal>

          <StaggerReveal
            as="div"
            className="mx-auto mt-4 grid max-w-5xl gap-6 text-left lg:grid-cols-3"
            staggerMs={110}
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex h-11 items-center gap-3">
                <div className="grid place-items-center rounded-2xl bg-(--included-1)/60 px-2 py-1">
                  <Image
                    width={30}
                    height={37.5}
                    src="/coffeeee.webp"
                    alt="Diagnosis"
                    className="-mt-0.5 ml-1"
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Diagnosis
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">$10</span>
                <span className="text-sm font-semibold text-foreground">
                  diagnosis
                </span>
              </div>
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                A one-time session to assess your level, identify issues,
                suggest a learning strategy, and recommend a program.
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-between">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Level check</li>
                  <li>• Problem analysis</li>
                  <li>• Learning strategy suggestion</li>
                  <li>• Program recommendation</li>
                  <li>• 50 min · One-time only</li>
                </ul>
                <div className="pt-6">
                  <Suspense
                    fallback={
                      <Button size="sm" disabled>
                        Be a member
                      </Button>
                    }
                  >
                    <CheckoutButton
                      product="trial"
                      size="sm"
                      variant="primary"
                      className="font-serif"
                    >
                      Be a member
                    </CheckoutButton>
                  </Suspense>
                </div>
              </div>
            </div>

            <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex h-11 items-center gap-3">
                <div className="grid place-items-center rounded-2xl bg-(--included-2)/60 p-2">
                  <Image
                    width={44}
                    height={28.15}
                    src="/cards.webp"
                    alt="Single Session"
                    className="text-foreground/80"
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Single Session
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">$15</span>
                <span className="text-sm text-muted-foreground">50 minutes</span>
              </div>
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                A focused coaching session to tackle a specific challenge.
                Practice real situations, build confidence, and move forward in
                your Korean.
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-between">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50 min</li>
                  <li>• Presentation practice, interview prep</li>
                  <li>• Tackle a specific problem, confidence building</li>
                  <li>• Pick a time · Valid for a month</li>
                </ul>
                <div className="pt-6">
                  <Suspense
                    fallback={
                      <Button size="sm" disabled>
                        Be a member
                      </Button>
                    }
                  >
                    <CheckoutButton
                      product="single"
                      size="sm"
                      variant="primary"
                      className="font-serif"
                    >
                      Be a member
                    </CheckoutButton>
                  </Suspense>
                </div>
              </div>
            </div>

            <FlexibleMonthlyRhythmCard />
          </StaggerReveal>
        </RevealOnScroll>
      </Container>
    </main>
  );
}

