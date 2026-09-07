/**
 * Public blog feed + sitemap + indexable article URLs.
 *
 * Unlisted slugs still load at `/blog/article/[slug]` (for editing) but stay
 * off `/blog`, the home “Latest” list, `sitemap.xml`, and send noindex
 * (meta robots + `X-Robots-Tag`).
 *
 * To publish one post: add its slug here. It must already be in `SLUG_LIST`
 * in `index.ts`. To unpublish: remove it from this array.
 */
export const BLOG_LISTED_SLUGS = [
  "how-long-does-it-take-to-learn-korean",
  "korean-conversation-practice",
  "korean-verb-endings",
  "why-koreans-cant-speak-english-after-12-years",
  "bts-7-letters-far-future-korean-phrases",
  "why-eun-neun-and-i-ga-feel-so-different",
  "study-korean-what-is-arirang",
  "2026-korean-study-method-blended-learning-flow",
  "good-korean-teacher-2026",
] as const;

export type BlogListedSlug = (typeof BLOG_LISTED_SLUGS)[number];

export function blogPostIsListed(slug: string): boolean {
  return (BLOG_LISTED_SLUGS as readonly string[]).includes(slug);
}
