import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import { getGlobalLang } from "@/lib/globalSite/langMeta";
import { atlasLangChartsPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { globalSiteBase } from "@/lib/globalSite/catalog";

type Props = {
  params: Promise<{ lang: string; page: string }>;
  searchParams: Promise<{ cat?: string; q?: string }>;
};

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [] as { lang: string; page: string }[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, page: raw } = await params;
  const row = getGlobalLang(lang);
  const page = Math.max(1, parseInt(raw, 10) || 1);
  if (!row) return { title: "Language" };
  const url = `${globalSiteBase()}${atlasLangChartsPath(lang, page)}`;
  return {
    title: `${row.name} charts · page ${page}`,
    robots: { index: false, follow: true },
    alternates: { canonical: url },
  };
}

export default async function PronounceLangChartsPage({
  params,
  searchParams,
}: Props) {
  const { lang, page: raw } = await params;
  if (
    !PRONOUNCE_PREFIX_LANGS.includes(
      lang as (typeof PRONOUNCE_PREFIX_LANGS)[number],
    )
  ) {
    notFound();
  }
  const page = Math.max(1, parseInt(raw, 10) || 1);
  if (page < 2) notFound();
  const row = getGlobalLang(lang);
  if (!row) notFound();
  const sp = await searchParams;
  return (
    <GlobalLangHub
      code={lang}
      page={page}
      browse="charts"
      cat={sp.cat}
      q={sp.q}
      routing="pronounce"
    />
  );
}
