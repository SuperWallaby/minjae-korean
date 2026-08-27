import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GlobalPinDetail } from "@/components/global-site/GlobalPinDetail";
import {
  getGlobalPin,
  listGlobalPins,
} from "@/lib/globalSite/catalog";
import { buildPinMetadata } from "@/lib/globalSite/seo";
import { isJaOnlyBuild } from "@/lib/buildScope";

type Props = { params: Promise<{ id: string }> };

export const revalidate = 3600;

export async function generateStaticParams() {
  if (isJaOnlyBuild()) return [];
  return listGlobalPins().map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) return { title: "Chart" };
  return buildPinMetadata(pin);
}

export default async function GlobalPinPage({ params }: Props) {
  const { id } = await params;
  const pin = getGlobalPin(id);
  if (!pin) notFound();
  return <GlobalPinDetail pin={pin} />;
}
