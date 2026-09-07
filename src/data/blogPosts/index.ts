/**
 * Blog posts — JSON/TS 파일로 관리. content/*.ts 에서 export const post.
 * 새 글: content/your-slug.ts 추가 후 SLUG_LIST + loaders 에 등록.
 * 공개: listed.ts 의 BLOG_LISTED_SLUGS 에 slug 추가 (피드·sitemap·index).
 * 개발 모드에서 업로드한 이미지는 blog-overrides.json 에 저장되어 병합됨.
 */

import * as fs from "fs/promises";
import * as path from "path";

import { resolveBlogCoverImage } from "./cover";
import { excerptFromBlogPost } from "./excerpt";
import { BLOG_LISTED_SLUGS, blogPostIsListed } from "./listed";
import { relatedBlogSlugsFor } from "./related";
import bundledOverrides from "./overrides.json";
import type {
  BlogPost,
  BlogPostCard,
  BlogImageOverrides,
} from "./types";

export { BLOG_LISTED_SLUGS, blogPostIsListed } from "./listed";
export {
  BLOG_RELATED_CLUSTERS,
  blogRelatedClusterFor,
  relatedBlogSlugsFor,
} from "./related";

const OVERRIDES_PATH = path.join(process.cwd(), "blog-overrides.json");

/**
 * Covers live in committed `overrides.json` (Workers have no reliable cwd fs).
 * Local admin uploads still write `blog-overrides.json` and overlay at runtime.
 */
async function readBlogOverrides(): Promise<Record<string, BlogImageOverrides>> {
  const base =
    bundledOverrides && typeof bundledOverrides === "object"
      ? (bundledOverrides as Record<string, BlogImageOverrides>)
      : {};
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf-8");
    const data = JSON.parse(raw) as Record<string, BlogImageOverrides>;
    if (data && typeof data === "object") return { ...base, ...data };
  } catch {
    /* Workers / production: bundled only */
  }
  return base;
}

const SLUG_LIST = [
  "what-is-this-called-in-korean-app",
  "learn-korean-words-in-5-minutes",
  "human-made-korean-quizzes-vs-ai",
  "korean-vocab-practice-without-ads",
  "what-is-this-called-in-korean-vs-duolingo",
  "what-is-this-called-in-korean-vs-anki",
  "korean-vocab-quiz-vs-flashcards",
  "what-is-this-called-in-korean-vs-drops",
  "what-is-this-called-in-korean-vs-memrise",
  "what-is-this-called-in-korean-vs-lingodeer",
  "best-korean-vocabulary-apps-for-beginners",
  "picture-audio-vs-text-korean-memorization",
  "learn-korean-vocabulary-with-live-streams",
  "korean-vocab-quiz-manual-auto-studio-mode",
  "beginner-korean-words-low-burnout-quiz-routine",
  "study-korean-what-is-arirang",
  "why-korean-translation-loses-meaning",
  "2026-korean-study-method-blended-learning-flow",
  "bts-7-letters-far-future-korean-phrases",
  "why-eun-neun-and-i-ga-feel-so-different",
  "why-koreans-cant-speak-english-after-12-years",
  "good-korean-teacher-2026",
  "korean-verb-endings",
  "mastering-korean-emotions-not-just-words",
  "balanced-practice-trumps-method-for-korean",
  "why-essential-korean-words-are-more-than-vocab",
  "korean-study-plans-realistic-flexible-goals",
  "how-to-understand-korean-dialects-bts-suga",
  "is-korean-hard-to-learn",
  "celebrities-speaking-korean-pronunciation-tips",
  "jimin-busan-dialect-korean",
  "how-long-does-it-take-to-learn-korean",
  "korean-conversation-practice",
  "easy-korean-reading",
  "best-korean-textbook-for-self-study",
  "is-duolingo-good-for-korean",
  "anki-korean",
] as const;
type Slug = (typeof SLUG_LIST)[number];

type ListedMustBeSlug = (typeof BLOG_LISTED_SLUGS)[number] extends Slug
  ? true
  : never;
const _listedCheck: ListedMustBeSlug = true;
void _listedCheck;

/** Keep cover + in-article images only for these posts. */
export const BLOG_KEEP_IMAGES_SLUGS = [
  "bts-7-letters-far-future-korean-phrases",
  "study-korean-what-is-arirang",
  "why-koreans-cant-speak-english-after-12-years",
  "korean-verb-endings",
  "how-long-does-it-take-to-learn-korean",
] as const satisfies readonly Slug[];

