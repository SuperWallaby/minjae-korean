"use client";

import type { AssessmentItem, Exam } from "@/types/exam";
import { buildOrderedItems } from "@/lib/examUtils";
import { ExamSession } from "@/components/exams/ExamSession";

export function TopicQuizClient({
  exam,
  items,
}: {
  exam: Exam;
  items: AssessmentItem[];
}) {
  const orderedItems = buildOrderedItems(exam, items);
  return <ExamSession exam={exam} orderedItems={orderedItems} />;
}

