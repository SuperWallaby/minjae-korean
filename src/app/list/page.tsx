import type { Metadata } from "next";
import Link from "next/link";

import { IgListSeoHubCard } from "@/components/ig-list/IgListSeoArticle";
import { Breadcrumb } from "@/components/site/Breadcrumb";
import {
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { listAllIgListSeoPages } from "@/lib/igList/repo";
import { igListSiteBaseUrl } from "@/lib/igList/seo";
import { SITE_NAME } from "@/lib/siteBrand";

export const runtime = "nodejs";
export const revalidate = 3600;

const baseUrl = igListSiteBaseUrl();

export const metadata: Metadata = {
  title: { absolute: `Korean Phrase Lists | ${SITE_NAME}` },
  description:
    "Instagram-style Korean phrase lists for real-life moments — free carousels for English speakers.",
  alternates: { canonical: `${baseUrl}/list` },
};

export default function IgListHubPage() {
  const pages = listAllIgListSeoPages();

  return (
    <MarketingPage containerClassName="max-w-3xl">
      <MarketingShell>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "Phrase lists", href: "/list" },
          ]}
        />
        <MarketingShellBody>
          <header className="mb-8 space-y-3">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--quiz-text)] sm:text-3xl">
              Korean phrase lists
            </h1>
            <p className="max-w-2xl text-base text-[var(--quiz-text-sub)]">
              Save-ready phrase carousels for awkward, cozy, and everyday Korean
              moments.{" "}
              <Link href="/" className="underline underline-offset-2">
                Back to home
              </Link>
            </p>
          </header>

          <div className="overflow-hidden rounded-[1.25rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] divide-y divide-[var(--quiz-border)]">
            {pages.map((page) => (
              <IgListSeoHubCard key={page.setId} page={page} />
            ))}
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
