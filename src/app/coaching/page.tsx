import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/site/Container";
import { HomeHeroVideo } from "@/components/site/HomeHeroVideo";
import { MembersReviewsSection } from "@/components/site/StudentsReviewsSection";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { FlexibleMonthlyRhythmCard } from "@/components/stripe/FlexibleMonthlyRhythmCard";
import { Button } from "@/components/ui/Button";
import React from "react";

export const runtime = "nodejs";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

const META_KEYWORD = "Study Korean - Coaching";

export const metadata: Metadata = {
  title: `Coaching | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean - Coaching: 1:1 Korean coaching with Minjae. Set a clear direction, stay on track with encouragement, and grow with targeted practice. Not just a class—real coaching.",
  openGraph: {
    type: "website",
    siteName: "Kaja",
    title: `Coaching | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean - Coaching: 1:1 Korean coaching with Minjae. Set a clear direction, stay on track with encouragement, and grow with targeted practice.",
    url: `${SITE_URL}/coaching`,
    images: [
      { url: "/brand/og.png", width: 1200, height: 630, alt: "Kaja Coaching" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Coaching | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean - Coaching: 1:1 Korean coaching with Minjae. Set a clear direction, stay on track with encouragement, and grow with targeted practice.",
    images: ["/brand/og.png"],
  },
};

export default function CoachingPage() {
  return (
    <div className="space-y-12 md:space-y-24">
      {/* Coaching, not just a class */}

      <RevealOnScroll
        as="section"
        className="mt-12 md:mt-24 space-y-8 sm:space-y-10"
      >
        <StaggerReveal className="text-center">
          <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Coaching options
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Pick the way you want to work with Minjae: a one-time diagnosis, a
            focused single session, or an ongoing rhythm.
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
              A one-time session to assess your level, identify issues, suggest
              a learning strategy, and recommend a program.
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
                <React.Suspense
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
                </React.Suspense>
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
                <React.Suspense
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
                </React.Suspense>
              </div>
            </div>
          </div>

          <FlexibleMonthlyRhythmCard />
        </StaggerReveal>
      </RevealOnScroll>

      <RevealOnScroll
        as="section"
        id="approach"
        className="scroll-mt-24 py-10 sm:py-16"
      >
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className=" max-w-xl order-1 lg:order-1">
              <StaggerReveal>
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Coaching, not just a class
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                  Set a clear direction, and Keep you on track with
                  encouragement. Encourage you to practice and grow.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-included-2 p-6">
                    <div className="flex items-center gap-3">
                      <div className="order-1 text-sm font-semibold sm:order-2">
                        Direction
                      </div>
                      <Image
                        src="/talk1.webp"
                        alt="Start from a topic"
                        width={20}
                        height={20}
                        className="order-2 shrink-0 text-black/60 sm:order-1"
                      />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      We set where you&apos;re at and where to go next! <br />{" "}
                      Minjae will build your studying course. And keep you on
                      track.
                    </div>
                  </div>
                  <div className="rounded-3xl bg-included-3 p-6">
                    <div className="flex items-center gap-3">
                      <div className="order-1 text-sm font-semibold sm:order-2">
                        Targeted Practice
                      </div>
                      <Image
                        src="/pen-line.webp"
                        alt="Pronunciation and grammar focus"
                        width={18}
                        height={18}
                        className="order-2 shrink-0 text-black/60 sm:order-1"
                      />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Goal is building real sense of Korean. Practice with real
                      conversation in real situation.
                    </div>
                  </div>
                </div>
              </StaggerReveal>
            </div>
            <HomeHeroVideo />
          </div>
        </Container>
      </RevealOnScroll>

      {/* Reviews */}
      <RevealOnScroll as="div">
        <MembersReviewsSection />
      </RevealOnScroll>
    </div>
  );
}
