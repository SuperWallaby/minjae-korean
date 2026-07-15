import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
import Link from "next/link";

import { WhenToUseHubCard } from "@/components/when-to-use/WhenToUseArticle";
import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { listWhenToUsePages } from "@/lib/whenToUse/repo";
import { whenToUseSiteBaseUrl } from "@/lib/whenToUse/seo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = whenToUseSiteBaseUrl();
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "When to Use Korean Words | What is this in Korean",
  description:
    "Picture-backed guides for Korean vocabulary — when to use each word, with example sentences and audio from our quiz bank.",
  keywords:
    "when to use in korean, korean vocabulary, korean example sentences, what is this called in korean",
  openGraph: {
    title: "When to Use Korean Words | What is this in Korean",
    description:
      "Learn when to use Korean words with clear English explanations, real examples, and audio.",
    url: `${SITE_URL}/when-to-use`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/when-to-use` },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function WhenToUseIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = await listWhenToUsePages({ page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const playHref = vocabQuizPlayPath("when-to-use-hub");

  const pageHref = (nextPage: number) =>
    nextPage > 1 ? `/when-to-use?page=${nextPage}` : "/when-to-use";

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Vocabulary"
            title="When to use"
            lead="SEO guides for Korean words from our approved quiz bank — meaning, timing, example sentences, and audio."
          />

          <p className="mt-4 text-sm text-[var(--quiz-text-sub)]">
            Prefer practice?{" "}
            <Link href={playHref} className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline">
              Open the vocab quiz
            </Link>
            .
          </p>

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--quiz-text-sub)]">
              No word guides ready yet. Approved quizzes need a cached explanation and
              example sentences. Run{" "}
              <code className="rounded bg-[var(--quiz-surface-muted)] px-1.5 py-0.5 text-xs">
                yarn when-to-use:pipeline
              </code>{" "}
              after explanations exist.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--quiz-border)] rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
              {items.map((item) => (
                <li key={item.id}>
                  <WhenToUseHubCard
                    id={item.id}
                    slug={item.slug}
                    titleEn={item.titleEn}
                    korean={item.korean}
                    english={item.english}
                    imageUrl={item.imageUrl}
                    imageAlt={item.imageAlt}
                  />
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
                <span className="text-[var(--quiz-text-muted)]"> · {total} words</span>
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
