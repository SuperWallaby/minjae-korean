import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";
import { suggestSlugFromGemini } from "@/lib/slugFromGemini";

export type ReadingLevel = 1 | 2 | 3 | 4 | 5;

export type ParagraphBlock = {
  image?: string; // url
  subtitle: string;
  content: string;
  /** YouTube URL or video ID — rendered as embed between paragraphs */
  youtube?: string;
};

export type VocabItem = {
  sound?: string; // url — word pronunciation
  word: string;
  description_en: string;
  example: string;
  image?: string; // url — e.g. Unsplash small
  phonetic?: string; // pronunciation in English (IPA etc.)
  exampleSound?: string; // url — audio for example sentence
};

export type ArticleCard = {
  /** Unique code (optional, teacher-provided) */
  articleCode?: string;
  /** Multi-level tags */
  levels: ReadingLevel[];
  /** Primary level */
  level: ReadingLevel;
  title: string;
  audio?: string; // url
  imageThumb?: string; // url
  imageLarge?: string; // url
  paragraphs: ParagraphBlock[];
  vocabulary: VocabItem[];
  questions: string[];
  discussion: string[];
  /** 이미지 로봇 검색 방지 (저작권 보호) */
  noImageIndex?: boolean;
  createdAt?: string; // ISO
  updatedAt?: string; // ISO
};

export type Article = ArticleCard & {
  slug: string;
};

type ArticleDoc = Omit<Article, "slug"> & { _id: string; slug: string };

type Collections = {
  articles: Collection<ArticleDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const articles = db.collection<ArticleDoc>("articles");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await articles.createIndex({ createdAt: -1 });
        await articles.createIndex({ updatedAt: -1 });
        await articles.createIndex({ level: 1, createdAt: -1 });
        await articles.createIndex({ levels: 1, createdAt: -1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { articles };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeLevel(v: unknown): ReadingLevel {
  const n = Number(v);
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n;
  return 1;
}

function normalizeLevels(v: unknown): ReadingLevel[] {
  const raw = Array.isArray(v) ? v : [];
  const set = new Set<ReadingLevel>();
  for (const x of raw) set.add(normalizeLevel(x));
  return Array.from(set.values()).sort((a, b) => a - b);
}

function normalizeStrings(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => String(x ?? "").trim())
    .filter(Boolean);
}

function normalizeParagraphs(v: unknown): ParagraphBlock[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const subtitle = String(o.subtitle ?? "").trim();
      const content = String(o.content ?? "").trim();
      const image = String(o.image ?? "").trim();
      const youtube = String(o.youtube ?? "").trim();
      if (!subtitle && !content && !image && !youtube) return null;
      return {
        subtitle,
        content,
        image: image || undefined,
        youtube: youtube || undefined,
      } satisfies ParagraphBlock;
    })
    .filter(Boolean) as ParagraphBlock[];
}

function normalizeVocab(v: unknown): VocabItem[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const word = String(o.word ?? "").trim();
      const description_en = String(o.description_en ?? "").trim();
      const example = String(o.example ?? "").trim();
      const sound = String(o.sound ?? "").trim();
      const image = String(o.image ?? "").trim();
      const phonetic = String(o.phonetic ?? "").trim();
      const exampleSound = String(o.exampleSound ?? "").trim();
      if (!word && !description_en && !example && !sound && !image && !phonetic && !exampleSound) return null;
      return {
        word,
        description_en,
        example,
        sound: sound || undefined,
        image: image || undefined,
        phonetic: phonetic || undefined,
        exampleSound: exampleSound || undefined,
      } satisfies VocabItem;
    })
    .filter(Boolean) as VocabItem[];
}

/** Slug: alphabet-only (a-z), digits, hyphens. Non-ASCII is stripped. */
export function slugifyTitle(title: string): string {
  const raw = String(title ?? "").trim();
  if (!raw) return "";

  const s = raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s;
}

/** 사람이 읽기 좋은 slug용: 끝의 -YYYY-MM-DD 제거, 필요 시 소스 접두사(nyt- 등) 제거 */
function shortenArticleCodeForSlug(articleCode: string): string {
  let s = String(articleCode ?? "").trim().toLowerCase();
  if (!s) return "";

  // 끝의 -2026-02-12 형태 제거
  s = s.replace(/-\d{4}-\d{2}-\d{2}$/, "");

  // 자주 쓰는 소스 접두사 제거 (슬러그를 주제 중심으로)
  const sourcePrefixes = ["nyt-", "nytimes-"];
  for (const prefix of sourcePrefixes) {
    if (s.startsWith(prefix)) {
      s = s.slice(prefix.length).replace(/^-+/, "");
      break;
    }
  }

  return slugifyTitle(s) || s;
}

function toArticle(doc: ArticleDoc): Article {
  const { _id, slug, ...rest } = doc;
  return { slug: slug || String(_id), ...rest };
}

/** Generate unique slug from a base string (alphabet-only). Collision adds -2, -3, … */
async function uniqueSlugFromBase(base: string): Promise<string> {
  const b = base.slice(0, 80);
  const { articles } = await cols();

  let slug = b;
  for (let i = 0; i < 50; i++) {
    const exists = await articles.findOne({ _id: slug }, { projection: { _id: 1 } });
    if (!exists) return slug;
    slug = `${b}-${i + 2}`;
  }
  return `${b}-${Date.now().toString(36)}`;
}

/** Slug base: prefer shortened articleCode (readable), else slugified title, else fallback. */
function slugBaseForArticle(title: string, articleCode?: string): string {
  const fromCode = articleCode ? shortenArticleCodeForSlug(articleCode) : "";
  const fromTitle = slugifyTitle(title);
  return fromCode || fromTitle || `article-${Date.now().toString(36)}`;
}

