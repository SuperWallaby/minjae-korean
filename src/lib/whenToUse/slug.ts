/** ASCII SEO slug from English gloss — e.g. "ice cream" → "ice-cream". */
export function slugifyWhenToUseEnglish(english: string): string {
  const base = english
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
  return base || "word";
}

export function whenToUseTitleEn(english: string): string {
  const gloss = english.trim() || "this word";
  return `When to use ${gloss} in Korean`;
}

export function whenToUsePath(id: string, slug: string): string {
  return `/when-to-use/${encodeURIComponent(id)}/${encodeURIComponent(slug)}`;
}

export function whenToUseCanonicalUrl(
  baseUrl: string,
  id: string,
  slug: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}${whenToUsePath(id, slug)}`;
}
