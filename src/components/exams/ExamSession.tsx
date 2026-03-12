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
  const [reviewItemId, setReviewItemId] = useState<string | null>(null);

  const itemsMap = useMemo(() => {
    const m = new Map<string, AssessmentItem>();
    for (const item of orderedItems) m.set(item.id, item);
    return m;
  }, [orderedItems]);

  const currentItem = orderedItems[currentIndex];
  const currentResponse = currentItem ? responses[currentItem.id] : undefined;
  const isLast = currentIndex >= orderedItems.length - 1;
  const isFirst = currentIndex <= 0;
  const totalCount = orderedItems.length;
  const progressPercent =
    totalCount > 0 ? Math.round(((currentIndex + 1) / totalCount) * 100) : 0;

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
    // 기본으로 첫 문항을 리뷰 대상으로 선택
    if (orderedItems.length > 0) setReviewItemId(orderedItems[0]!.id);
  }, [exam.id, exam.blueprint.placementRule, exam.blueprint.sections, orderedItems, responses, itemsMap]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setResponses({});
    setStatus("in_progress");
    setGrading(null);
    setReviewItemId(null);
  }, []);

  const buildExplanation = useCallback(
    (item: AssessmentItem, response: ItemResponse | undefined) => {
      const scoreInfo = grading?.byItem?.[item.id];
      const base: string[] = [];
      if (item.skill) base.push(`Skill: ${item.skill.toUpperCase()}`);
      if (item.level) base.push(`Level: ${item.level}`);

      const lines: string[] = [];
      if (base.length) {
        lines.push(base.join(" · "));
      }
      if (scoreInfo) {
        lines.push(`Score: ${scoreInfo.earned}/${scoreInfo.max} point(s).`);
        if (!scoreInfo.correct) {
          lines.push("You did not fully match the expected answer on this item.");
        } else {
          lines.push("You answered this item correctly.");
        }
      }

      switch (item.type) {
        case "mcq":
        case "audio_mcq": {
          const opts = item.interaction.options;
          const key =
            item.scoring.key.kind === "mcq" ? item.scoring.key : null;
          const correctOpt = key
            ? opts.find((o) => o.id === key.correctOptionId)
            : undefined;
          const chosenId =
            response && (response as any).optionId
              ? (response as any).optionId
              : undefined;
          const chosenOpt = opts.find((o) => o.id === chosenId);
          if (chosenOpt) {
            lines.push(
              `You chose: "${chosenOpt.text.default}".`,
            );
          } else {
            lines.push("You did not select an option.");
          }
          if (correctOpt) {
            lines.push(
              `Correct answer: "${correctOpt.text.default}".`,
            );
          }
          break;
        }
        case "short_answer": {
          const key =
            item.scoring.key.kind === "short_answer"
              ? item.scoring.key
              : null;
          if (response && response.type === "short_answer") {
            lines.push(`Your answer: "${response.text}".`);
          } else {
            lines.push("You did not enter an answer.");
          }
          if (key) {
            lines.push(
              `Expected answer(s): ${key.accepted.join(", ")}.`,
            );
          }
          break;
        }
        case "true_false": {
          const key =
            item.scoring.key.kind === "true_false"
              ? item.scoring.key
              : null;
          if (response && response.type === "true_false") {
            lines.push(
              `You marked: ${response.value ? "True" : "False"}.`,
            );
          } else {
            lines.push("You did not choose True/False.");
          }
          if (key) {
            lines.push(
              `Correct answer: ${key.correct ? "True" : "False"}.`,
            );
          }
          break;
        }
        default:
          break;
      }

      if (!lines.length) return null;
      return (
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {lines.join("\n")}
        </p>
      );
    },
    [grading],
  );

  if (status === "submitted" && grading) {
    return (
      <ExamResult
        grading={grading}
        onRetry={handleRetry}
        backHref="/exams"
        onSelectItem={setReviewItemId}
        selectedItemId={reviewItemId}
        renderExplanation={(itemId) => {
          const item = itemsMap.get(itemId);
          const response = responses[itemId];
          return item ? buildExplanation(item, response) : null;
        }}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentIndex + 1} of {totalCount}
          </span>
          <span>{progressPercent}%</span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
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