/** Slugs to hide from all lists and from direct access (404). */
const EXCLUDED_ARTICLE_SLUGS = ["nyt-tmag-night-owls-2026-02-12"];

export async function listArticles(limit = 50): Promise<Article[]> {
  const { articles } = await cols();
  const n = Math.min(500, Math.max(1, Math.floor(limit)));
  const docs = await articles
    .find({})
    .sort({ createdAt: -1 })
    .limit(n)
    .toArray();
  const filtered = docs.filter((d) => !EXCLUDED_ARTICLE_SLUGS.includes(d.slug));
  return filtered.map(toArticle);
}

export async function getArticle(slug: string): Promise<Article | null> {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  if (EXCLUDED_ARTICLE_SLUGS.includes(s)) return null;
  const { articles } = await cols();
  const doc = await articles.findOne({ slug: s });
  return doc ? toArticle(doc) : null;
}

export async function createArticle(draft: Partial<ArticleCard> & { title: string }): Promise<Article> {
  const title = String(draft.title ?? "").trim();
  if (!title) throw new Error("Missing title");

  const articleCode = typeof draft.articleCode === "string" ? draft.articleCode.trim() || undefined : undefined;
  // slug 공급 시 그대로 우선 사용, 중복이면 uniqueSlugFromBase가 -2, -3 붙임
  const suppliedBase = articleCode ? slugifyTitle(articleCode) : "";
  const slugBase = suppliedBase
    ? suppliedBase
    : (await suggestSlugFromGemini(title, draft.paragraphs?.[0]?.content?.trim?.())) ?? slugBaseForArticle(title, undefined);
  const slug = await uniqueSlugFromBase(slugBase);
  const createdAt = nowIso();

  const doc: ArticleDoc = {
    _id: slug,
    slug,
    articleCode,
    levels: normalizeLevels(draft.levels),
    level: normalizeLevel(draft.level),
    title,
    audio: typeof draft.audio === "string" ? draft.audio.trim() || undefined : undefined,
    imageThumb: typeof draft.imageThumb === "string" ? draft.imageThumb.trim() || undefined : undefined,
    imageLarge: typeof draft.imageLarge === "string" ? draft.imageLarge.trim() || undefined : undefined,
    paragraphs: normalizeParagraphs(draft.paragraphs),
    vocabulary: normalizeVocab(draft.vocabulary),
    questions: normalizeStrings(draft.questions),
    discussion: normalizeStrings(draft.discussion),
    createdAt,
    updatedAt: createdAt,
  };

  // Ensure at least one level tag.
  if (!doc.levels.length) doc.levels = [doc.level];

  const { articles } = await cols();
  await articles.insertOne(doc);
  return toArticle(doc);
}

export async function updateArticle(
  slug: string,
  patch: Partial<ArticleCard>,
): Promise<Article | null> {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const { articles } = await cols();

  const cur = await articles.findOne({ slug: s });
  if (!cur) return null;

  const next: Partial<ArticleDoc> = {
    ...(patch.articleCode !== undefined
      ? { articleCode: String(patch.articleCode ?? "").trim() || undefined }
      : null),
    ...(patch.title !== undefined ? { title: String(patch.title ?? "").trim() } : null),
    ...(patch.level !== undefined ? { level: normalizeLevel(patch.level) } : null),
    ...(patch.levels !== undefined ? { levels: normalizeLevels(patch.levels) } : null),
    ...(patch.audio !== undefined ? { audio: String(patch.audio ?? "").trim() || undefined } : null),
    ...(patch.imageThumb !== undefined
      ? { imageThumb: String(patch.imageThumb ?? "").trim() || undefined }
      : null),
    ...(patch.imageLarge !== undefined
      ? { imageLarge: String(patch.imageLarge ?? "").trim() || undefined }
      : null),
    ...(patch.paragraphs !== undefined ? { paragraphs: normalizeParagraphs(patch.paragraphs) } : null),
    ...(patch.vocabulary !== undefined ? { vocabulary: normalizeVocab(patch.vocabulary) } : null),
    ...(patch.questions !== undefined ? { questions: normalizeStrings(patch.questions) } : null),
    ...(patch.discussion !== undefined ? { discussion: normalizeStrings(patch.discussion) } : null),
    updatedAt: nowIso(),
  };

  // Keep levels sane.
  if (next.levels && !next.levels.length) {
    next.levels = [normalizeLevel(next.level ?? cur.level)];
  }

  // #region agent log
  const nextKeys = Object.keys(next).filter((k) => k !== "updatedAt");
  const res = await articles.updateOne({ _id: cur._id }, { $set: next });
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "articlesRepo.ts:updateArticle",
      message: "updateOne result",
      data: {
        slugParam: s,
        curId: String(cur._id),
        idEqualsSlug: cur._id === s,
        nextKeys,
        matchedCount: res.matchedCount,
        modifiedCount: res.modifiedCount,
      },
      timestamp: Date.now(),
      hypothesisId: "A",
    }),
  }).catch(() => {});
  // #endregion
  const doc = await articles.findOne({ _id: cur._id });
  return doc ? toArticle(doc) : toArticle({ ...cur, ...next } as ArticleDoc);
}

export async function deleteArticle(slug: string): Promise<boolean> {
  const s = String(slug ?? "").trim();
  if (!s) return false;
  const { articles } = await cols();
  const res = await articles.deleteOne({ _id: s });
  return res.deletedCount === 1;
}

