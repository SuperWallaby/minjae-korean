import type { KoreanQuizPrepared } from "@/lib/koreanQuiz/types";

/** Client-side filter — matches server `isStudioQuizItem` for prepared quizzes. */
export function isStudioQuizPrepared(quiz: KoreanQuizPrepared): boolean {
  if (!quiz.imageUrl?.trim()) return false;
  if (quiz.type === "sentence_blank") return false;
  return true;
}
