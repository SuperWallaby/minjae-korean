import { slugifyWhenToUseEnglish } from "@/lib/whenToUse/slug";

export function differenceBetweenTitleEn(
  leftEnglish: string,
  rightEnglish: string,
): string {
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
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://kajakorean.com"
  ).replace(/\/+$/, "");
}
