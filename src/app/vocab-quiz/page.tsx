import type { Metadata } from "next";

import { VocabQuizClient } from "./VocabQuizClient";
import { MarketingPage } from "@/components/site/MarketingShell";

export const metadata: Metadata = {
  title: "Vocab Quiz | Kaja",
  description:
    "Infinite Korean vocabulary practice with auto countdown mode or manual multiple choice.",
};

export default function VocabQuizPage() {
  return (
    <MarketingPage containerClassName="max-w-6xl" className="pb-8 pt-4 sm:pt-6">
      <VocabQuizClient />
    </MarketingPage>
  );
}
