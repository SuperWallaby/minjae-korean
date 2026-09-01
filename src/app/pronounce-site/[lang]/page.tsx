import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import { getGlobalLang } from "@/lib/globalSite/langMeta";
import { globalSiteBase } from "@/lib/globalSite/catalog";
import { atlasLangPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { atlasLangHubDescription } from "@/lib/seo/variedCopy";
import { pronounceStaticParamsOrEmpty } from "@/lib/buildScope";

type Props = { params: Promise<{ lang: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return pronounceStaticParamsOrEmpty(
    PRONOUNCE_PREFIX_LANGS.map((lang) => ({ lang })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const row = getGlobalLang(lang);
  if (!row) return { title: "Language" };
  const base = globalSiteBase();
  const url = `${base}${atlasLangPath(lang)}`;
  const description = atlasLangHubDescription("pronounce", lang, row.name);
  return {
    title: `${row.name} pronunciation charts`,
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
