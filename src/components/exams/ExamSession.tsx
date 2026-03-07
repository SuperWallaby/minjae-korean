"use client";

import { useCallback, useMemo, useState } from "react";
import type {
  Exam,
  AssessmentItem,
  Attempt,
  ItemResponse,
  AttemptStatus,
} from "@/types/exam";
import { gradeAttempt } from "@/lib/examGrading";
import { ExamItemRenderer } from "./ExamItemRenderer";
import { ExamResult } from "./ExamResult";
import { Button } from "@/components/ui/Button";

type Props = {
  exam: Exam;
  orderedItems: AssessmentItem[];
};

export function ExamSession({ exam, orderedItems }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, ItemResponse>>({});
  const [status, setStatus] = useState<AttemptStatus>("in_progress");
  const [grading, setGrading] = useState<ReturnType<typeof gradeAttempt> | null>(null);

  const itemsMap = useMemo(() => {
    const m = new Map<string, AssessmentItem>();
    for (const item of orderedItems) m.set(item.id, item);
    return m;
  }, [orderedItems]);

  const currentItem = orderedItems[currentIndex];
  const currentResponse = currentItem ? responses[currentItem.id] : undefined;
  const isLast = currentIndex >= orderedItems.length - 1;
  const isFirst = currentIndex <= 0;

  const setResponse = useCallback((itemId: string, response: ItemResponse) => {
    setResponses((prev) => ({ ...prev, [itemId]: response }));
  }, []);

  const handleSubmit = useCallback(() => {
    const sectionId = exam.blueprint.sections[0]?.id ?? "section-1";
    const itemIds = orderedItems.map((i) => i.id);
    const attempt: Attempt = {
      id: `attempt-${Date.now()}`,
      examId: exam.id,
      status: "submitted",
      startedAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      order: {
        sectionIds: [sectionId],
        itemIdsBySectionId: { [sectionId]: itemIds },
      },
      responses,
    };
    const result = gradeAttempt(
      attempt,
      itemsMap,
      exam.blueprint.placementRule ?? null
    );
    setGrading(result);
    setStatus("submitted");
  }, [exam.id, exam.blueprint.placementRule, exam.blueprint.sections, orderedItems, responses, itemsMap]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setResponses({});
    setStatus("in_progress");
    setGrading(null);
  }, []);

  if (status === "submitted" && grading) {
    return (
      <ExamResult
        grading={grading}
        onRetry={handleRetry}
        backHref="/exams"
      />
    );
  }

  if (!currentItem) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
        No questions in this exam.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Question {currentIndex + 1} of {orderedItems.length}
        </span>
      </div>
      <div className="rounded-xl border border-border bg-card p-6">
        <ExamItemRenderer
          item={currentItem}
          response={currentResponse}
          onChange={(r) => setResponse(currentItem.id, r)}
          disabled={false}
          showCorrect={false}
        />
      </div>
      <div className="flex justify-between">
        <Button
          variant="outline"
          size="md"
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={isFirst}
        >
          Previous
        </Button>
        {isLast ? (
          <Button variant="primary" size="md" onClick={handleSubmit}>
            Submit
          </Button>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={() => setCurrentIndex((i) => i + 1)}
          >
            Next
          </Button>
        )}
      </div>
    </div>
  );
}
