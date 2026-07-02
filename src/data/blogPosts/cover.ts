import { parseYouTubeId } from "@/lib/youtube";

import type { BlogParagraphBlock } from "./types";

/** Default card cover when a post has no uploaded cover or inline media. */
export const BLOG_FALLBACK_COVER = "/brand/news-paragraph-style-reference.png";

export function youtubeThumbnail(urlOrId: string): string | null {
  const id = parseYouTubeId(urlOrId);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function resolveBlogCoverImage(post: {
  imageThumb?: string;
  imageLarge?: string;
  paragraphs?: BlogParagraphBlock[];
}): string {
  const explicit = post.imageLarge?.trim() || post.imageThumb?.trim();
  if (explicit && explicit !== "/brand/og.png") return explicit;

  for (const p of post.paragraphs ?? []) {
    const image = p.image?.trim();
    if (image) return image;
  }

  for (const p of post.paragraphs ?? []) {
    const youtube = p.youtube?.trim();
    if (!youtube) continue;
    const thumb = youtubeThumbnail(youtube);
    if (thumb) return thumb;
  }

  if (explicit) return explicit;

  return BLOG_FALLBACK_COVER;
}
