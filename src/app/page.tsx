import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Suspense } from "react";

import { ArticleFeed } from "@/components/article/ArticleFeed";
import { Container } from "@/components/site/Container";
import { HomeHeroVideo } from "@/components/site/HomeHeroVideo";
import { Button } from "@/components/ui/Button";
import { listArticles } from "@/lib/articlesRepo";
import { MembersReviewsSection } from "../components/site/StudentsReviewsSection";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const title = "Kaja | Let's Talk in Korean";
  const description =
    "A friendly place to practice Korean through 1:1 conversation and build real confidence. Book a session and start speaking Korean today.";
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
  try {
    news = await listArticles(6);
  } catch {
    news = [];
  }
  return (
    <div className="space-y-24">
      {/* 1) Hero (1 column) */}
      <section className="pt-16 sm:pt-24">
        <Container className="relative">
          <StaggerReveal className="relative mx-auto max-w-4xl text-center">
            <div className="text-sm font-semibold tracking-wide text-primary">
              Daily Korean Practice
            </div>
            <h1 className="mt-5  font-serif text-4xl font-medium leading-[1.22] tracking-tight sm:text-6xl">
              Talk in Korean with Minjae.
            </h1>
            <div className="mt-4 text-muted-foreground">
              A place to speak Korean in real life.
            </div>

            {/* keywords hidden for now */}

            <div className="mt-10 overflow-hidden rounded-3xl bg-card">
              <div className="relative aspect-video w-full">
                <Image
                  src="/placeholders/minjae-hero.webp"
                  alt="Minjae placeholder photo"
                  fill
                  priority
                  className="object-cover object-top"
                  unoptimized
                />
              </div>
            </div>
          </StaggerReveal>
        </Container>
      </section>

      {/* 2) Context-first talking */}
      <RevealOnScroll
        as="section"
        id="approach"
        className="scroll-mt-24 py-10 sm:py-16"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 max-w-xl lg:order-1">
              <StaggerReveal>
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Real conversation, not studying
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                  Instead of studying, just start real conversation. <br />{" "}
                  Becomes natural through 1:1 session.
                </p>
                <div className="mt-7 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl bg-included-2 p-6">
                    <div className="flex items-center gap-3">
                      <div className="order-1 text-sm font-semibold sm:order-2">
                        Friendly Talking
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
                      Minjae will bring up a right topic for you to talk about.
                    </div>
                  </div>
                  <div className="rounded-3xl bg-included-3 p-6">
                    <div className="flex items-center gap-3">
                      <div className="order-1 text-sm font-semibold sm:order-2">
                        Refine it while you talk
                      </div>
                      <Image
                        src="/pen-line.webp"
                        alt="Refine it while you talk"
                        width={18}
                        height={18}
                        className="order-2 shrink-0 text-black/60 sm:order-1"
                      />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Small corrections you can reuse immediately, and we
                      practice it together.
                    </div>
                  </div>
                </div>
              </StaggerReveal>
            </div>
            <HomeHeroVideo />
          </div>
        </Container>
      </RevealOnScroll>

      {/* 3) Reviews */}
      <RevealOnScroll as="div">
        <MembersReviewsSection />
      </RevealOnScroll>

      {/* 4) Pricing */}
      <RevealOnScroll
        as="section"
        id="ways-to-use"
        className="scroll-mt-24 py-10 sm:py-16"
      >
        <Container>
          <StaggerReveal className="text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Class passes
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base"></p>
          </StaggerReveal>

          <StaggerReveal
            as="div"
            className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3 text-left"
            staggerMs={110}
          >
            <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex items-center gap-3 h-11">
                <div className="grid px-2 py-1 place-items-center rounded-2xl bg-(--included-1)/60">
                  <Image
                    width={30}
                    height={37.5}
                    src="/coffeeee.webp"
                    alt="First time"
                    className=" -mt-0.5 ml-1 "
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  First time
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  $10
                </span>
                <span className="text-sm text-foreground font-semibold">
                  for a first time
                </span>
              </div>
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                A gentle first talk to see how you currently use Korean, and set
                a simple direction.
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-between">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50 min</li>
                  <li>• Only available for first time.</li>
                  <li>• Pick a time, when you want to talk</li>
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
              <div className="flex items-center gap-3 h-11">
                <div className="grid p-2 place-items-center rounded-2xl bg-(--included-2)/60">
                  <Image
                    width={44}
                    height={28.15}
                    src="/cards.webp"
                    alt="Flexible"
                    className=" text-foreground/80"
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Flexible
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  $15
                </span>
                <span className="text-sm text-muted-foreground">
                  50 minutes
                </span>
              </div>
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                A flexible way to use Korean, purchase more when you want to
                talk.
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-between">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• 50 min</li>
                  <li>• Pick a time, when you want to talk</li>
                  <li>• Valid for a month</li>
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

            <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex items-center gap-3 h-11">
                <div className="grid p-2 place-items-center rounded-2xl bg-(--included-3)/60">
                  <Image
                    width={35}
                    height={25}
                    src="/stars.webp"
                    alt="Monthly Rhythm"
                    className="text-foreground/80"
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Monthly Rhythm
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  $98
                </span>
                <span className="text-sm text-muted-foreground">
                  16 times × 25 min
                </span>
              </div>
              <div className="mt-4 text-sm leading-7 text-muted-foreground">
                A steady routine for continuity. Ideal if you like a simple
                monthly cadence.
              </div>
              <div className="mt-8 flex flex-1 flex-col justify-between">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Book a time, when you want to talk</li>
                  <li>• Continuity (same style, same flow)</li>
                  <li>• Valid for a month</li>
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
                      product="monthly"
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
          </StaggerReveal>
        </Container>
      </RevealOnScroll>

      {/* 5) Extras */}
      <RevealOnScroll as="section" className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <StaggerReveal className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                What to expect in our session
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

      {/* 6) Q&A */}
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
                    q: "What happens in a typical session?",
                    a: "We start from a topic minjae will bring up, talk it through, and keep the flow. Minjae will write small corrections you can reuse immediately, then we end with a simple recap.",
                  },
                  {
                    q: "What level is this for?",
                    a: "This course is suitable for learners who can already speak Korean. You don’t need to be good at Korean, but it’s ideal if you’ve already finished the very beginner level.",
                  },
                  {
                    q: "How to book a time?",
                    a: "After booking, you’ll get a Google Meet link. Simply join at your scheduled time, and we’ll begin.",
                  },
                  {
                    q: "How long it takes?",
                    a: "25 or 50 minutes, you can choose the duration when you book a time.",
                  },
                  {
                    q: "What should be prepared for thes session?",
                    a: "To keep the conversation smooth, you should be able to use very beginner level Korean.",
                  },
                  {
                    q: "Do I get a recap?",
                    a: "Yes. You’ll get recap! Minjae will write a summary of the session, and send it to you right after the session.",
                  },
                ].map((item) => (
                  <details
                    key={item.q}
                    className="group border-b border-border/70"
                  >
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 font-serif text-lg font-semibold tracking-tight text-foreground py-5">
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

      {/* 8) CTA */}
      <RevealOnScroll as="section" className="py-10 sm:py-14">
        <Container>
          <StaggerReveal className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-4xl font-medium leading-[1.22] tracking-tight sm:text-5xl">
              Start practicing with Minjae.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              No pressure. Pick a time, talk about a topic, and keep the habit
              going.
            </p>
            <div className="mx-auto mt-6 flex flex-row flex-nowrap items-center justify-center gap-3">
              <Button
                asChild
                size="md"
                variant="primary"
                className="w-fit bg-black px-4 text-white hover:bg-black/90"
              >
                <Link href="/booking">Pick a time</Link>
              </Button>
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

      {/* 9) Posts — 메이저 카드 + 3단 그리드 */}
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
                  Learn With Kaja News
                </h2>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  <Link href="/news">
                    More <ArrowRight className="size-4" />
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
    </div>
  );
}
