import type { KoreanQuizPrepared } from "./types";

export function correctLabelFromPrepared(quiz: KoreanQuizPrepared): string {
  for (const choice of quiz.choices) {
    if (choice.id === quiz.correctChoiceId) return choice.label;
  }
  return "";
}

export function correctEnglishFromPrepared(quiz: KoreanQuizPrepared): string {
  for (const choice of quiz.choices) {
    if (choice.id === quiz.correctChoiceId) return choice.english;
  }
  return "";
}
