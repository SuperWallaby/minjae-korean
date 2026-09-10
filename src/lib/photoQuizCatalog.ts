import photoQuizTrialsFile from "@/data/newsletter/photo-quiz-trials.json";
import type { GrammarQuizTrial } from "@/lib/newsletterGrammarQuiz";

type TrialsFile = {
  items?: GrammarQuizTrial[];
};

export type PhotoQuizResult = GrammarQuizTrial;

function allTrials(): PhotoQuizResult[] {
  const file = photoQuizTrialsFile as TrialsFile;
  return (file.items ?? []).filter(
    (item) =>
      Boolean(item.id?.trim()) &&
      Boolean(item.imageUrl?.trim()) &&
      Array.isArray(item.choices) &&
      item.choices.length >= 2 &&
      typeof item.correct === "number",
  );
}

export function listPhotoQuizIds(): string[] {
  return allTrials().map((t) => t.id);
}

export function getPhotoQuizById(id: string): PhotoQuizResult | null {
  const key = decodeURIComponent(String(id || "")).trim();
  if (!key) return null;
  return allTrials().find((t) => t.id === key) ?? null;
}

export function photoQuizResultPath(id: string): string {
  return `/quiz/result/${encodeURIComponent(id)}`;
}

export function photoQuizResultUrl(
  id: string,
  origin = "https://kajakorean.com",
): string {
  const base = origin.replace(/\/+$/, "");
  return `${base}${photoQuizResultPath(id)}`;
}
