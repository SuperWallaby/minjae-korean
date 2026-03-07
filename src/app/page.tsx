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
import { FlexibleMonthlyRhythmCard } from "@/components/stripe/FlexibleMonthlyRhythmCard";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { StaggerReveal } from "@/components/ui/StaggerReveal";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
  try {
    news = await listArticles(6);
  } catch {
    news = [];
  }
  return (
    <div className="space-y-12 md:space-y-24">
      {/* 1) Hero (1 column) */}
      <section className="pt-16 sm:pt-24">
        <Container className="relative">
          <StaggerReveal className="relative mx-auto max-w-4xl text-center">
            <div className="text-sm font-semibold tracking-wide text-primary">
              Kaja · 1:1 Korean Coaching
            </div>
            <h1 className="mt-5  font-serif text-4xl font-medium leading-[1.22] tracking-tight sm:text-6xl">
              Talk in Korean with Minjae.
            </h1>
            <div className="mt-4 text-muted-foreground">
              Set your direction, build confidence, and grow with encouragement.
            </div>

            {/* keywords hidden for now */}

            <div className="mt-10 overflow-hidden rounded-3xl bg-card">
              <div className="relative aspect-video w-full">
                <Image
                  src="/placeholders/minjae-hero.webp"
                  alt="Minjae placeholder photo"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 50vw"
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
          <div className="grid gap-10 gap-8 lg:grid-cols-2 lg:items-center">
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
                      We set where you’re at and where to go next! <br /> Minjae
                      will build your studying course. And keep you on track.
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
              Coaching options
            </h2>
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
                    alt="Diagnosis"
                    className=" -mt-0.5 ml-1 "
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Diagnosis
                </div>
              </div>
              <div className="mt-5 flex items-baseline gap-2">
                <span className="text-3xl font-semibold tracking-tight">
                  $10
                </span>
                <span className="text-sm text-foreground font-semibold">
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
              <div className="flex items-center gap-3 h-11">
                <div className="grid p-2 place-items-center rounded-2xl bg-(--included-2)/60">
                  <Image
                    width={44}
                    height={28.15}
                    src="/cards.webp"
                    alt="Single Session"
                    className=" text-foreground/80"
                  />
                </div>
                <div className="font-serif text-base font-semibold tracking-tight">
                  Single Session
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
        </Container>
      </RevealOnScroll>

      {/* 5) Extras */}
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
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              No pressure. Pick a time, get direction and encouragement, and
              keep growing.
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
                  Kaja News
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
    </div>
  );
}
