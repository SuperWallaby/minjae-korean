"use client";

export type VocabQuizCommandId = "pause" | "back" | "next";

export type VocabQuizShortcut = {
  id: VocabQuizCommandId;
  label: string;
  keys: string[];
  mobileLabel: string;
};

export const VOCAB_QUIZ_SHORTCUTS: VocabQuizShortcut[] = [
  { id: "pause", label: "Pause", keys: ["Space", "K"], mobileLabel: "Pause" },
  { id: "back", label: "Back", keys: ["←", "B"], mobileLabel: "Back" },
  { id: "next", label: "Next", keys: ["→", "N"], mobileLabel: "Next" },
];

export function formatShortcutKeys(keys: string[]): string {
  return keys.join(" · ");
}
