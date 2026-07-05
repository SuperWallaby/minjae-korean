import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { listComparisons } from "@/lib/grammarComparisonsRepo";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";
const PAGE_SIZE = 24;

export const metadata: Metadata = {
  title: "Korean Word Comparisons | Grammar | Kaja",
  description:
    "Compare easily confused Korean words and grammar patterns side by side — with real examples and quick quizzes.",
  openGraph: {
    title: "Korean Word Comparisons | Kaja",
    description:
      "Compare easily confused Korean words and grammar patterns side by side.",
    url: `${SITE_URL}/grammar/compare`,
    siteName: "Kaja",
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/grammar/compare` },
};

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function GrammarCompareIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const { items, total } = await listComparisons({ page, pageSize: PAGE_SIZE });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Grammar"
            title="Word & grammar comparisons"
            lead="Side-by-side guides for words Koreans and learners mix up — with examples and a quick quiz on each page."
          />

          {items.length === 0 ? (
            <p className="mt-8 text-sm text-[var(--quiz-text-sub)]">
              No comparisons yet. Run{" "}
              <code className="rounded bg-[var(--quiz-surface-muted)] px-1.5 py-0.5 text-xs">
                yarn generate-grammar --words 그래서,그러니까
              </code>{" "}
              to create the first entry.
            </p>
          ) : (
            <ul className="mt-8 divide-y divide-[var(--quiz-border)] rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)]">
              {items.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/grammar/${item.id}/${encodeURIComponent(item.slug)}`}
                    className="block px-4 py-4 transition-colors hover:bg-[var(--quiz-surface-muted)]"
                  >
                    <p className="font-semibold text-[var(--quiz-text)]">{item.titleEn}</p>
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
                <Link
                  href={`/grammar/compare?page=${page - 1}`}
                  className="underline hover:text-[var(--quiz-text)]"
                >
                  Previous
                </Link>
              ) : (
                <span />
              )}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/grammar/compare?page=${page + 1}`}
                  className="underline hover:text-[var(--quiz-text)]"
                >
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
