import catalog from "@/data/globalPins/published.json";

export type GlobalPinWord = {
  english: string;
  target: string;
  romanization: string;
};

export type GlobalPinPage = {
  id: string;
  lang: string;
  langName: string;
  titleEn: string;
  slug: string;
  imagePath: string;
  words: GlobalPinWord[];
  partner: "preply" | "italki" | string;
  description: string;
  topicSlug?: string;
  publishedAt?: string;
};

export type GlobalPinCatalog = {
  version: number;
  generatedAt: string;
  site: string;
  languages: { code: string; name: string }[];
  pages: GlobalPinPage[];
};

export function getGlobalCatalog(): GlobalPinCatalog {
  return catalog as GlobalPinCatalog;
}

export function listGlobalPins(opts?: {
  lang?: string;
}): GlobalPinPage[] {
  const pages = getGlobalCatalog().pages || [];
  if (!opts?.lang) return pages;
  const code = opts.lang.toLowerCase();
  return pages.filter((p) => p.lang.toLowerCase() === code);
}

export function getGlobalPin(id: string): GlobalPinPage | null {
  const needle = String(id || "").trim();
  if (!needle) return null;
  return (
    getGlobalCatalog().pages.find(
      (p) => p.id === needle || p.slug === needle,
    ) || null
  );
}

export function getGlobalLang(code: string) {
  const c = String(code || "")
    .trim()
    .toLowerCase();
  return getGlobalCatalog().languages.find((l) => l.code === c) || null;
}
