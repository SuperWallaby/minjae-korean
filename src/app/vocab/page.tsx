import type { Metadata } from "next";
import Link from "next/link";

import { VocabSeoHubCard } from "@/components/vocab-infographic/VocabSeoArticle";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { SITE_NAME } from "@/lib/siteBrand";
import { listVocabSeoPages } from "@/lib/vocabInfographic/repo";
import {
  buildVocabSeoHubBreadcrumbJsonLd,
  vocabSeoHubBreadcrumbItems,
  vocabSeoSiteBaseUrl,
} from "@/lib/vocabInfographic/seo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = vocabSeoSiteBaseUrl();
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Korean Vocab Charts | What is this in Korean",
  description:
    "Picture-backed Korean vocabulary groups and comparisons — antonyms, themed word grids, and learner charts.",
  keywords:
    "korean vocabulary chart, korean antonyms, korean word groups, fresh vs stale korean, learn korean vocabulary",
  openGraph: {
    title: "Korean Vocab Charts | What is this in Korean",
    description:
      "Browse Korean word groups and comparisons with clear picture charts.",
    url: `${SITE_URL}/vocab`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/vocab` },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function VocabSeoIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = listVocabSeoPages({ page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const playHref = vocabQuizPlayPath("vocab-hub");

  const pageHref = (nextPage: number) =>
    nextPage > 1 ? `/vocab?page=${nextPage}` : "/vocab";

  const breadcrumbJsonLd = buildVocabSeoHubBreadcrumbJsonLd(SITE_URL);

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketingShell>
        <MarketingShellBody>
          <Breadcrumb items={vocabSeoHubBreadcrumbItems()} />
          <MarketingHeader
            eyebrow="Vocabulary"
            title="Vocab charts"
            lead="Grouped Korean words and comparisons — picture charts for themes like fresh vs stale, workplace rooms, and more."
          />

          <p className="mt-4 text-sm text-[var(--quiz-text-sub)]">
            Prefer practice?{" "}
            <Link
              href={playHref}
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Open the vocab quiz
            </Link>
            {" · "}
            <Link
              href="/vocab/compare"
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Word comparisons
            </Link>
            .
          </p>

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--quiz-text-sub)]">
              No charts published yet. Run{" "}
              <code className="rounded bg-[var(--quiz-surface-muted)] px-1.5 py-0.5 text-xs">
                yarn vocab:publish
              </code>{" "}
              after infographic images exist in{" "}
              <code className="rounded bg-[var(--quiz-surface-muted)] px-1.5 py-0.5 text-xs">
                .tmp/vocab-infographic-gen
              </code>
              .
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--quiz-border)] rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
              {items.map((item) => (
                <li key={item.bundleId}>
                  <VocabSeoHubCard page={item} />
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
                Page {page} of {totalPages} ({total})
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
