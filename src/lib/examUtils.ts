/**
 * Shared helpers for exam UI (localized text, building ordered items from blueprint).
 */

import type { Exam, AssessmentItem, LocalizedText, Locale } from "@/types/exam";

const DEFAULT_LOCALE: Locale = "en";

export function getText(t: LocalizedText | undefined, locale: string = DEFAULT_LOCALE): string {
  if (!t) return "";
  const loc = locale as Locale;
  if (loc !== "en" && t.translations?.[loc]) return t.translations[loc];
  return t.default;
}

export function buildOrderedItemIds(
  sectionIds: string[],
  itemIdsBySectionId: Record<string, string[]>
): { sectionId: string; itemId: string }[] {
  const out: { sectionId: string; itemId: string }[] = [];
  for (const sectionId of sectionIds) {
    const ids = itemIdsBySectionId[sectionId] ?? [];
    for (const itemId of ids) out.push({ sectionId, itemId });
  }
  return out;
}

/** Build ordered items from exam blueprint (explicit source only) and item bank. */
export function buildOrderedItems(exam: Exam, items: AssessmentItem[]): AssessmentItem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const ordered: AssessmentItem[] = [];
  for (const section of exam.blueprint.sections) {
    if (section.source.type !== "explicit") continue;
    for (const id of section.source.itemIds) {
      const item = byId.get(id);
      if (item) ordered.push(item);
    }
  }
  return ordered;
}
