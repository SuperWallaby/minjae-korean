import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalLangHub } from "@/components/global-site/GlobalLangHub";
import {
  getGlobalLang,
  globalSiteBase,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { isJaOnlyBuild } from "@/lib/buildScope";

type Props = { params: Promise<{ code: string }> };

const LANGS = ["es", "fr", "de", "it", "ar", "ja"] as const;

export const revalidate = 3600;

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
  const description = `Free ${lang.name} vocabulary charts for English speakers — word lists with pronunciation audio, example sentences, and tutor booking.`;
  return {
    title: `${lang.name} vocabulary charts with audio`,
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
