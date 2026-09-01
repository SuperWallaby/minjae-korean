import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import { getGlobalPin } from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";
import { pinStaticParamsOrEmpty } from "@/lib/buildScope";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  return pinStaticParamsOrEmpty([] as { id: string }[]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = await getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function GlobalPinPage({ params }: Props) {
  const { id } = await params;
  const pin = await getGlobalPin(id);
  if (!pin) notFound();
  return <GlobalPinDetail pin={pin} />;
}
