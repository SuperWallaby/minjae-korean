import type { Metadata } from "next";

import { BlogInnerPage } from "@/components/site/BlogInnerPage";

import { VocabQuizReviewClient } from "./VocabQuizReviewClient";

export const metadata: Metadata = {
  title: { absolute: "Your Quizzes | Vocab Quiz | Kaja Korean" },
  description: "Review Korean vocab quizzes you’ve already practiced.",
};

export default function VocabQuizReviewPage() {
  return (
    <BlogInnerPage containerClassName="max-w-4xl" card={false}>
      <VocabQuizReviewClient />
    </BlogInnerPage>
  );
}
