/** IG List SEO page types (kajakorean.com/list/{setId}/{slug}). */

export type IgListSeoCard = {
  file: string;
  kind: "cover" | "body" | string;
  hangul: string;
  romanization?: string;
  english: string;
  blurb?: string;
  imageUrl: string;
};

export type IgListSeoPage = {
  setId: string;
  slug: string;
  title: string;
  titleEn: string;
  subtitle?: string;
  description: string;
  intro: string;
  coverUrl: string;
  coverThumbUrl?: string;
  imageAlt: string;
  mascotFamily?: string;
  cards: IgListSeoCard[];
  updatedAt?: string;
};

export type IgListSeoPublishedFile = {
  generatedAt: string;
  generatedFrom: string;
  pages: IgListSeoPage[];
};
