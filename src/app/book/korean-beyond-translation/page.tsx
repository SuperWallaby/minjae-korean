import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { BookLastPurchaseHint } from "@/components/payment/BookLastPurchaseHint";
import { BookDetailTabs } from "@/components/site/BookDetailTabs";
import { BookProductGallery } from "@/components/site/BookProductGallery";
import { BookTableOfContents } from "@/components/site/BookTableOfContents";
import { Container } from "@/components/site/Container";
import { MarketingPage } from "@/components/site/MarketingShell";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { Button } from "@/components/ui/Button";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { BOOK_GALLERY_SLIDES } from "@/data/bookSamples";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";

export const metadata: Metadata = {
  title: "Korean, Beyond Translation | Book Samples | Kaja",
  description:
    "Read sample pages from Korean, Beyond Translation by Minjae. Explore how the book teaches tone, nuance, and real Korean feeling beyond direct translation.",
  openGraph: {
    title: "Korean, Beyond Translation | Book Samples | Kaja",
    description:
      "Read sample pages from Korean, Beyond Translation by Minjae.",
    url: `${SITE_URL.replace(/\/+$/, "")}/book/korean-beyond-translation`,
    type: "website",
    images: [
      {
        url: "/book-samples/book-cover.png",
        width: 1985,
        height: 2807,
        alt: "Korean, Beyond Translation book cover",
      },
    ],
  },
};

export default function BookDetailPage() {
  return (
    <MarketingPage className="pb-20">
      <Container>
        <RevealOnScroll as="div">
          <Button asChild variant="ghost" size="sm" className="mb-6 px-0">
            <Link href="/" className="inline-flex items-center gap-2">
              <ArrowLeft className="size-4" />
              Go back
            </Link>
          </Button>
        </RevealOnScroll>

        <RevealOnScroll as="section">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start lg:gap-14">
            <div className="min-w-0">
              <BookProductGallery
                slides={BOOK_GALLERY_SLIDES}
                priorityMain
                variant="detail"
                previewFrameClassName="border-0 bg-transparent p-0"
              />
            </div>

            <div className="min-w-0 pt-2">
              <BookLastPurchaseHint />
              <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary/70">
                eBook
              </div>
              <h1 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                Korean, Beyond Translation
              </h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                <strong className="font-semibold text-foreground">
                  A book about how Korean actually lands,
                </strong>{" "}
                not just what the words translate to. Browse the real chapter
                pages and see how nuance, softness, and social meaning are
                taught visually.
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-border bg-muted/45 px-3 py-1.5 font-medium text-foreground">
                  Printable PDF
                </span>
                <span className="rounded-full border border-border bg-muted/45 px-3 py-1.5 font-medium text-foreground">
                  English guidance
                </span>
                <span className="rounded-full border border-border bg-muted/45 px-3 py-1.5 font-medium text-foreground">
                  Front + back cover included
                </span>
                <span className="rounded-full border border-border bg-muted/45 px-3 py-1.5 font-medium text-foreground">
                  10 preview pages
                </span>
              </div>

              <div className="mt-7 overflow-hidden rounded-3xl border border-[#edd4c7] bg-[linear-gradient(135deg,#fff8f4_0%,#fff1eb_42%,#ffe2d5_100%)] p-5 sm:p-6">
                <div className="inline-flex rounded-full bg-[#5b3427] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  Open launch price
                </div>
                <div className="mt-3 flex items-end gap-3">
                  <span className="text-lg text-[#9d786d] line-through">
                    $17.00
                  </span>
                  <span className="font-serif text-5xl font-semibold text-[#28140d]">
                    $9.90
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-[#7a564a]">
                  Intro price for the current launch window.
                </p>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <React.Suspense
                  fallback={
                    <Button size="md" disabled>
                      Buy now for $9.90
                    </Button>
                  }
                >
                  <CheckoutButton
                    product="book_launch"
                    size="md"
                    variant="primary"
                  >
                    Buy now for $9.90
                  </CheckoutButton>
                </React.Suspense>
              </div>
            </div>
          </div>
        </RevealOnScroll>

        <RevealOnScroll as="section" className="mt-14">
          <BookTableOfContents />
        </RevealOnScroll>

        <RevealOnScroll as="section" className="mt-12">
          <BookDetailTabs />
        </RevealOnScroll>

        <RevealOnScroll as="section" className="mt-14">
          <div className="rounded-4xl border border-border bg-included-1 px-6 py-8 sm:px-10 sm:py-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div className="flex justify-center lg:justify-start">
                <div className="relative size-[220px] overflow-hidden rounded-full border border-border bg-card shadow-(--shadow-card) sm:size-[280px]">
                  <Image
                    src="/placeholders/minjae-hero.webp"
                    alt="Portrait of Minjae"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/75">
                  About Minjae
                </div>
                <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  Teaching the Korean that English usually flattens
                </h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  This book follows the same teaching style as Minjae&apos;s
                  lessons: short, practical, and focused on how Korean actually
                  feels in real conversation. It is designed for learners who
                  already know some Korean but want more nuance, tone, and
                  natural phrasing.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild variant="primary">
                    <Link href="/vocab-quiz">Try the vocab quiz</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/news">Explore Kaja News</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </Container>
    </MarketingPage>
  );
}
