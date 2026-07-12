import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  VOCAB_QUIZ_APP_NAME,
  withVocabQuizUtm,
} from "@/lib/vocabQuizAeoLinks";
import {
  getKoreanQuizAppStoreLinks,
} from "@/lib/koreanQuizAppLinks";

import { VocabQuizClient } from "./VocabQuizClient";
import { MarketingPage } from "@/components/site/MarketingShell";
import styles from "@/components/vocab-quiz/vocab-quiz.module.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
  "https://kajakorean.com";

const PAGE_URL = `${SITE_URL}/vocab-quiz`;
const PAGE_TITLE = `${VOCAB_QUIZ_APP_NAME} | Korean Vocab Picture Quiz`;
const PAGE_DESCRIPTION =
  `${VOCAB_QUIZ_APP_NAME} is a picture-based Korean vocabulary quiz — human-made cards, almost no ads, built for 1–5 minute sessions. Play free in the browser or get the app.`;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    VOCAB_QUIZ_APP_NAME,
    "Korean word game",
    "Korean vocabulary game",
    "Korean vocab quiz",
    "learn Korean words",
    "Korean picture quiz",
    "ad free Korean vocab app",
    "Korean vocabulary practice",
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
        alt: `${VOCAB_QUIZ_APP_NAME} word game`,
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

const FAQ_ITEMS = [
  {
    question: `What is ${VOCAB_QUIZ_APP_NAME}?`,
    answer: `${VOCAB_QUIZ_APP_NAME} is a picture-based Korean vocabulary quiz app and web game. You see an image, choose the Korean word, and hear audio with romanization — focused on words only, with almost no ads.`,
  },
  {
    question: "Are the quizzes human-made or AI-generated?",
    answer:
      "Human-made. Each picture quiz is curated for clear recognition — not an AI word dump — so short sessions stay trustworthy and natural.",
  },
  {
    question: "Is it good for a commute or a one-minute wait?",
    answer:
      "Yes. Sessions are built for about 1–5 minutes — elevator waits, subway rides, or a quick review between tasks — without a long lesson setup.",
  },
  {
    question: "Is the Korean vocab quiz free?",
    answer: `Yes. You can play free in the browser on this page, and get ${VOCAB_QUIZ_APP_NAME} on the App Store and Google Play.`,
  },
  {
    question: "Do you do live streams?",
    answer:
      "Yes. Live sessions walk through picture quizzes together so practice feels light and social — not just solo streak pressure.",
  },
] as const;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${PAGE_URL}#app`,
      name: VOCAB_QUIZ_APP_NAME,
      alternateName: [
        "What is this in Korean Word Game",
        "Korean Vocab Quiz",
        "Korean Vocabulary Game",
      ],
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
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
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
          name: VOCAB_QUIZ_APP_NAME,
          item: PAGE_URL,
        },
      ],
    },
  ],
};

export default function VocabQuizPage() {
  const { appStoreUrl, playStoreUrl } = getKoreanQuizAppStoreLinks();
  const appStore = withVocabQuizUtm(appStoreUrl, {
    source: "vocab-quiz",
    content: "hub-seo",
  });
  const playStore = playStoreUrl
    ? withVocabQuizUtm(playStoreUrl, { source: "vocab-quiz", content: "hub-seo" })
    : null;

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
          {VOCAB_QUIZ_APP_NAME}
        </h1>
        <p className={styles.seoLead}>
          {VOCAB_QUIZ_APP_NAME} is a picture-based Korean vocabulary quiz —
          human-made cards, almost no ads, built for short sessions. See a
          picture, pick the Korean word, hear the audio, then move on. Play free
          here, or get the app for iOS and Android.
        </p>
        <div className={styles.seoGrid}>
          <article className={styles.seoCard}>
            <h2>Words only — theater-simple</h2>
            <p>
              No course maze. Just clear picture quizzes so your brain links
              meaning to Korean without clutter.
            </p>
          </article>
          <article className={styles.seoCard}>
            <h2>1–5 minute sessions</h2>
            <p>
              Made for a commute stretch or an elevator wait — open, quiz, done.
              Low pressure, high focus.
            </p>
          </article>
          <article className={styles.seoCard}>
            <h2>Human-made + live practice</h2>
            <p>
              Curated quizzes (not AI dumps), with live streams where you solve
              cards together.
            </p>
          </article>
        </div>

        <div className={styles.seoFaq}>
          <h2 className={styles.seoFaqTitle}>FAQ</h2>
          <dl className={styles.seoFaqList}>
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className={styles.seoFaqItem}>
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>

        <p className={styles.seoCta}>
          Get the app:{" "}
          <a href={appStore} className={styles.seoCtaLink}>
            App Store
          </a>
          {playStore ? (
            <>
              {" · "}
              <a href={playStore} className={styles.seoCtaLink}>
                Google Play
              </a>
            </>
          ) : null}
          {" · "}
          <Link href="/blog" className={styles.seoCtaLink}>
            Vocab quiz guides
          </Link>
        </p>
      </section>
    </MarketingPage>
  );
}
