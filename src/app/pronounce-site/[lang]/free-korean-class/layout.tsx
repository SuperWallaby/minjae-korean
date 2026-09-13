import type { ReactNode } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { normalizeAtlasLangCode } from "@/lib/atlasRoutes";

type Props = { children: ReactNode; params: Promise<{ lang: string }> };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (normalizeAtlasLangCode(lang) !== "ko") {
    return { title: "Free class", robots: { index: false, follow: false } };
  }
  return {
    title: "30-minute free trial",
    description:
      "Learn Korean 1-on-1 with Minjae. Try your first 30-minute Korean lesson for free. After the trial, tutoring is $5 per session.",
  };
}

export default async function PronounceFreeKoreanClassLayout({
  children,
  params,
}: Props) {
  const { lang } = await params;
  if (normalizeAtlasLangCode(lang) !== "ko") notFound();
  return children;
}
