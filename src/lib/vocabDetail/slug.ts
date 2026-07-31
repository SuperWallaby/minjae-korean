import { SITE_ORIGIN } from "@/lib/siteUrl";
import { slugifyWhenToUseEnglish } from "@/lib/whenToUse/slug";

export function differenceBetweenTitleEn(
  leftEnglish: string,
  rightEnglish: string,
  leftKorean?: string,
  rightKorean?: string,
): string {
  const normalize = (value: string) =>
    value.trim().toLowerCase().replace(/\s+/g, " ");
  if (
    leftKorean?.trim() &&
    rightKorean?.trim() &&
    normalize(leftEnglish) === normalize(rightEnglish)
  ) {
    return `${leftKorean.trim()} vs ${rightKorean.trim()}: What’s the difference?`;
  }
  return `Difference between ${leftEnglish.trim()} and ${rightEnglish.trim()} in Korean`;
}

export function howToSayVocabTitleEn(english: string): string {
  const gloss = english.trim() || "this word";
  return `How to say ${gloss} in Korean`;
}

export function slugifyDifferencePair(
  leftEnglish: string,
  rightEnglish: string,
): string {
  const a = slugifyWhenToUseEnglish(leftEnglish);
  const b = slugifyWhenToUseEnglish(rightEnglish);
  return `${a}-and-${b}`.slice(0, 96);
}

export function vocabDifferencePath(
  leftId: string,
  rightId: string,
  slug: string,
): string {
  return `/vocab/detail/difference/${encodeURIComponent(leftId)}/${encodeURIComponent(rightId)}/${encodeURIComponent(slug)}`;
}

export function vocabHowToSayPath(id: string, slug: string): string {
  return `/vocab/detail/how-to-say/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`;
}

export function vocabDifferenceCanonicalUrl(
  baseUrl: string,
  leftId: string,
  rightId: string,
  slug: string,
): string {
  return `${baseUrl.replace(/\/+$/, "")}${vocabDifferencePath(leftId, rightId, slug)}`;
}

export function vocabHowToSayCanonicalUrl(
  baseUrl: string,
  id: string,
  slug: string,
): string {
  return `${baseUrl.replace(/\/+$/, "")}${vocabHowToSayPath(id, slug)}`;
}

export function vocabDetailSiteBaseUrl(): string {
  return SITE_ORIGIN;
}
