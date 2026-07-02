import type { Metadata } from "next";

import { MarketingPage } from "@/components/site/MarketingShell";

import { VocabQuizReviewClient } from "./VocabQuizReviewClient";

export const metadata: Metadata = {
  title: "Flagged Quizzes | Vocab Quiz | Kaja",
  description: "Quizzes marked for review before editing in korean-quiz admin.",
};

export default function VocabQuizReviewPage() {
  return (
    <MarketingPage containerClassName="max-w-4xl" className="pb-8 pt-4">
      <VocabQuizReviewClient />
    </MarketingPage>
  );
}
