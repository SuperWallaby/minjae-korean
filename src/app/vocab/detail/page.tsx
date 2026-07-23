import type { Metadata } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { VocabDifferenceHubCard } from "@/components/vocab-detail/VocabDifferenceArticle";
import { VocabHowToSayHubCard } from "@/components/vocab-detail/VocabHowToSayArticle";
import { SITE_NAME } from "@/lib/siteBrand";
import {
  differenceBetweenTitleEn,
  howToSayVocabTitleEn,
  slugifyDifferencePair,
  vocabDetailSiteBaseUrl,
} from "@/lib/vocabDetail/slug";
import { listVocabComparePages } from "@/lib/vocabCompare/repo";
import { listWhenToUsePages } from "@/lib/whenToUse/repo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = vocabDetailSiteBaseUrl();
const PREVIEW_COUNT = 8;

export const metadata: Metadata = {
  title: "Korean Vocab Detail | What is this in Korean",
  description:
    "Korean vocabulary SEO guides — difference between similar words, and how to say everyday English words in Korean, with quiz illustrations.",
  keywords:
    "difference between in korean, how to say in korean, korean vocabulary, korean word comparison",
  openGraph: {
    title: "Korean Vocab Detail | What is this in Korean",
    description:
      "Difference between similar Korean words, and how to say English words in Korean — with pictures and examples.",
    url: `${SITE_URL}/vocab/detail`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/vocab/detail` },
};

export default async function VocabDetailHubPage() {
  const [{ items: compareItems }, { items: howToSaySource }] = await Promise.all([
    listVocabComparePages({ page: 1, pageSize: PREVIEW_COUNT }),
    listWhenToUsePages({ page: 1, pageSize: PREVIEW_COUNT }),
  ]);

  const differenceItems = compareItems.map((item) => ({
    ...item,
    slug: slugifyDifferencePair(item.left.english, item.right.english),
    titleEn: differenceBetweenTitleEn(item.left.english, item.right.english),
  }));

  const howToSayItems = howToSaySource.map((item) => ({
    ...item,
    titleEn: howToSayVocabTitleEn(item.english),
  }));

  const playHref = vocabQuizPlayPath("vocab-detail-hub");

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Vocab detail" },
            ]}
          />
          <MarketingHeader
            eyebrow="Vocabulary"
            title="Vocab detail"
            lead="Two SEO formats from our quiz bank: difference between similar words, and how to say everyday English in Korean."
          />

          <p className="mt-4 text-sm text-[var(--quiz-text-sub)]">
            Prefer practice?{" "}
            <Link
              href={playHref}
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              More Quiz
            </Link>
            .
          </p>

          <section className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--quiz-text)]">
              Difference between…
            </h2>
            {differenceItems.length === 0 ? (
              <p className="text-sm text-[var(--quiz-text-sub)]">
                No difference pages ready yet.
              </p>
            ) : (
              <div className="divide-y divide-[var(--quiz-border)] overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
                {differenceItems.map((item) => (
                  <VocabDifferenceHubCard
                    key={`${item.leftId}-${item.rightId}`}
                    {...item}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-12 space-y-4">
            <h2 className="text-lg font-semibold text-[var(--quiz-text)]">
              How to say… in Korean
            </h2>
            {howToSayItems.length === 0 ? (
              <p className="text-sm text-[var(--quiz-text-sub)]">
                No how-to-say pages ready yet.
              </p>
            ) : (
              <div className="divide-y divide-[var(--quiz-border)] overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
                {howToSayItems.map((item) => (
                  <VocabHowToSayHubCard key={item.id} {...item} />
                ))}
              </div>
            )}
          </section>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
