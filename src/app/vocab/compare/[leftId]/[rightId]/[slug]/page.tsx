import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { getVocabComparePage } from "@/lib/vocabCompare/repo";
import { orderedPairIds } from "@/lib/vocabCompare/slug";
import { toVocabDifferencePage } from "@/lib/vocabDetail/project";
import { vocabDifferencePath } from "@/lib/vocabDetail/slug";

export const runtime = "nodejs";
export const revalidate = 3600;
export const dynamicParams = true;

type Props = {
  params: Promise<{ leftId: string; rightId: string; slug: string }>;
};

/** Legacy compare URLs redirect to canonical /vocab/detail/difference. */
export async function generateMetadata(): Promise<Metadata> {
  return { robots: { index: false, follow: true } };
}

export default async function VocabCompareDetailRedirectPage({ params }: Props) {
  const { leftId, rightId } = await params;
  const ordered = orderedPairIds(leftId, rightId);
  const source = await getVocabComparePage(ordered.leftId, ordered.rightId);
  if (!source) return notFound();
  const page = toVocabDifferencePage(source);
  permanentRedirect(
    vocabDifferencePath(page.leftId, page.rightId, page.slug),
  );
}
