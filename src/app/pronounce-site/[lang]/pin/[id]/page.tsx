import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import { atlasPinPath, PRONOUNCE_PREFIX_LANGS } from "@/lib/atlasRoutes";
import { getGlobalPin } from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";
import { pinStaticParamsOrEmpty } from "@/lib/buildScope";

type Props = { params: Promise<{ lang: string; id: string }> };

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  // On-demand ISR — catalog-wide prerender dominated OpenNext builds.
  return pinStaticParamsOrEmpty([] as { lang: string; id: string }[]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const pin = await getGlobalPin(id, lang);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function PronounceLangPinPage({ params }: Props) {
  const { lang, id } = await params;
  if (!PRONOUNCE_PREFIX_LANGS.includes(lang as (typeof PRONOUNCE_PREFIX_LANGS)[number])) {
    notFound();
  }
  const pin = await getGlobalPin(id, lang);
  if (!pin) notFound();
  if (pin.lang === "zh") {
    redirect(atlasPinPath(pin));
  }
  if (pin.lang !== lang) {
    redirect(atlasPinPath(pin));
  }
  return <GlobalPinDetail pin={pin} />;
}
