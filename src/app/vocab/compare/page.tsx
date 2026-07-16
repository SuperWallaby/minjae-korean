import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
import Link from "next/link";

import { VocabCompareHubCard } from "@/components/vocab-compare/VocabCompareArticle";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { listVocabComparePages } from "@/lib/vocabCompare/repo";
import { vocabCompareSiteBaseUrl } from "@/lib/vocabCompare/seo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = vocabCompareSiteBaseUrl();
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Korean Vocab Comparisons | What is this in Korean",
  description:
    "Picture-backed Korean word comparisons — similar vocabulary side by side with clear English contrasts from our quiz bank.",
  keywords:
    "korean vocabulary comparison, korean similar words, korean vs, what is the difference in korean",
  openGraph: {
    title: "Korean Vocab Comparisons | What is this in Korean",
    description:
      "Compare similar Korean words with illustrations, English glosses, and clear contrast notes.",
    url: `${SITE_URL}/vocab/compare`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/vocab/compare` },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function VocabCompareIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = await listVocabComparePages({
    page,
    pageSize: PAGE_SIZE,
  });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const playHref = vocabQuizPlayPath("vocab-compare-hub");

  const pageHref = (nextPage: number) =>
    nextPage > 1 ? `/vocab/compare?page=${nextPage}` : "/vocab/compare";

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Vocabulary"
            title="Vocab compare"
            lead="Similar Korean words side by side — each with a quiz illustration, English alt text, and a short contrast."
          />

          <p className="mt-4 text-sm text-[var(--quiz-text-sub)]">
            Prefer practice?{" "}
            <Link
              href={playHref}
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Open the vocab quiz
            </Link>
            .
          </p>

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--quiz-text-sub)]">
              No comparison pages ready yet. SEO-ready quizzes need images,
              explanations, and meaning embeddings.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--quiz-border)] rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
              {items.map((item) => (
                <li key={`${item.leftId}:${item.rightId}`}>
                  <VocabCompareHubCard {...item} />
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex items-center justify-between text-sm text-[var(--quiz-text-sub)]"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="hover:text-[var(--quiz-text)]">
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="hover:text-[var(--quiz-text)]">
                  Next →
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
