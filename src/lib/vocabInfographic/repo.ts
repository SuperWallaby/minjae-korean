import publishedFile from "@/data/vocabInfographic/published.json";

import type { VocabInfographicFormatId } from "./formats";
import type { VocabSeoPage, VocabSeoPublishedFile } from "./seoTypes";

const data = publishedFile as VocabSeoPublishedFile;

function byId(): Map<string, VocabSeoPage> {
  const map = new Map<string, VocabSeoPage>();
  for (const page of data.pages ?? []) {
    map.set(page.bundleId, page);
  }
  return map;
}

const idIndex = byId();

export function listVocabSeoPages(options?: {
  page?: number;
  pageSize?: number;
  format?: VocabInfographicFormatId | "all";
}): { items: VocabSeoPage[]; total: number } {
  const page = Math.max(1, options?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, options?.pageSize ?? 24));
  const format = options?.format ?? "all";

  let rows = [...(data.pages ?? [])];
  if (format !== "all") {
    rows = rows.filter((r) => r.format === format);
  }
  // Newest first when updatedAt present.
  rows.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));

  const total = rows.length;
  const start = (page - 1) * pageSize;
  return { items: rows.slice(start, start + pageSize), total };
}

export function getVocabSeoPageById(bundleId: string): VocabSeoPage | null {
  return idIndex.get(bundleId) ?? null;
}

export function listAllVocabSeoPages(): VocabSeoPage[] {
  return [...(data.pages ?? [])];
}

export function listTopVocabSeoForStaticParams(
  limit = 500,
): { bundleId: string; slug: string }[] {
  return listAllVocabSeoPages()
    .slice(0, limit)
    .map((p) => ({ bundleId: p.bundleId, slug: p.slug }));
}

export function vocabSeoPublishedGeneratedAt(): string | null {
  return data.generatedAt ?? null;
}
