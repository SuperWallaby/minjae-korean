import catalog from "@/data/igListSets.json";

import { igListPath, slugifyIgListTitle } from "@/lib/igList/seo";

export type ExpressionCard = {
  hangul: string;
  romanization: string;
  english: string;
  imageUrl: string;
  kind: string;
};

export type ExpressionCardSet = {
  id: string;
  title: string;
  shortTitle: string;
  coverUrl: string;
  coverThumbUrl: string;
  /** SEO page on kajakorean.com */
  href: string;
  cards: ExpressionCard[];
};

type IgListCatalog = {
  pages?: Array<{
    setId?: string;
    id?: string;
    slug?: string;
    title: string;
    coverUrl: string;
    coverThumbUrl?: string;
    cards: Array<{
      hangul?: string;
      romanization?: string;
      english?: string;
      imageUrl: string;
      kind?: string;
    }>;
  }>;
  sets?: Array<{
    id: string;
    setId?: string;
    slug?: string;
    title: string;
    coverUrl: string;
    coverThumbUrl?: string;
    cards: Array<{
      hangul?: string;
      romanization?: string;
      english?: string;
      imageUrl: string;
      kind?: string;
    }>;
  }>;
};

/** auto-video-korean IG List carousels (capybara only). */
export function getExpressionCardSets(): ExpressionCardSet[] {
  const data = catalog as IgListCatalog;
  const rows = data.pages?.length ? data.pages : data.sets ?? [];
  return rows.map((set) => {
    const id = String(set.setId || set.id || "").trim();
    const title = String(set.title || "").trim();
    const slug = String(set.slug || "").trim() || slugifyIgListTitle(title);
    return {
      id,
      title,
      shortTitle: title,
      coverUrl: set.coverUrl,
      coverThumbUrl: set.coverThumbUrl || set.coverUrl,
      href: id && slug ? igListPath(id, slug) : "/list",
      cards: (set.cards ?? []).map((card) => ({
        hangul: card.hangul ?? "",
        romanization: card.romanization ?? "",
        english: card.english ?? "",
        imageUrl: card.imageUrl,
        kind: card.kind ?? "body",
      })),
    };
  });
}
