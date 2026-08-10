import catalog from "@/data/igListSets.json";

import { slugifyIgListTitle } from "./seo";
import type { IgListSeoPage, IgListSeoPublishedFile } from "./seoTypes";

type LegacySet = {
  id: string;
  setId?: string;
  slug?: string;
  title: string;
  titleEn?: string;
  subtitle?: string;
  description?: string;
  intro?: string;
  coverUrl: string;
  coverThumbUrl?: string;
  imageAlt?: string;
  mascotFamily?: string;
  updatedAt?: string;
  cards: Array<{
    file?: string;
    kind?: string;
    hangul?: string;
    romanization?: string;
    english?: string;
    blurb?: string;
    imageUrl: string;
  }>;
};

type LegacyFile = {
  generatedAt?: string;
  generatedFrom?: string;
  pages?: IgListSeoPage[];
  sets?: LegacySet[];
};

function normalizePage(raw: LegacySet | IgListSeoPage): IgListSeoPage | null {
  const setId = String(
    ("setId" in raw && raw.setId) || ("id" in raw && (raw as LegacySet).id) || "",
  ).trim();
  const title = String(raw.title || "").trim();
  if (!setId || !title) return null;

  const cards = (raw.cards || []).map((c) => ({
    file: String(("file" in c && c.file) || "").trim() || "slide.png",
    kind: String(c.kind || "body"),
    hangul: String(c.hangul || "").trim(),
    romanization: String(c.romanization || "").trim() || undefined,
    english: String(c.english || "").trim(),
    blurb: String(("blurb" in c && c.blurb) || "").trim() || undefined,
    imageUrl: String(c.imageUrl || "").trim(),
  }));

  const body = cards.filter((c) => c.kind !== "cover" && c.hangul);
  const slug =
    String(raw.slug || "").trim() ||
    slugifyIgListTitle(title) ||
    setId.replace(/^\d{8}-\d{6}-/, "");
  const titleEn = String(raw.titleEn || title).trim() || title;
  const coverUrl = String(raw.coverUrl || "").trim();
  if (!coverUrl) return null;

  return {
    setId,
    slug,
    title,
    titleEn,
    subtitle: String(raw.subtitle || "").trim() || undefined,
    description:
      String(raw.description || "").trim() ||
      `${titleEn} — natural Korean phrases for English speakers.`,
    intro:
      String(raw.intro || raw.subtitle || "").trim() ||
      `Save these ${body.length || cards.length} Korean phrases for real-life moments.`,
    coverUrl,
    coverThumbUrl: String(raw.coverThumbUrl || coverUrl).trim() || coverUrl,
    imageAlt: String(raw.imageAlt || `${titleEn} carousel cover`).trim(),
    mascotFamily: String(raw.mascotFamily || "").trim() || undefined,
    cards,
    updatedAt: String(raw.updatedAt || "").trim() || undefined,
  };
}

function loadAll(): IgListSeoPage[] {
  const data = catalog as LegacyFile;
  if (Array.isArray(data.pages) && data.pages.length) {
    return data.pages.map(normalizePage).filter((p): p is IgListSeoPage => Boolean(p));
  }
  if (Array.isArray(data.sets) && data.sets.length) {
    return data.sets.map(normalizePage).filter((p): p is IgListSeoPage => Boolean(p));
  }
  return [];
}

export function listAllIgListSeoPages(): IgListSeoPage[] {
  return loadAll();
}

export function getIgListSeoPageById(setId: string): IgListSeoPage | null {
  const id = String(setId || "").trim();
  if (!id) return null;
  return loadAll().find((p) => p.setId === id) || null;
}

export function listTopIgListSeoForStaticParams(limit = 200): IgListSeoPage[] {
  return loadAll().slice(0, Math.max(1, limit));
}

export function listRelatedIgListSeoPages(
  setId: string,
  limit = 8,
): IgListSeoPage[] {
  return loadAll()
    .filter((p) => p.setId !== setId)
    .slice(0, Math.max(0, limit));
}

export function asPublishedFile(): IgListSeoPublishedFile {
  const data = catalog as LegacyFile;
  return {
    generatedAt: data.generatedAt || new Date().toISOString(),
    generatedFrom: data.generatedFrom || "igListSets.json",
    pages: listAllIgListSeoPages(),
  };
}
