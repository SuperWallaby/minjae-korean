import catalog from "@/data/igListSets.json";

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
  cards: ExpressionCard[];
};

type IgListCatalog = {
  sets: Array<{
    id: string;
    title: string;
    subtitle?: string;
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
  return (data.sets ?? []).map((set) => ({
    id: set.id,
    title: set.title,
    shortTitle: set.title,
    coverUrl: set.coverUrl,
    coverThumbUrl: set.coverThumbUrl || set.coverUrl,
    cards: (set.cards ?? []).map((card) => ({
      hangul: card.hangul ?? "",
      romanization: card.romanization ?? "",
      english: card.english ?? "",
      imageUrl: card.imageUrl,
      kind: card.kind ?? "body",
    })),
  }));
}
