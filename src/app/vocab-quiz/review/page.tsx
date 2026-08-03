import type { Metadata } from "next";

import { MarketingPage } from "@/components/site/MarketingShell";

import { VocabQuizReviewClient } from "./VocabQuizReviewClient";

export const metadata: Metadata = {
  title: { absolute: "Your Quizzes | Vocab Quiz | Kaja Korean" },
  description: "Review Korean vocab quizzes you’ve already practiced.",
};

export default function VocabQuizReviewPage() {
  return (
    <MarketingPage containerClassName="max-w-4xl" className="pb-8 pt-4">
      <VocabQuizReviewClient />
    </MarketingPage>
  );
}
