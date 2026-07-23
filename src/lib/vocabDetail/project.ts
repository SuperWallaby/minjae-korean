import type { VocabComparePage, VocabCompareListItem } from "@/lib/vocabCompare/types";
import type { WhenToUsePage, WhenToUseListItem } from "@/lib/whenToUse/types";

import {
  differenceBetweenTitleEn,
  howToSayVocabTitleEn,
  slugifyDifferencePair,
} from "./slug";

function clipDescription(text: string, max = 160): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

/** Project a compare page into the “Difference between…” SEO format. */
export function toVocabDifferencePage(page: VocabComparePage): VocabComparePage {
  const titleEn = differenceBetweenTitleEn(page.left.english, page.right.english);
  const description = clipDescription(
    page.contrast ||
      `${page.left.english} (${page.left.korean}) vs ${page.right.english} (${page.right.korean}) in Korean.`,
  );
  return {
    ...page,
    slug: slugifyDifferencePair(page.left.english, page.right.english),
    titleEn,
    description,
  };
}

export function toVocabDifferenceListItem(
  page: VocabComparePage,
): VocabCompareListItem {
  const projected = toVocabDifferencePage(page);
  return {
    leftId: projected.leftId,
    rightId: projected.rightId,
    slug: projected.slug,
    titleEn: projected.titleEn,
    left: {
      korean: projected.left.korean,
      english: projected.left.english,
      imageUrl: projected.left.imageUrl,
      imageAlt: projected.left.imageAlt,
    },
    right: {
      korean: projected.right.korean,
      english: projected.right.english,
      imageUrl: projected.right.imageUrl,
      imageAlt: projected.right.imageAlt,
    },
    updatedAt: projected.updatedAt,
  };
}

/** Project a when-to-use page into the “How to say…” SEO format. */
export function toVocabHowToSayPage(page: WhenToUsePage): WhenToUsePage {
  const titleEn = howToSayVocabTitleEn(page.english);
  const lead = `How to say “${page.english}” in Korean: ${page.korean}.`;
  const description = clipDescription(
    page.explanation ? `${lead} ${page.explanation}` : lead,
  );
  return {
    ...page,
    titleEn,
    description,
    imageAlt:
      page.imageAlt?.trim() ||
      `${page.english} in Korean (${page.korean}) illustration`,
  };
}

export function toVocabHowToSayListItem(page: WhenToUsePage): WhenToUseListItem {
  const projected = toVocabHowToSayPage(page);
  return {
    id: projected.id,
    slug: projected.slug,
    korean: projected.korean,
    english: projected.english,
    titleEn: projected.titleEn,
    imageUrl: projected.imageUrl,
    imageAlt: projected.imageAlt,
    topic: projected.topic,
    updatedAt: projected.updatedAt,
  };
}
