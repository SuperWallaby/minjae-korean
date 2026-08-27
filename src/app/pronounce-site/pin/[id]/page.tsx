import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import { atlasPinPath } from "@/lib/atlasRoutes";
import { getGlobalPin, listGlobalPins } from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  return listGlobalPins({ lang: "zh" }).map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function PronounceZhPinPage({ params }: Props) {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) notFound();
  if (pin.lang !== "zh") {
    redirect(atlasPinPath(pin));
  }
  return <GlobalPinDetail pin={pin} />;
}
