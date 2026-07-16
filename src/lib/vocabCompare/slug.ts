import { slugifyWhenToUseEnglish } from "@/lib/whenToUse/slug";

export function slugifyVocabComparePair(
  leftEnglish: string,
  rightEnglish: string,
): string {
  const a = slugifyWhenToUseEnglish(leftEnglish);
  const b = slugifyWhenToUseEnglish(rightEnglish);
  return `${a}-vs-${b}`.slice(0, 96);
}

export function vocabCompareTitleEn(
  leftEnglish: string,
  rightEnglish: string,
): string {
  return `${leftEnglish.trim()} vs ${rightEnglish.trim()} in Korean`;
}

export function vocabComparePath(
  leftId: string,
  rightId: string,
  slug: string,
): string {
  return `/vocab/compare/${encodeURIComponent(leftId)}/${encodeURIComponent(rightId)}/${encodeURIComponent(slug)}`;
}

export function vocabCompareCanonicalUrl(
  baseUrl: string,
  leftId: string,
  rightId: string,
  slug: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}${vocabComparePath(leftId, rightId, slug)}`;
}

export function orderedPairIds(
  a: string,
  b: string,
): { leftId: string; rightId: string; swapped: boolean } {
  if (a < b) return { leftId: a, rightId: b, swapped: false };
  return { leftId: b, rightId: a, swapped: true };
}