export function blogPostKeepsImages(slug: string): boolean {
  return (BLOG_KEEP_IMAGES_SLUGS as readonly string[]).includes(slug);
}

const LISTED_RANK = new Map<string, number>(
  BLOG_LISTED_SLUGS.map((slug, i) => [slug, i]),
);

const loaders: Record<
  Slug,
  () => Promise<{ post: BlogPost }>
> = {
  "what-is-this-called-in-korean-app": () =>
    import("./content/what-is-this-called-in-korean-app"),
  "learn-korean-words-in-5-minutes": () =>
    import("./content/learn-korean-words-in-5-minutes"),
  "human-made-korean-quizzes-vs-ai": () =>
    import("./content/human-made-korean-quizzes-vs-ai"),
  "korean-vocab-practice-without-ads": () =>
    import("./content/korean-vocab-practice-without-ads"),
  "what-is-this-called-in-korean-vs-duolingo": () =>
    import("./content/what-is-this-called-in-korean-vs-duolingo"),
  "what-is-this-called-in-korean-vs-anki": () =>
    import("./content/what-is-this-called-in-korean-vs-anki"),
  "korean-vocab-quiz-vs-flashcards": () =>
    import("./content/korean-vocab-quiz-vs-flashcards"),
  "what-is-this-called-in-korean-vs-drops": () =>
    import("./content/what-is-this-called-in-korean-vs-drops"),
  "what-is-this-called-in-korean-vs-memrise": () =>
    import("./content/what-is-this-called-in-korean-vs-memrise"),
  "what-is-this-called-in-korean-vs-lingodeer": () =>
    import("./content/what-is-this-called-in-korean-vs-lingodeer"),
  "best-korean-vocabulary-apps-for-beginners": () =>
    import("./content/best-korean-vocabulary-apps-for-beginners"),
  "picture-audio-vs-text-korean-memorization": () =>
    import("./content/picture-audio-vs-text-korean-memorization"),
  "learn-korean-vocabulary-with-live-streams": () =>
    import("./content/learn-korean-vocabulary-with-live-streams"),
  "korean-vocab-quiz-manual-auto-studio-mode": () =>
    import("./content/korean-vocab-quiz-manual-auto-studio-mode"),
  "beginner-korean-words-low-burnout-quiz-routine": () =>
    import("./content/beginner-korean-words-low-burnout-quiz-routine"),
  "study-korean-what-is-arirang": () => import("./content/study-korean-what-is-arirang"),
  "why-korean-translation-loses-meaning": () =>
    import("./content/why-korean-translation-loses-meaning"),
  "2026-korean-study-method-blended-learning-flow": () => import("./content/2026-korean-study-method-blended-learning-flow").then(m => ({ post: m.default })),
  "bts-7-letters-far-future-korean-phrases": () => import("./content/bts-7-letters-far-future-korean-phrases"),
  "why-eun-neun-and-i-ga-feel-so-different": () => import("./content/why-eun-neun-and-i-ga-feel-so-different"),
  "why-koreans-cant-speak-english-after-12-years": () => import("./content/why-koreans-cant-speak-english-after-12-years"),
  "good-korean-teacher-2026": () => import("./content/good-korean-teacher-2026"),
  "korean-verb-endings": () => import("./content/korean-verb-endings"),
  "jimin-busan-dialect-korean": () => import("./content/jimin-busan-dialect-korean"),
  "celebrities-speaking-korean-pronunciation-tips": () => import("./content/celebrities-speaking-korean-pronunciation-tips"),
  "is-korean-hard-to-learn": () => import("./content/is-korean-hard-to-learn"),
  "how-to-understand-korean-dialects-bts-suga": () => import("./content/how-to-understand-korean-dialects-bts-suga"),
  "korean-study-plans-realistic-flexible-goals": () => import("./content/korean-study-plans-realistic-flexible-goals"),
  "why-essential-korean-words-are-more-than-vocab": () => import("./content/why-essential-korean-words-are-more-than-vocab"),
  "balanced-practice-trumps-method-for-korean": () => import("./content/balanced-practice-trumps-method-for-korean"),
  "mastering-korean-emotions-not-just-words": () => import("./content/mastering-korean-emotions-not-just-words"),
  "how-long-does-it-take-to-learn-korean": () =>
    import("./content/how-long-does-it-take-to-learn-korean"),
  "korean-conversation-practice": () =>
    import("./content/korean-conversation-practice"),
  "easy-korean-reading": () => import("./content/easy-korean-reading"),
  "best-korean-textbook-for-self-study": () =>
    import("./content/best-korean-textbook-for-self-study"),
  "is-duolingo-good-for-korean": () =>
    import("./content/is-duolingo-good-for-korean"),
  "anki-korean": () => import("./content/anki-korean"),
};  

