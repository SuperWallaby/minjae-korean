import type { Metadata } from "next";
import Link from "next/link";

import { Container } from "@/components/site/Container";
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
    description: "Study Korean - Exams: find your Korean level with a short placement test.",
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
    <div className="py-12 sm:py-16">
      <Container className="max-w-2xl">
        <nav className="text-sm text-muted-foreground">
          <Link href="/exams" className="hover:text-foreground">
            Exams
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">
            Check my level Beginners ~ intermediate
          </span>
        </nav>
        <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
          Check my level Beginners ~ intermediate
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          A short assessment to find your level. You’ll get a recommended level
          (A0–B2) and can then take level tests or mock TOPIK.
        </p>
        <div className="mt-8">
          {exam && items.length > 0 ? (
            <PlacementExamClient exam={exam} items={items} />
          ) : (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              No exam data available.
            </div>
          )}
        </div>
        <div className="mt-6">
          <Link
            href="/exams"
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Back to Exams
          </Link>
        </div>
      </Container>
    </div>
  );
}
