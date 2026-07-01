import type { Metadata } from "next";

import { VocabQuizClient } from "./VocabQuizClient";

export const metadata: Metadata = {
  title: "Vocab Quiz | Kaja",
  description:
    "Infinite Korean vocabulary practice with auto countdown mode or manual multiple choice.",
};

export default function VocabQuizPage() {
  return <VocabQuizClient />;
}
