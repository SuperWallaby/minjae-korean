import { parseYouTubeId } from "@/lib/youtube";

import type { BlogParagraphBlock } from "./types";

/**
 * Opt-in only — do not use as a silent default on articles/feeds.
 * Prefer empty: no cover is better than a fake “default” image.
 */
export const BLOG_FALLBACK_COVER = "/brand/news-paragraph-style-reference.png";

export function youtubeThumbnail(urlOrId: string): string | null {
  const id = parseYouTubeId(urlOrId);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

/** Real cover only. Returns "" when the post has nothing to show. */
export function resolveBlogCoverImage(post: {
  imageThumb?: string;
  imageLarge?: string;
  paragraphs?: BlogParagraphBlock[];
}): string {
  const explicit = post.imageLarge?.trim() || post.imageThumb?.trim();
  if (explicit && explicit !== "/brand/og.png" && explicit !== BLOG_FALLBACK_COVER) {
    return explicit;
  }

  for (const p of post.paragraphs ?? []) {
    const image = p.image?.trim();
    if (image && image !== BLOG_FALLBACK_COVER) return image;
  }

  for (const p of post.paragraphs ?? []) {
    const youtube = p.youtube?.trim();
    if (!youtube) continue;
    const thumb = youtubeThumbnail(youtube);
    if (thumb) return thumb;
  }

  return "";
}
