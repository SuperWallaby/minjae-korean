"use client";

import type { Exam, AssessmentItem } from "@/types/exam";
import { buildOrderedItems } from "@/lib/examUtils";
import { ExamSession } from "@/components/exams/ExamSession";

type Props = {
  exam: Exam;
  items: AssessmentItem[];
};

export function PlacementExamClient({ exam, items }: Props) {
  const orderedItems = buildOrderedItems(exam, items);
  return <ExamSession exam={exam} orderedItems={orderedItems} />;
}
