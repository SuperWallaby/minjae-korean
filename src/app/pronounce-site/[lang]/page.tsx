import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import {
  getGlobalLang,
  globalSiteBase,
} from "@/lib/globalSite/catalog";
import { atlasLangPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return PRONOUNCE_PREFIX_LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const row = getGlobalLang(lang);
  if (!row) return { title: "Language" };
  const base = globalSiteBase();
  const url = `${base}${atlasLangPath(lang)}`;
  const description = `Free ${row.name} vocabulary charts for English speakers — word lists with pronunciation audio, example sentences, and tutor booking.`;
  return {
    title: `${row.name} vocabulary charts with audio`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${row.name} vocabulary charts · GetPronounce`,
      description,
      url,
      siteName: "GetPronounce",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function PronounceLangPage({ params }: Props) {
  const { lang } = await params;
  if (!PRONOUNCE_PREFIX_LANGS.includes(lang as (typeof PRONOUNCE_PREFIX_LANGS)[number])) {
    notFound();
  }
  const row = getGlobalLang(lang);
  if (!row) notFound();
  return <GlobalLangHub code={lang} />;
}