export async function listBlogPosts(limit = 100): Promise<BlogPostCard[]> {
  const overrides = await readBlogOverrides();
  const results = await Promise.all(
    BLOG_LISTED_SLUGS.map(async (slug) => {
      const loader = loaders[slug];
      if (!loader) return null;
      const m = await loader();
      const p = m.post;
      if (!p) return null;
      const o = overrides[p.slug];
      const merged = {
        ...p,
        imageThumb: o?.imageThumb ?? p.imageThumb,
        imageLarge: o?.imageLarge ?? p.imageLarge,
      };
      const cover = resolveBlogCoverImage(merged);
      return {
        slug: p.slug,
        title: p.title,
        imageThumb: cover,
        imageLarge: cover,
        level: p.level,
        createdAt: p.createdAt,
        excerpt: excerptFromBlogPost(p),
        pinned: o?.pinned ?? false,
      } satisfies BlogPostCard;
    }),
  );
  const list = results.filter(Boolean) as BlogPostCard[];
  list.sort((a, b) => {
    const ra = LISTED_RANK.get(a.slug) ?? 999;
    const rb = LISTED_RANK.get(b.slug) ?? 999;
    if (ra !== rb) return ra - rb;
    const pinA = a.pinned ? 1 : 0;
    const pinB = b.pinned ? 1 : 0;
    if (pinB !== pinA) return pinB - pinA;
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });
  return list.slice(0, Math.min(limit, list.length));
}

async function blogPostCardForSlug(
  slug: string,
  overrides: Record<string, BlogImageOverrides>,
): Promise<BlogPostCard | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  const p = m.post;
  if (!p) return null;
  const o = overrides[p.slug];
  const merged = {
    ...p,
    imageThumb: o?.imageThumb ?? p.imageThumb,
    imageLarge: o?.imageLarge ?? p.imageLarge,
  };
  const cover = resolveBlogCoverImage(merged);
  return {
    slug: p.slug,
    title: p.title,
    imageThumb: cover || undefined,
    imageLarge: cover || undefined,
    level: p.level,
    createdAt: p.createdAt,
    excerpt: excerptFromBlogPost(p),
    pinned: o?.pinned ?? false,
  };
}

/**
 * Related notes by keyword cluster. Listed pages only link to listed peers
 * (no draft leak). Draft pages may include unlisted cluster peers for editing.
 */
export async function listRelatedBlogPosts(
  slug: string,
  limit = 4,
): Promise<BlogPostCard[]> {
  const allowUnlisted = !blogPostIsListed(slug);
  const relatedSlugs = relatedBlogSlugsFor(slug, limit, {
    allowUnlisted,
    listedOnly: BLOG_LISTED_SLUGS,
  });
  if (relatedSlugs.length === 0) return [];
  const overrides = await readBlogOverrides();
  const cards = await Promise.all(
    relatedSlugs.map((s) => blogPostCardForSlug(s, overrides)),
  );
  return cards.filter(Boolean) as BlogPostCard[];
}

/** Drop authorHint so unpublished rewrite notes never reach HTML / JSON-LD. */
function stripAuthorHints(post: BlogPost): BlogPost {
  const { authorHint: _postHint, ...rest } = post;
  void _postHint;
  return {
    ...rest,
    paragraphs: post.paragraphs.map((p) => {
      const { authorHint: _hint, ...block } = p;
      void _hint;
      return block;
    }),
  };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  const raw = m.post ?? null;
  if (!raw) return null;
  const post = stripAuthorHints(raw);
  const overrides = await readBlogOverrides();
  const o = overrides[slug];
  if (!o) return post;
  const merged: BlogPost = {
    ...post,
    imageThumb: o.imageThumb ?? post.imageThumb,
    imageLarge: o.imageLarge ?? post.imageLarge,
    paragraphs: post.paragraphs.map((p, i) => {
      const overriddenImage =
        o.paragraphImages && o.paragraphImages.length > 0
          ? o.paragraphImages[i] ?? p.image
          : p.image;
      const overriddenAspect =
        o.paragraphImageAspects && o.paragraphImageAspects.length > 0
          ? o.paragraphImageAspects[i] ?? p.imageAspect
          : p.imageAspect;
      return {
        ...p,
        image: overriddenImage,
        imageAspect: overriddenAspect,
      };
    }),
  };
  return merged;
}
