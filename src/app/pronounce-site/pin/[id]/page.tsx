import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import { atlasPinPath } from "@/lib/atlasRoutes";
import {
  getGlobalPin,
} from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";
import { pinStaticParamsOrEmpty } from "@/lib/buildScope";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  // On-demand ISR — full zh catalog prerender dominated OpenNext builds.
  return pinStaticParamsOrEmpty([]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = await getGlobalPin(id, "zh");
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function PronounceZhPinPage({ params }: Props) {
  const { id } = await params;
  const pin = await getGlobalPin(id, "zh");
  if (!pin) notFound();
  if (pin.lang !== "zh") {
    redirect(atlasPinPath(pin));
  }
  return <GlobalPinDetail pin={pin} />;
}
