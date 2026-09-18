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
    return { title: "Korean lessons", robots: { index: false, follow: false } };
  }
  return {
    title: "Lesson prices",
    description:
      "1:1 Korean with Minjae. $8 per 30-minute session, less when you buy more. First trial is free.",
  };
}

export default async function PronounceKoreanLessonsLayout({
  children,
  params,
}: Props) {
  const { lang } = await params;
  if (normalizeAtlasLangCode(lang) !== "ko") notFound();
  return children;
}
