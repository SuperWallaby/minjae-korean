/**
 * Blog posts — JSON/TS 파일로 관리. content/*.ts 에서 export const post.
 * 새 글: content/your-slug.ts 추가 후 SLUG_LIST + loaders 에 등록.
 * 개발 모드에서 업로드한 이미지는 blog-overrides.json 에 저장되어 병합됨.
 */

import * as fs from "fs/promises";
import * as path from "path";

import type {
  BlogPost,
  BlogPostCard,
  BlogImageOverrides,
} from "./types";

const OVERRIDES_PATH = path.join(process.cwd(), "blog-overrides.json");

async function readBlogOverrides(): Promise<Record<string, BlogImageOverrides>> {
  try {
    const raw = await fs.readFile(OVERRIDES_PATH, "utf-8");
    const data = JSON.parse(raw) as Record<string, BlogImageOverrides>;
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

const SLUG_LIST = [
  "bts-7-letters-far-future-korean-phrases",
  "why-eun-neun-and-i-ga-feel-so-different",
  "why-koreans-cant-speak-english-after-12-years",
  "good-korean-teacher-2026",
] as const;
type Slug = (typeof SLUG_LIST)[number];

const loaders: Record<
  Slug,
  () => Promise<{ post: BlogPost }>
> = {
  "bts-7-letters-far-future-korean-phrases": () => import("./content/bts-7-letters-far-future-korean-phrases"),
  "why-eun-neun-and-i-ga-feel-so-different": () => import("./content/why-eun-neun-and-i-ga-feel-so-different"),
  "why-koreans-cant-speak-english-after-12-years": () => import("./content/why-koreans-cant-speak-english-after-12-years"),
  "good-korean-teacher-2026": () => import("./content/good-korean-teacher-2026"),
};  

export async function listBlogPosts(limit = 100): Promise<BlogPostCard[]> {
  const overrides = await readBlogOverrides();
  const results = await Promise.all(
    SLUG_LIST.map(async (slug) => {
      const loader = loaders[slug];
      if (!loader) return null;
      const m = await loader();
      const p = m.post;
      if (!p) return null;
      const o = overrides[p.slug];
      return {
        slug: p.slug,
        title: p.title,
        imageThumb: o?.imageThumb ?? p.imageThumb,
        imageLarge: o?.imageLarge ?? p.imageLarge,
        level: p.level,
        createdAt: p.createdAt,
      } satisfies BlogPostCard;
    }),
  );
  const list = results.filter(Boolean) as BlogPostCard[];
  list.sort((a, b) => {
    const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tB - tA;
  });
  return list.slice(0, Math.min(limit, list.length));
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const loader = loaders[slug as Slug];
  if (!loader) return null;
  const m = await loader();
  const post = m.post ?? null;
  if (!post) return null;
  const overrides = await readBlogOverrides();
  const o = overrides[slug];
  if (!o) return post;
  const merged: BlogPost = {
    ...post,
    imageThumb: o.imageThumb ?? post.imageThumb,
    imageLarge: o.imageLarge ?? post.imageLarge,
    paragraphs:
      o.paragraphImages && o.paragraphImages.length > 0
        ? post.paragraphs.map((p, i) => ({
            ...p,
            image: o.paragraphImages![i] ?? p.image,
          }))
        : post.paragraphs,
  };
  return merged;
}
