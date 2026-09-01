import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import { getGlobalLang } from "@/lib/globalSite/langMeta";
import { globalSiteBase } from "@/lib/globalSite/catalog";
import { isJaOnlyBuild } from "@/lib/buildScope";
import { atlasLangHubDescription } from "@/lib/seo/variedCopy";

type Props = { params: Promise<{ code: string }> };

const LANGS = ["es", "fr", "de", "it", "ar", "ja"] as const;

export const revalidate = 60;

export async function generateStaticParams() {
  if (isJaOnlyBuild()) return [];
  return LANGS.map((code) => ({ code }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) return { title: "Language" };
  const base = globalSiteBase();
  const url = `${base}/lang/${code}`;
  const description = atlasLangHubDescription("global", code, lang.name);
  return {
    title: `${lang.name} vocabulary charts`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${lang.name} vocabulary charts · Kaja Global`,
      description,
      url,
      siteName: "Kaja Global",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function GlobalLangPage({ params }: Props) {
  const { code } = await params;
  const lang = getGlobalLang(code);
  if (!lang) notFound();
  return <GlobalLangHub code={code} />;
}
