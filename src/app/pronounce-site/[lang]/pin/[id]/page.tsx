import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import { atlasPinPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { getGlobalPin, listGlobalPins } from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";

type Props = { params: Promise<{ lang: string; id: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  const langs = new Set<string>(PRONOUNCE_PREFIX_LANGS);
  return listGlobalPins()
    .filter((p) => langs.has(p.lang))
    .map((p) => ({ lang: p.lang, id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function PronounceLangPinPage({ params }: Props) {
  const { lang, id } = await params;
  if (!PRONOUNCE_PREFIX_LANGS.includes(lang as (typeof PRONOUNCE_PREFIX_LANGS)[number])) {
    notFound();
  }
  const pin = getGlobalPin(id);
  if (!pin) notFound();
  if (pin.lang === "zh") {
    redirect(atlasPinPath(pin));
  }
  if (pin.lang !== lang) {
    redirect(atlasPinPath(pin));
  }
  return <GlobalPinDetail pin={pin} />;
}
