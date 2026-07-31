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
import { listVocabComparePages } from "@/lib/vocabCompare/repo";
import {
  differenceBetweenTitleEn,
  howToSayVocabTitleEn,
  slugifyDifferencePair,
  vocabDetailSiteBaseUrl,
} from "@/lib/vocabDetail/slug";
import { listWhenToUsePages } from "@/lib/whenToUse/repo";
import { vocabQuizPlayPath } from "@/lib/vocabQuizAeoLinks";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL = vocabDetailSiteBaseUrl();
const PAGE_SIZE = 24;

type Props = {
  searchParams: Promise<{ page?: string; tab?: string }>;
};

function pageHref(tab: "difference" | "how-to-say", nextPage: number) {
  const params = new URLSearchParams();
  if (tab !== "difference") params.set("tab", tab);
  if (nextPage > 1) params.set("page", String(nextPage));
  const q = params.toString();
  return q ? `/vocab/detail?${q}` : "/vocab/detail";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const tab = sp.tab === "how-to-say" ? "how-to-say" : "difference";
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);
  const isHowToSay = tab === "how-to-say";
  const pageTitle = isHowToSay
    ? "How to Say Words in Korean"
    : "Korean Word Differences";
  const description = isHowToSay
    ? "Learn how to say everyday English words in Korean with pictures, pronunciation, explanations, and examples."
    : "Compare similar Korean words with clear contrast explanations, pictures, and links to each word guide.";
  const path = pageHref(tab, page);
  const canonical = `${SITE_URL}${path}`;
  const title = `${pageTitle}${page > 1 ? ` — Page ${page}` : ""} | What is this in Korean`;

  return {
    title: { absolute: title },
    description,
    keywords: isHowToSay
      ? "how to say in korean, korean vocabulary, korean word meanings"
      : "difference between in korean, korean word comparison, similar korean words",
    robots: page > 1 ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    alternates: { canonical },
  };
}

export default async function VocabDetailHubPage({ searchParams }: Props) {
  const sp = await searchParams;
  const tab = sp.tab === "how-to-say" ? "how-to-say" : "difference";
  const page = Math.max(1, parseInt(String(sp.page ?? "1"), 10) || 1);

  const [{ items: compareItems, total: compareTotal }, { items: howToSaySource, total: howToSayTotal }] =
    await Promise.all([
      listVocabComparePages({ page: tab === "difference" ? page : 1, pageSize: PAGE_SIZE }),
      listWhenToUsePages({ page: tab === "how-to-say" ? page : 1, pageSize: PAGE_SIZE }),
    ]);

  const differenceItems = compareItems.map((item) => ({
    ...item,
    slug: slugifyDifferencePair(item.left.english, item.right.english),
    titleEn: differenceBetweenTitleEn(
      item.left.english,
      item.right.english,
      item.left.korean,
      item.right.korean,
    ),
  }));

  const howToSayItems = howToSaySource.map((item) => ({
    ...item,
    titleEn: howToSayVocabTitleEn(item.english),
  }));

  const activeTotal = tab === "difference" ? compareTotal : howToSayTotal;
  const totalPages = Math.max(1, Math.ceil(activeTotal / PAGE_SIZE));
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
            lead="Quiz-backed Korean word pages: difference between similar words, and how to say everyday English in Korean."
          />

          <p className="mt-4 text-sm text-[var(--quiz-text-sub)]">
            Prefer practice?{" "}
            <Link
              href={playHref}
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              More Quiz
            </Link>
            {" · "}
            <Link
              href="/vocab"
              className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Vocab charts
            </Link>
            .
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            <Link
              href={pageHref("difference", 1)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === "difference"
                  ? "bg-[var(--quiz-primary)] text-white"
                  : "border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)]"
              }`}
            >
              Difference between… ({compareTotal})
            </Link>
            <Link
              href={pageHref("how-to-say", 1)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                tab === "how-to-say"
                  ? "bg-[var(--quiz-primary)] text-white"
                  : "border border-[var(--quiz-border)] bg-[var(--quiz-surface)] text-[var(--quiz-text-sub)]"
              }`}
            >
              How to say… ({howToSayTotal})
            </Link>
          </div>

          <section className="mt-6 space-y-4">
            {tab === "difference" ? (
              differenceItems.length === 0 ? (
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
              )
            ) : howToSayItems.length === 0 ? (
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

          {totalPages > 1 ? (
            <nav
              className="mt-8 flex items-center justify-between gap-3 text-sm"
              aria-label="Pagination"
            >
              {page > 1 ? (
                <Link
                  href={pageHref(tab, page - 1)}
                  className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
                >
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              <span className="text-[var(--quiz-text-muted)]">
                Page {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={pageHref(tab, page + 1)}
                  className="font-medium text-[var(--quiz-primary)] underline-offset-2 hover:underline"
                >
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
