import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { toVocabHowToSayPage } from "@/lib/vocabDetail/project";
import { vocabHowToSayPath } from "@/lib/vocabDetail/slug";
import { getWhenToUsePageById } from "@/lib/whenToUse/repo";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ id: string; slug: string }>;
};

/** Legacy when-to-use URLs redirect to canonical /vocab/detail/how-to-say. */
export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: true } };
}

export default async function WhenToUseDetailRedirectPage({ params }: Props) {
  const { id } = await params;
  const source = await getWhenToUsePageById(id);
  if (!source) return notFound();
  const page = toVocabHowToSayPage(source);
  permanentRedirect(vocabHowToSayPath(page.id, page.slug));
}
