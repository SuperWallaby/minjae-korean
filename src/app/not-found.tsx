import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingHeader,
  MarketingPage,
  MarketingShell,
  MarketingShellBody,
} from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <MarketingPage containerClassName="max-w-2xl">
      <MarketingShell>
        <MarketingShellBody>
          <MarketingHeader
            eyebrow="404"
            title="Page not found"
            lead="The page may have moved, or the link may be out of date."
          />
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <Link
              href="/vocab-quiz"
              className="font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Play the vocab quiz
            </Link>
            <Link
              href="/vocab"
              className="font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Browse vocab charts
            </Link>
            <Link
              href="/grammar"
              className="font-semibold text-[var(--quiz-primary)] underline-offset-2 hover:underline"
            >
              Browse grammar
            </Link>
          </div>
        </MarketingShellBody>
      </MarketingShell>
    </MarketingPage>
  );
}
