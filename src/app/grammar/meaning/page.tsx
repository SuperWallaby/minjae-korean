import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/siteBrand";
import Link from "next/link";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { formatKoreanWithRomanization } from "@/lib/grammarRomanization";
import { guideBasePath, listGrammarGuides } from "@/lib/grammarGuidesRepo";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "What Does It Mean? | Korean Grammar | What is this in Korean",
  description:
    "Clear explanations of Korean words and grammar patterns — what they mean, with real examples and quick quizzes.",
  openGraph: {
    title: "What Does It Mean? | Korean Grammar | What is this in Korean",
    description:
      "Clear explanations of Korean words and grammar patterns — what they mean.",
    url: `${SITE_URL}/grammar/meaning`,
    siteName: SITE_NAME,
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/grammar/meaning` },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function GrammarMeaningIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = await listGrammarGuides("meaning", { page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = guideBasePath("meaning");

  const pageHref = (nextPage: number) =>
    nextPage > 1 ? `${basePath}?page=${nextPage}` : basePath;

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Grammar"
            title="What does it mean?"
            lead="SEO-friendly meaning guides for Korean words and patterns learners search for — with examples and a quick quiz."
          />

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--quiz-text-sub)]">
              No meaning guides yet. Run{" "}
              <code className="rounded bg-[var(--quiz-surface-muted)] px-1.5 py-0.5 text-xs">
                yarn generate-grammar-guide --type meaning --word 근데
              </code>{" "}
              to create the first entry.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--quiz-border)] rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`${basePath}/${item.id}/${encodeURIComponent(item.slug)}`}
                    className="block px-4 py-4 transition-colors hover:bg-[var(--quiz-surface-muted)]"
                  >
                    <p className="font-semibold text-[var(--quiz-text)]">{item.titleEn}</p>
                    <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                      {formatKoreanWithRomanization(item.wordName)}
                    </p>
                    {item.summaryEn ? (
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--quiz-text-sub)]">
                        {item.summaryEn}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {totalPages > 1 ? (
            <nav
              className="mt-6 flex items-center justify-between text-sm text-[var(--quiz-text-sub)]"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link href={pageHref(page - 1)} className="underline hover:text-[var(--quiz-text)]">
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)} className="underline hover:text-[var(--quiz-text)]">
                  Next
                </Link>
              ) : (
                <span />
              )}
            </nav>
          ) : null}

          <p className="mt-8 text-center text-sm">
            <Link href="/grammar" className="text-[var(--quiz-text-sub)] underline hover:text-[var(--quiz-text)]">
              Back to grammar library
            </Link>
          </p>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
