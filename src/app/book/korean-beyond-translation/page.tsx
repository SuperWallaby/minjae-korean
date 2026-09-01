import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE_NAME, SITE_NICHE } from "@/lib/siteBrand";
import { SITE_ORIGIN } from "@/lib/siteUrl";

import { BookLastPurchaseHint } from "@/components/payment/BookLastPurchaseHint";
import { BookDetailTabs } from "@/components/site/BookDetailTabs";
import { BookProductGallery } from "@/components/site/BookProductGallery";
import { BookTableOfContents } from "@/components/site/BookTableOfContents";
import homeStyles from "@/components/site/home-blog.module.css";
import { CheckoutButton } from "@/components/stripe/CheckoutButton";
import { BOOK_GALLERY_SLIDES } from "@/data/bookSamples";

const SITE_URL = SITE_ORIGIN;

export const metadata: Metadata = {
  title: {
    absolute: `Korean, Beyond Translation | ${SITE_NICHE} | ${SITE_NAME}`,
  },
  description:
    "A book on how Korean actually lands — tone, nuance, and study methods beyond dictionary translation. By Minjae.",
  alternates: {
    canonical: `${SITE_URL}/book/korean-beyond-translation`,
  },
  openGraph: {
    title: `Korean, Beyond Translation | ${SITE_NICHE} | ${SITE_NAME}`,
    description:
      "A book on how Korean actually lands — tone, nuance, and study methods beyond dictionary translation.",
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
    <div className={homeStyles.articleWrap}>
      <div className={homeStyles.bookColumn}>
        <p className="mb-6">
          <Link href="/" className={homeStyles.textLink}>
            ← About
          </Link>
        </p>

        <section className={homeStyles.bookHero}>
          <div className="min-w-0">
            <BookProductGallery
              slides={BOOK_GALLERY_SLIDES}
              priorityMain
              variant="detail"
              mainImageSizes="(max-width: 900px) 90vw, 340px"
            />
          </div>

          <div className="min-w-0">
            <BookLastPurchaseHint />
            <p className={homeStyles.bookEyebrow}>eBook · by Minjae</p>
            <h1 className={homeStyles.bookTitle}>
              Korean, Beyond Translation
            </h1>
            <p className={homeStyles.bookLede}>
              <strong>A book about how Korean actually lands,</strong> not
              just what the words translate to. Browse real chapter pages and
              see how nuance, softness, and social meaning are taught visually.
            </p>

            <ul className={homeStyles.bookMeta}>
              <li>Printable PDF</li>
              <li>English guidance</li>
              <li>Front + back cover</li>
              <li>10 preview pages</li>
            </ul>

            <div className={homeStyles.bookPrice}>
              <div className={homeStyles.bookPriceRow}>
                <span className={homeStyles.bookPriceWas}>$17.00</span>
                <span className={homeStyles.bookPriceNow}>$9.90</span>
              </div>
              <p className={homeStyles.bookPriceNote}>
                Intro price for the current launch window.
              </p>
              <React.Suspense
                fallback={
                  <button type="button" className={homeStyles.bookBuy} disabled>
                    Buy now for $9.90
                  </button>
                }
              >
                <CheckoutButton
                  product="book_launch"
                  size="md"
                  variant="ghost"
                  className={homeStyles.bookBuy}
                >
                  Buy now for $9.90
                </CheckoutButton>
              </React.Suspense>
            </div>
          </div>
        </section>

        <section className={homeStyles.bookSection}>
          <BookTableOfContents />
        </section>

        <section className={homeStyles.bookSection}>
          <BookDetailTabs />
        </section>

        <section className={homeStyles.bookSection}>
          <div className={homeStyles.bookAbout}>
            <div className={homeStyles.bookAboutPhoto}>
              <Image
                src="/placeholders/minjae-desk.jpg"
                alt="Portrait of Minjae"
                fill
                className="object-cover object-[center_18%]"
                unoptimized
              />
            </div>
            <div>
              <p className={homeStyles.bookSectionLabel}>About Minjae</p>
              <h2 className={homeStyles.bookSectionTitle}>
                Teaching the Korean that English usually flattens
              </h2>
              <p className={homeStyles.bookSectionBody}>
                This book follows the same teaching style as Minjae&apos;s
                notes: short, practical, and focused on how Korean actually
                feels in real conversation. Made for learners who already know
                some Korean but want more nuance, tone, and natural phrasing.
              </p>
              <div className={homeStyles.linkRow}>
                <Link href="/blog" className={homeStyles.textLink}>
                  Read the blog
                </Link>
                <Link href="/vocab-quiz" className={homeStyles.textLink}>
                  Play Game
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
