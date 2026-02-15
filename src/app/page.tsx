import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { Suspense } from "react";

import { Container } from "@/components/site/Container";
import { Button } from "@/components/ui/Button";
import { posts } from "@/lib/posts";
import { MembersReviewsSection } from "../components/site/StudentsReviewsSection";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";

function postThumb(slug: string) {
  if (slug.includes("freezing")) return "/placeholders/post-1.svg";
  if (slug.includes("phrasing")) return "/placeholders/post-2.svg";
  return "/placeholders/post-3.svg";
}

export default function Home() {
  return (
    <div className="space-y-24">
      {/* 1) Hero (1 column) */}
      <RevealOnScroll as="section" className="pt-16 sm:pt-24">
        <Container className="relative">
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="text-sm font-semibold tracking-wide text-primary">
              Daily Korean Practice
            </div>
            <h1 className="mt-5 font-serif text-4xl font-medium leading-[1.22] tracking-tight sm:text-6xl">
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
          </div>
        </Container>
      </RevealOnScroll>

      {/* 2) Context-first talking */}
      <RevealOnScroll
        as="section"
        id="approach"
        className="scroll-mt-24 py-10 sm:py-16"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="order-2 max-w-xl lg:order-1">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Talk in real life
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                Instead of “studying Korean”, be free to talk. <br />
                Be freindly with Korean.
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <div className="rounded-3xl bg-included-2 p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src="/talk1.webp"
                      alt="Start from a topic"
                      className="size-5 text-black/60"
                    />
                    <div className="text-sm font-semibold">
                      Start from a topic
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Minjae will bring up a right topic for you to talk about.
                  </div>
                </div>
                <div className="rounded-3xl bg-included-3 p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src="/pen-line.webp"
                      alt="Refine it while you talk"
                      className="w-4.5 text-black/60"
                    />
                    <div className="text-sm font-semibold">
                      Refine it while you talk
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Small corrections you can reuse immediately, and we practice
                    it together.
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 overflow-hidden rounded-3xl border border-border bg-muted/60 lg:order-2">
              <div className="relative aspect-video w-full">
                <Image
                  src="/placeholders/minjae-hero.jpg"
                  alt="Minjae placeholder video"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="pointer-events-none absolute inset-0 grid place-items-center">
                  <div className="grid size-16 place-items-center rounded-full bg-white/70 ring-1 ring-black/10 backdrop-blur-sm">
                    <Play
                      className="size-6 text-foreground/80"
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>
            </div>
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
          <h2 className="text-center font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Ways to use Korean
          </h2>
          <p className="mt-3 text-center text-sm text-muted-foreground sm:text-base">
            Pick a rhythm that fits. The focus stays on using Korean with
            content.
          </p>

          <div className="mx-auto mt-10 grid max-w-5xl gap-6 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex items-center gap-3">
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
              <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
                <li>• 50 min</li>
                <li>• Only available for first time.</li>
                <li>• Pick a time, when you want to talk</li>
              </ul>
              <div className="mt-6">
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

            <div className="relative overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex items-center gap-3">
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
              <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
                <li>• 50 min</li>
                <li>• Pick a time, when you want to talk</li>
                <li>• Valid for a month</li>
              </ul>
              <div className="mt-6">
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

            <div className="relative overflow-hidden rounded-[36px] border border-border bg-white p-6 shadow-(--shadow-float)">
              <div className="flex items-center gap-3">
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
              <ul className="mt-8 space-y-2 text-sm text-muted-foreground">
                <li>• Book a time, when you want to talk</li>
                <li>• Continuity (same style, same flow)</li>
                <li>• Valid for a month</li>
              </ul>
              <div className="mt-6">
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
        </Container>
      </RevealOnScroll>

      {/* 5) Extras */}
      <RevealOnScroll as="section" className="py-10 sm:py-16">
        <Container>
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                While you talk
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Everything is designed to keep momentum.
              </p>
              <p className="mt-4 text-sm leading-7 text-muted-foreground">
                Support tools are light, fast, and practical—so you can keep
                talking while still capturing what matters.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-stretch">
              <div className="grid gap-6 lg:col-span-3">
                <div className="rounded-3xl bg-included-1 p-6">
                  <div className="flex items-center gap-3">
                    <Image
                      width={36}
                      height={37}
                      src="/note.webp"
                      alt="Notes"
                      className=" text-black/60"
                    />
                    <div className="text-sm font-semibold">Talk notes</div>
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
                    When you get stuck, Minjae will help you with English.
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl bg-card lg:col-span-6">
                <div className="relative aspect-4/3 w-full bg-muted/40">
                  <Image
                    src="/placeholders/okay-session.jpg"
                    alt="Included features placeholder"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>

              <div className="grid gap-6 lg:col-span-3">
                <div className="rounded-3xl bg-included-3 p-6">
                  <div className="flex items-center gap-3">
                    <img
                      src="/head.webp"
                      alt="Subtitles"
                      className="w-11 text-black/60"
                    />
                    <div className="text-sm font-semibold">Subtitles</div>
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
              </div>
            </div>
          </div>
        </Container>
      </RevealOnScroll>

      {/* 6) Q&A */}
      <RevealOnScroll as="section" className="py-10 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-4">
              <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Frequently asked questions
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                A few practical details, so you know what to expect.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="border-t border-border/70">
                {[
                  {
                    q: "What happens in a typical talk?",
                    a: "We start from a topic minjae will bring up, talk it through, and keep the flow. I’ll write small corrections you can reuse immediately, then we end with a simple recap.",
                  },
                  {
                    q: "What level is this for?",
                    a: "This course is suitable for learners who can already speak Korean. You don’t need to be good at Korean, but it’s ideal if you’ve already finished the very beginner level.",
                  },
                  {
                    q: "How do I prepare?",
                    a: "Open your mind and be ready to talk. Minjae will bring up a topic and we will talk about it.",
                  },
                  {
                    q: "Do I get a recap?",
                    a: "Yes. You’ll get a short recap with key phrases, small corrections, and a simple next-step to continue.",
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
                    <div className="mb-4 text-base leading-7 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </RevealOnScroll>

      {/* 8) CTA */}
      <RevealOnScroll as="section" className="py-10 sm:py-14">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
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
          </div>
        </Container>
      </RevealOnScroll>

      {/* 9) Posts */}
      <RevealOnScroll as="section" className="bg-included-1 py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-12">
              <div className="flex w-full items-end justify-between">
                <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Learn With Kaja News
                </h2>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                >
                  <Link href="/posts">
                    More <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.slice(0, 3).map((p) => (
                  <Link
                    key={p.slug}
                    href={`/posts/${p.slug}`}
                    className="group rounded-3xl bg-white/50 p-4 outline-none transition hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-card">
                      <Image
                        src={postThumb(p.slug)}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      {new Date(p.dateISO).toLocaleDateString()} ·{" "}
                      {p.readingTimeMin} min
                    </div>
                    <div className="mt-2 font-serif text-base font-semibold tracking-tight text-foreground">
                      {p.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </RevealOnScroll>
    </div>
  );
}
