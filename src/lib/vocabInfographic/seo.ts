/** ASCII SEO slug from a vocab bundle title. */
export function slugifyVocabBundleTitle(title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/\bvs\.?\b/g, "vs")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 72);
  return base || "vocab";
}

/** H1 / title tag — keep “in Korean” for long-tail. */
export function vocabSeoTitleEn(catalogTitle: string): string {
  const t = catalogTitle.trim();
  if (!t) return "Korean vocabulary set";
  if (/\bin korean\b/i.test(t)) return t;
  return `${t} in Korean`;
}

export function vocabSeoPath(bundleId: string, slug: string): string {
  return `/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(slug)}`;
}

export function vocabSeoCanonicalUrl(
  baseUrl: string,
  bundleId: string,
  slug: string,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  return `${root}${vocabSeoPath(bundleId, slug)}`;
}

export function vocabSeoSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ||
    "https://kajakorean.com"
  );
}

/** Drop hashtags / heavy emoji noise from tweet for page intro. */
export function cleanVocabTweetIntro(tweetText: string): string {
  const lines = tweetText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !/^#/.test(l) && !/^https?:\/\//i.test(l));

  const kept: string[] = [];
  for (const line of lines) {
    const cleaned = line
      .replace(/https?:\/\/\S+/gi, "")
      .replace(/#[\p{L}\p{N}_]+/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!cleaned) continue;
    // Skip pure bullet word lines for intro — those live in the table.
    if (/^[🔸🔹🔴🔵🟢🟡⚫⚪]\s/.test(cleaned) && cleaned.length < 80) continue;
    kept.push(cleaned);
    if (kept.join(" ").length > 220) break;
    if (kept.length >= 2) break;
  }
  return kept.join(" ").trim();
}

export function vocabSeoDescription(
  titleEn: string,
  words: { hangul: string; english: string }[],
): string {
  const sample = words
    .slice(0, 4)
    .map((w) => `${w.hangul} (${w.english})`)
    .join(", ");
  if (sample) {
    return `${titleEn} — ${sample}. Picture vocab chart for Korean learners.`;
  }
  return `${titleEn}. Picture-backed Korean vocabulary group for learners.`;
}
