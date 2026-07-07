import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { comparisonWordsFromSlug } from "@/lib/grammarComparisonSlug";
import { formatKoreanWithRomanization } from "@/lib/grammarRomanization";
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
  searchParams: Promise<{ page?: string; ways?: string }>;
};

function parseWaysFilter(raw: string | undefined): 2 | 3 | undefined {
  if (raw === "2") return 2;
  if (raw === "3") return 3;
  return undefined;
}

export default async function GrammarCompareIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const ways = parseWaysFilter(sp.ways);
  const { items, total } = await listComparisons({ page, pageSize: PAGE_SIZE, ways });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const pageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (ways) params.set("ways", String(ways));
    const q = params.toString();
    return q ? `/grammar/compare?${q}` : "/grammar/compare";
  };

  const filterHref = (nextWays?: 2 | 3) => {
    if (!nextWays) return "/grammar/compare";
    return `/grammar/compare?ways=${nextWays}`;
  };

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="Grammar"
            title="Word & grammar comparisons"
            lead="Side-by-side guides for words Koreans and learners mix up — with examples and a quick quiz on each page."
          />

          <div className="mt-6 flex flex-wrap gap-2 text-sm">
            <Link
              href={filterHref()}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                !ways
                  ? "bg-emerald-800 text-white"
                  : "bg-[var(--quiz-surface-muted)] text-[var(--quiz-text-sub)] hover:text-[var(--quiz-text)]"
              }`}
            >
              All
            </Link>
            <Link
              href={filterHref(2)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                ways === 2
                  ? "bg-emerald-800 text-white"
                  : "bg-[var(--quiz-surface-muted)] text-[var(--quiz-text-sub)] hover:text-[var(--quiz-text)]"
              }`}
            >
              2-way
            </Link>
            <Link
              href={filterHref(3)}
              className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
                ways === 3
                  ? "bg-emerald-800 text-white"
                  : "bg-[var(--quiz-surface-muted)] text-[var(--quiz-text-sub)] hover:text-[var(--quiz-text)]"
              }`}
            >
              3-way
            </Link>
          </div>

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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[var(--quiz-text)]">{item.titleEn}</p>
                      {item.itemCount >= 3 ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900">
                          3-way
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-[var(--quiz-text-sub)]">
                      {comparisonWordsFromSlug(item.slug)
                        .map((w) => formatKoreanWithRomanization(w))
                        .join(" · ")}
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
                <Link
                  href={pageHref(page - 1)}
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
                  href={pageHref(page + 1)}
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
