import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";

import { VocabQuizClient } from "./VocabQuizClient";
import { MarketingPage } from "@/components/site/MarketingShell";
import styles from "@/components/vocab-quiz/vocab-quiz.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://kajakorean.com";

const PAGE_URL = `${SITE_URL}/vocab-quiz`;
const PAGE_TITLE = "Korean Word Game | Learn Korean Vocabulary with What is this in Korean";
const PAGE_DESCRIPTION =
  "Play a Korean word game for vocabulary learning. Practice Korean vocab with pictures, audio, romanization, and multiple-choice quizzes in manual or auto mode.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "Korean word game",
    "Korean vocabulary game",
    "Korean vocab quiz",
    "learn Korean words",
    "Korean vocabulary practice",
    "Korean flashcards",
    "Korean word learning",
    "TOPIK vocabulary practice",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "What is this in Korean word game",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: ["/brand/og.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#app`,
      name: "What is this in Korean Word Game",
      alternateName: ["Korean Vocab Quiz", "Korean Vocabulary Game"],
      url: PAGE_URL,
      applicationCategory: "EducationalApplication",
      operatingSystem: "Web, iOS, Android",
      description: PAGE_DESCRIPTION,
      inLanguage: "en",
      educationalLevel: "Beginner to intermediate Korean learners",
      teaches: [
        "Korean vocabulary",
        "Korean word recognition",
        "Korean pronunciation",
        "Korean listening practice",
      ],
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      publisher: {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the What is this in Korean word game?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "It is a Korean vocabulary game that helps learners practice Korean words with pictures, audio, romanization, and multiple-choice quizzes.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use it to learn Korean vocabulary?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The game is designed for Korean vocabulary learning and word review, with manual mode for careful practice and auto mode for fast repetition.",
          },
        },
        {
          "@type": "Question",
          name: "Is the Korean vocab quiz free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. You can play the Korean vocab quiz in your browser for free.",
          },
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${PAGE_URL}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: SITE_URL,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Korean Word Game",
          item: PAGE_URL,
        },
      ],
    },
  ],
};

export default function VocabQuizPage() {
  return (
    <MarketingPage containerClassName="max-w-6xl" className="pb-8 pt-4 sm:pt-6">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <VocabQuizClient />
      <section className={styles.seoSection} aria-labelledby="korean-word-game-title">
        <p className={styles.seoEyebrow}>Korean vocabulary practice</p>
        <h1 id="korean-word-game-title" className={styles.seoTitle}>
          Korean Word Game for Vocab Learning
        </h1>
        <p className={styles.seoLead}>
          Play a fast Korean word game made for vocabulary learning. Practice
          Korean vocab with pictures, audio, romanization, and multiple-choice
          answers so each word feels easier to remember.
        </p>
        <div className={styles.seoGrid}>
          <article className={styles.seoCard}>
            <h2>Learn Korean words with pictures</h2>
            <p>
              Match Korean words to visual prompts and build recognition through
              short, repeatable quiz rounds.
            </p>
          </article>
          <article className={styles.seoCard}>
            <h2>Practice Korean pronunciation</h2>
            <p>
              Listen to Korean audio while reviewing the answer, romanization,
              and English meaning.
            </p>
          </article>
          <article className={styles.seoCard}>
            <h2>Choose manual or auto mode</h2>
            <p>
              Use manual mode for focused Korean vocab study, or auto mode for a
              hands-free word review session.
            </p>
          </article>
        </div>
      </section>
    </MarketingPage>
  );
}
