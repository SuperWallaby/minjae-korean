/** Default hero/thumb when a post has no uploaded cover. */
export const BLOG_FALLBACK_COVER = "/brand/og.png";

export function resolveBlogCoverImage(post: {
  imageThumb?: string;
  imageLarge?: string;
}): string {
  return post.imageLarge?.trim() || post.imageThumb?.trim() || BLOG_FALLBACK_COVER;
}
