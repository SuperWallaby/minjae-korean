import { notFound } from "next/navigation";

import { getDrama } from "@/lib/dramaRepo";
import { DramaNewClient } from "./ui";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ slug?: string }>;
};

export default async function DramaNewPage({ searchParams }: Props) {
  if (process.env.NODE_ENV === "production") return notFound();
  const { slug } = await searchParams;
  const initialDrama = slug ? await getDrama(slug) : undefined;
  return <DramaNewClient initialDrama={initialDrama ?? undefined} />;
}
