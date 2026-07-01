import type { Metadata } from "next";

import { VocabQuizReviewClient } from "./VocabQuizReviewClient";

export const metadata: Metadata = {
  title: "Flagged Quizzes | Vocab Quiz | Kaja",
  description: "Quizzes marked for review before editing in korean-quiz admin.",
};

export default function VocabQuizReviewPage() {
  return <VocabQuizReviewClient />;
}
