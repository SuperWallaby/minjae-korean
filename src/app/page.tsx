import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ArticleFeed } from "@/components/article/ArticleFeed";
import { BookHomeSection } from "@/components/site/BookHomeSection";
import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { listArticles } from "@/lib/articlesRepo";
import { sampleKoreanQuizHomeCards } from "@/lib/koreanQuiz/store";
import { MembersReviewsSection } from "../components/site/StudentsReviewsSection";
import { VocabQuizHomeSection } from "@/components/site/VocabQuizHomeSection";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** 1:1 session booking — set `true` when accepting new bookings again. */
const SESSION_BOOKING_OPEN = false;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Kaja | Let's Talk in Korean";
  const description =
    "1:1 Korean coaching with Minjae: assess your level, set your direction, and grow with encouragement and targeted practice. Book a coaching session and start speaking Korean today.";
  const url = SITE_URL.replace(/\/+$/, "");
  return {
    title,
    description,
    openGraph: {
      type: "website",
      siteName: "Kaja",
      title,
      description,
      url,
      images: [{ url: "/brand/og.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/brand/og.png"],
    },
  };
}

export default async function Home() {
  let news: Awaited<ReturnType<typeof listArticles>> = [];
  let vocabQuizCards: Awaited<ReturnType<typeof sampleKoreanQuizHomeCards>> = [];
  try {
    news = await listArticles(6);
  } catch {
    news = [];
  }
  try {
    vocabQuizCards = await sampleKoreanQuizHomeCards(12);
  } catch {
    vocabQuizCards = [];
  }
  return (
    <div className="space-y-12 md:space-y-24">
      {/* 1) Hero — vocab quiz app */}
      <VocabQuizHomeSection cards={vocabQuizCards} />

      {/* 2) Book */}
      <BookHomeSection />

      {/* 3) Author */}
      <RevealOnScroll
        as="section"
        id="approach"
        className="scroll-mt-24 py-10 sm:py-16"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <StaggerReveal className="max-w-2xl">
              <h6 className="text-sm font-semibold tracking-wide text-primary">
                About me
              </h6>
              <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Learn Korean with nuance, not just literal meaning
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                The meanings packed into Korean don&apos;t always survive the
                trip into English—translation can quietly strip away what
                really matters.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                I want to help you{" "}
                <strong className="font-semibold text-foreground">
                  understand Korean more deeply
                </strong>
                , not just swap words between languages.
              </p>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                I&apos;m always looking for ways to pass on the{" "}
                <strong className="font-semibold text-foreground">
                  real sense
                </strong>{" "}
                of what you&apos;re learning—simply, memorably, and with a bit
                of fun.
              </p>
            </StaggerReveal>

            <StaggerReveal
              className="flex justify-center lg:justify-end"
              delayMs={90}
            >
              <div className="relative size-[280px] overflow-hidden rounded-full border border-border bg-card shadow-(--shadow-card) sm:size-[340px]">
                <Image
                  src="/placeholders/minjae-hero.webp"
                  alt="Portrait of Minjae"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            </StaggerReveal>
          </div>
        </Container>
      </RevealOnScroll>

      {/* 4) News */}
      <RevealOnScroll as="section" className="bg-included-1 py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-12">
              <StaggerReveal
                as="div"
                className="flex w-full items-end justify-between"
                staggerMs={80}
              >
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Kaja News Practice Readings & Listening
                </h2>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  <Link href="/news">
                    More Articles <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </StaggerReveal>

              {news.length === 0 ? null : (
                <StaggerReveal
                  as="div"
                  className="mt-6 space-y-6"
                  staggerMs={90}
                  delayMs={80}
                >
                  <ArticleFeed articles={news} showMajor={false} />
                </StaggerReveal>
              )}
            </div>
          </div>
        </Container>
      </RevealOnScroll>

      {/* 5) Reviews */}
      <RevealOnScroll as="div">
        <MembersReviewsSection />
      </RevealOnScroll>

      {/* 6) Extras */}
      <RevealOnScroll as="section" className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <StaggerReveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                What to expect in a session
              </h2>
            </StaggerReveal>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
              <StaggerReveal
                as="div"
                className="grid gap-6 lg:col-span-3"
                staggerMs={120}
              >
                <div className="rounded-3xl bg-included-1 p-6">
                  <div className="flex items-center gap-3">
                    <Image
                      width={36}
                      height={37}
                      src="/note.webp"
                      alt="Notes"
                      className=" text-black/60"
                    />
                    <div className="text-sm font-semibold">Recap notes</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    A clean recap, will be sent to you right after the talk.
                  </div>
                  <Link
                    href="/recap/recap_mm0ln71w_tnf492"
                    className="mt-2 inline-block text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Check recap example
                  </Link>
                </div>
                <div className="rounded-3xl bg-included-2 p-6">
                  <div className="flex items-center gap-3">
                    {/* <Languages className="size-5 text-black/60" /> */}
                    <Image
                      width={44}
                      height={35}
                      src="/lang.webp"
                      alt="Auto translation"
                      className="w-11 text-black/60"
                    />
                    <div className="text-sm font-semibold">English support</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    When you get stuck, Minjae will help you with English don’t
                    worry about language barrier.{" "}
                  </div>
                </div>
              </StaggerReveal>

              <RevealOnScroll
                as="div"
                className="overflow-hidden rounded-3xl bg-card lg:col-span-6"
                delayMs={80}
              >
                <div className="relative aspect-4/3 w-full bg-muted/40">
                  <Image
                    src="/placeholders/okay-session.jpg"
                    alt="Included features placeholder"
                    fill
                    className="object-cover object-center"
                    unoptimized
                  />
                </div>
              </RevealOnScroll>

              <StaggerReveal
                as="div"
                className="grid gap-6 lg:col-span-3"
                staggerMs={120}
                delayMs={120}
              >
                <div className="rounded-3xl bg-included-3 p-6">
                  <div className="flex items-center gap-3">
                    <Image
                      src="/head.webp"
                      alt="Subtitles"
                      width={44}
                      height={44}
                      className="text-black/60"
                    />
                    <div className="text-sm font-semibold">Pronunciation</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Pronunciation and natural phrasing practice while you talk.
                  </div>
                </div>
                <div className="rounded-3xl bg-included-4 p-6">
                  <div className="flex items-center gap-3">
                    <Image
                      width={44}
                      height={37}
                      src="/edit.webp"
                      alt="Corrections"
                      className="text-black/60"
                    />
                    <div className="text-sm font-semibold">Corrections</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Clear corrections so mistakes don’t repeat. Practice the
                    better version.
                  </div>
                </div>
              </StaggerReveal>
            </div>
          </div>
        </Container>
      </RevealOnScroll>

      {/* 7) CTA */}
      <RevealOnScroll as="section" className="py-10 sm:py-14">
        <Container>
          <StaggerReveal className="mx-auto max-w-3xl text-center">
            <Image
              width={140}
              height={140}
              src="/meme/offical/kaja.webp"
              alt="Kaja – 1:1 Korean coaching"
              className="mx-auto  -mt-8"
            ></Image>
            <h2 className="font-serif text-4xl font-medium leading-[1.22] tracking-tight sm:text-5xl">
              Start talking with Minjae.
            </h2>
            {!SESSION_BOOKING_OPEN ? (
              <p className="mt-3 text-base font-medium text-foreground/90 sm:text-lg">
                1:1 sessions are paused for now.
              </p>
            ) : null}
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {SESSION_BOOKING_OPEN ? (
                <>
                  No pressure. Pick a time, get direction and encouragement, and
                  keep growing.
                </>
              ) : (
                <>
                  Session booking is paused for now. You can still explore the
                  book and news practice below.
                </>
              )}
            </p>
            <div className="mx-auto mt-6 flex flex-row flex-nowrap items-center justify-center gap-3">
              {SESSION_BOOKING_OPEN ? (
                <Button
                  asChild
                  size="md"
                  variant="primary"
                  className="w-fit bg-black px-4 text-white hover:bg-black/90"
                >
                  <Link href="/booking">Pick a time</Link>
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="primary"
                  disabled
                  className="w-fit bg-black px-4 text-white"
                >
                  Pick a time
                </Button>
              )}
              <Button
                asChild
                size="md"
                variant="outline"
                className="w-fit border-black/25 px-4 text-foreground hover:bg-[color-mix(in_srgb,black_4%,transparent)]"
              >
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </StaggerReveal>
        </Container>
      </RevealOnScroll>

      {/* 8) Q&A */}
      <RevealOnScroll as="section" className="py-10 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <StaggerReveal>
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Frequently asked questions
                </h2>
                <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                  A few practical details, so you know what to expect.
                </p>
              </StaggerReveal>
            </div>

            <div className="lg:col-span-8">
              <StaggerReveal
                as="div"
                className="border-t border-border/70"
                staggerMs={70}
              >
                {[
                  {
                    q: "What happens in a typical coaching session?",
                    a: "We start with a simple check-in and a topic for the day. Then we talk, practice Korean in real situations, and make small corrections along the way. At the end, Minjae gives a short recap and direction for what to focus on next.",
                  },
                  {
                    q: "What level is this for?",
                    a: (
                      <>
                        All levels are welcome. Coaching works best once you’ve
                        built a basic{" "}
                        <Link
                          href="/fundamental"
                          className="font-medium text-primary underline underline-offset-2 hover:no-underline"
                        >
                          foundation
                        </Link>{" "}
                        in Korean, but Minjae will meet you where you are and
                        help you move forward.
                      </>
                    ),
                  },
                  {
                    q: "How do I book a session?",
                    a: "Choose a time on the booking page. After booking, you’ll receive a Google Meet link for your session.",
                  },
                  {
                    q: "How long is each coaching session?",
                    a: "You can choose either 25 minutes or 50 minutes when booking.",
                  },
                  {
                    q: "Do I need to prepare anything?",
                    a: "No special preparation is required. Just join the session ready to talk. If you have something specific you want to work on, you can bring it.",
                  },
                  {
                    q: "Do I get a recap after the session?",
                    a: "Yes. Minjae sends a short recap with notes and suggestions right after the session.",
                  },
                ].map((item) => (
                  <details
                    key={item.q}
                    className="group border-b border-border/70"
                  >
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-5 font-serif text-lg font-semibold tracking-tight text-foreground">
                      <span>{item.q}</span>
                      <span className="text-xl text-muted-foreground transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="mb-5 text-base leading-7 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </StaggerReveal>
            </div>
          </div>
        </Container>
      </RevealOnScroll>
    </div>
  );
}
