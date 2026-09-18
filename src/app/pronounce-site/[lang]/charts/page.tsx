import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import { getGlobalLang } from "@/lib/globalSite/langMeta";
import { PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { globalSiteBase } from "@/lib/globalSite/catalog";
import { pronounceStaticParamsOrEmpty } from "@/lib/buildScope";
import {
  parseChartCategory,
  parseChartQuery,
} from "@/lib/globalSite/chartCategories";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  return pronounceStaticParamsOrEmpty(
    PRONOUNCE_PREFIX_LANGS.map((lang) => ({ lang })),
  );
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { lang } = await params;
  const sp = await searchParams;
  const filtered =
    parseChartCategory(sp.cat) !== "all" || Boolean(parseChartQuery(sp.q));
  const row = getGlobalLang(lang);
  if (!row) return { title: "Language" };
  const base = globalSiteBase();
  const hub = `${base}/${lang}/`;
  const self = `${base}/${lang}/charts/`;
  return {
    title: `${row.name} charts`,
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
    alternates: { canonical: filtered ? self : hub },
  };
}

export default async function PronounceLangChartsIndexPage({
  params,
  searchParams,
}: Props) {
  const { lang } = await params;
  if (
    !PRONOUNCE_PREFIX_LANGS.includes(
      lang as (typeof PRONOUNCE_PREFIX_LANGS)[number],
    )
  ) {
    notFound();
  }
  const row = getGlobalLang(lang);
  if (!row) notFound();
  const sp = await searchParams;
  return (
    <GlobalLangHub
      code={lang}
      page={1}
      browse="charts"
      cat={sp.cat}
      q={sp.q}
      routing="pronounce"
    />
  );
}
