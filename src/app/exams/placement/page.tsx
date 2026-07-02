import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";
import { getExam, getExamItems, PLACEMENT_SLUG } from "@/data/examsList";
import { PlacementExamClient } from "./PlacementExamClient";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kaja.kr";

const META_KEYWORD = "Study Korean - Exams";

export const metadata: Metadata = {
  title: `Check my level | ${META_KEYWORD} | Kaja`,
  description:
    "Study Korean - Exams: find your Korean level with a short placement test. Interactive assessment.",
  openGraph: {
    title: `Check my level | ${META_KEYWORD} | Kaja`,
    description:
      "Study Korean - Exams: find your Korean level with a short placement test.",
    url: `${SITE_URL}/exams/placement`,
    siteName: "Kaja",
    type: "website",
  },
  alternates: { canonical: `${SITE_URL}/exams/placement` },
};

export default async function PlacementExamPage() {
  const exam = await getExam("placement", PLACEMENT_SLUG);
  const items = await getExamItems("placement", PLACEMENT_SLUG);

  return (
    <MarketingPage containerClassName="max-w-2xl">
      <MarketingShell>
        <MarketingShellBody>
          <nav className="text-sm text-[var(--quiz-text-sub)]">
            <Link
              href="/exams"
              className="hover:text-[var(--quiz-text)]"
            >
              Exams
            </Link>
            <span className="mx-2">/</span>
            <span className="text-[var(--quiz-text)]">
              Check my level Beginners ~ intermediate
            </span>
          </nav>
          <MarketingHeader
            title="Check my level Beginners ~ intermediate"
            lead="A short assessment to find your level. You'll get a recommended level (A0–B2) and can then take level tests or mock TOPIK."
            className="mt-4"
          />
          <div className="mt-8">
            {exam && items.length > 0 ? (
              <PlacementExamClient exam={exam} items={items} />
            ) : (
              <div className="rounded-[1.125rem] border border-[var(--quiz-border)] bg-[var(--quiz-surface)] p-6 text-sm text-[var(--quiz-text-sub)]">
                No exam data available.
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/exams"
              className="text-sm font-medium text-[var(--quiz-primary)] hover:underline"
            >
              ← Back to Exams
            </Link>
            {process.env.NODE_ENV !== "production" && (
              <Link
                href="/exams/placement/edit"
                className="rounded border border-[var(--quiz-border)] bg-[var(--quiz-surface)] px-3 py-1.5 text-sm hover:bg-[var(--quiz-surface-soft)]"
              >
                Edit
              </Link>
            )}
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
