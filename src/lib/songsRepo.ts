import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type TimeRangeMs = {
  startMs: number;
  endMs: number;
};

/** 단어(구) 단위 재생 구간. 0.1초 단위. 재생 시 해당 단어 하이라이트용 */
export type WordTiming = {
  startMs: number;
  endMs: number;
};

export type SongSource =
  | { provider: "youtube"; videoId: string }
  | { provider: "spotify"; trackId: string }
  | { provider: "custom"; url: string };

export type LexemeSense = {
  pos?: "noun" | "verb" | "adj" | "adv" | "particle" | "phrase" | "other";
  meaning: string;
  nuance?: string;
  examples?: Array<{
    ko?: string;
    translation?: string;
    sourceChunkId?: string;
  }>;
};

export type Lexeme = {
  id: string;
  form: string;
  lemma?: string;
  senses: LexemeSense[];
  note?: string;
  /** 발음 기호 (IPA/로마자 등). News vocabulary phonetic과 동일 구조 */
  phonetic?: string;
  /** 발음 TTS 오디오 URL */
  audioUrl?: string;
  /** 유튜브 재생 위치 (초). 미리보기에서 해당 시간으로 이동용 */
  startSec?: number;
};

export type AidBlock =
  | { type: "translation"; text: string }
  | { type: "natural_english"; text: string }
  | { type: "explanation"; text: string }
  | { type: "nuance_vs_english"; text: string }
  | { type: "grammar"; title?: string; text: string; refs?: string[] }
  | { type: "vocab"; lexemeIds: string[] }
  | { type: "quiz"; prompt: string; choices?: string[]; answer: string; explanation?: string }
  | { type: "callout"; tone?: "info" | "warn"; text: string };

export type SongChunk = {
  id: string;
  index: number;
  range?: TimeRangeMs | null;
  /** 단어 순서별 start/end (ms). 재생 시 단어 하이라이트용 */
  wordTimings?: WordTiming[];
  lines: string[];
  aid?: {
    blocks: AidBlock[];
  };
  difficulty?: CEFR;
  tags?: string[];
};

export type SongCard = {
  title: string;
  artist: string;
  language?: string;
  level: CEFR;
  tags?: string[];
  source?: SongSource;
  images?: {
    thumb?: string;
    large?: string;
  };
  lexicon?: Lexeme[];
  chunks: SongChunk[];
  createdAt?: string;
  updatedAt?: string;
};

export type Song = SongCard & { slug: string };

type SongDoc = Omit<Song, "slug"> & { _id: string; slug: string };

type Collections = {
  songs: Collection<SongDoc>;
};

let indexesPromise: Promise<void> | null = null;

async function cols(): Promise<Collections> {
  const db = await getMongoDb();
  const songs = db.collection<SongDoc>("songs");

  if (!indexesPromise) {
    indexesPromise = (async () => {
      try {
        await songs.createIndex({ createdAt: -1 });
        await songs.createIndex({ level: 1, createdAt: -1 });
      } catch {
        // ignore
      }
    })();
  }
  void indexesPromise;

  return { songs };
}

function nowIso() {
  return new Date().toISOString();
}

function normalizeTimeRange(v: unknown): TimeRangeMs | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  const startMs = typeof o.startMs === "number" ? o.startMs : null;
  const endMs = typeof o.endMs === "number" ? o.endMs : null;
  if (startMs == null || endMs == null) return null;
  return { startMs, endMs };
}

export function normalizeWordTimings(v: unknown): WordTiming[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const startMs = typeof o.startMs === "number" ? o.startMs : null;
      const endMs = typeof o.endMs === "number" ? o.endMs : null;
      if (startMs == null || endMs == null) return null;
      return { startMs, endMs };
    })
    .filter((x): x is WordTiming => x != null);
}

function normalizeAidBlock(b: unknown): AidBlock | null {
  if (!b || typeof b !== "object") return null;
  const o = b as Record<string, unknown>;
  const type = String(o.type ?? "").trim();
  if (type === "translation" && typeof o.text === "string") {
    return { type: "translation", text: o.text.trim() };
  }
  if (type === "natural_english" && typeof o.text === "string") {
    return { type: "natural_english", text: o.text.trim() };
  }
  if (type === "explanation" && typeof o.text === "string") {
    return { type: "explanation", text: o.text.trim() };
  }
  if (type === "nuance_vs_english" && typeof o.text === "string") {
    return { type: "nuance_vs_english", text: o.text.trim() };
  }
  if (type === "grammar" && typeof o.text === "string") {
    return {
      type: "grammar",
      title: typeof o.title === "string" ? o.title.trim() || undefined : undefined,
      text: o.text.trim(),
      refs: Array.isArray(o.refs) ? o.refs.map((r) => String(r)).filter(Boolean) : undefined,
    };
  }
  if (type === "vocab" && Array.isArray(o.lexemeIds)) {
    return { type: "vocab", lexemeIds: o.lexemeIds.map((id) => String(id)).filter(Boolean) };
  }
  if (type === "quiz" && typeof o.prompt === "string" && typeof o.answer === "string") {
    return {
      type: "quiz",
      prompt: o.prompt.trim(),
      choices: Array.isArray(o.choices) ? o.choices.map((c) => String(c)) : undefined,
      answer: o.answer.trim(),
      explanation: typeof o.explanation === "string" ? o.explanation.trim() : undefined,
    };
  }
  if (type === "callout" && typeof o.text === "string") {
    return {
      type: "callout",
      tone: o.tone === "warn" || o.tone === "info" ? o.tone : undefined,
      text: o.text.trim(),
    };
  }
  return null;
}

function normalizeChunks(v: unknown): SongChunk[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x, idx) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;

      // New shape: lines + aid.blocks
      let lines: string[];
      let aid: { blocks: AidBlock[] } | undefined;

      if (Array.isArray(o.lines) && o.lines.length > 0) {
        lines = o.lines.map((l) => String(l ?? "").trim()).filter(Boolean);
        if (lines.length === 0) return null;
        const aidObj = o.aid && typeof o.aid === "object" ? (o.aid as Record<string, unknown>) : {};
        const blocks = Array.isArray(aidObj.blocks)
          ? aidObj.blocks.map(normalizeAidBlock).filter((b): b is AidBlock => b != null)
          : [];
        if (blocks.length > 0) aid = { blocks };
      } else {
        // Legacy: text + aid.translation / aid.explanation / aid.vocab
        const text = String(o.text ?? "").trim();
        if (!text) return null;
        lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length === 0) lines = [text];
        const legacyAid = o.aid && typeof o.aid === "object" ? (o.aid as Record<string, unknown>) : {};
        const blocks: AidBlock[] = [];
        const tr = String(legacyAid.translation ?? "").trim();
        if (tr) blocks.push({ type: "translation", text: tr });
        const ex = String(legacyAid.explanation ?? "").trim();
        if (ex) blocks.push({ type: "explanation", text: ex });
        if (Array.isArray(legacyAid.vocab) && legacyAid.vocab.length > 0) {
          blocks.push({ type: "vocab", lexemeIds: [] });
        }
        if (blocks.length > 0) aid = { blocks };
      }

      const range =
        o.range && typeof o.range === "object"
          ? normalizeTimeRange(o.range)
          : typeof o.startMs === "number" && typeof o.endMs === "number"
            ? { startMs: o.startMs, endMs: o.endMs }
            : undefined;

      const cefr = o.difficulty as CEFR | undefined;
      const validCefr: CEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
      const difficulty = cefr && validCefr.includes(cefr) ? cefr : undefined;
      const tags = Array.isArray(o.tags) ? o.tags.map((t) => String(t).trim()).filter(Boolean) : undefined;
      const wordTimings = normalizeWordTimings(o.wordTimings);

      return {
        id: String(o.id ?? `chunk_${idx}`),
        index: typeof o.index === "number" ? o.index : idx,
        range: range ?? undefined,
        wordTimings: wordTimings.length > 0 ? wordTimings : undefined,
        lines,
        aid,
        difficulty,
        tags,
      } satisfies SongChunk;
    })
    .filter(Boolean) as SongChunk[];
}

/** Migrate old doc chunk (text + aid.translation/explanation/vocab) to new shape for reading */
export function migrateChunkToNewShape(raw: unknown): SongChunk {
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.lines) && o.lines.length > 0) {
      const lines = o.lines.map((l) => String(l ?? "").trim()).filter(Boolean);
      if (lines.length > 0) {
        const aidObj = o.aid && typeof o.aid === "object" ? (o.aid as Record<string, unknown>) : {};
        const blocks = Array.isArray(aidObj.blocks)
          ? (aidObj.blocks as AidBlock[])
          : [];
        return {
          id: String(o.id ?? "chunk_0"),
          index: typeof o.index === "number" ? o.index : 0,
          range: o.range && typeof o.range === "object" ? normalizeTimeRange(o.range) ?? undefined : undefined,
          wordTimings: normalizeWordTimings(o.wordTimings).length > 0 ? normalizeWordTimings(o.wordTimings) : undefined,
          lines,
          aid: blocks.length > 0 ? { blocks } : undefined,
          difficulty: (["A1", "A2", "B1", "B2", "C1", "C2"] as const).includes(o.difficulty as CEFR) ? (o.difficulty as CEFR) : undefined,
          tags: Array.isArray(o.tags) ? o.tags.map(String) : undefined,
        };
      }
    }
    const text = String(o.text ?? "").trim();
    if (text) {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      const aidObj = o.aid && typeof o.aid === "object" ? (o.aid as Record<string, unknown>) : {};
      const blocks: AidBlock[] = [];
      const tr = String(aidObj.translation ?? "").trim();
      if (tr) blocks.push({ type: "translation", text: tr });
      const ex = String(aidObj.explanation ?? "").trim();
      if (ex) blocks.push({ type: "explanation", text: ex });
      if (Array.isArray(aidObj.vocab) && aidObj.vocab.length > 0) {
        blocks.push({ type: "vocab", lexemeIds: [] });
      }
      return {
        id: String(o.id ?? "chunk_0"),
        index: typeof o.index === "number" ? o.index : 0,
        range:
          typeof o.startMs === "number" && typeof o.endMs === "number"
            ? { startMs: o.startMs, endMs: o.endMs }
            : undefined,
        wordTimings: normalizeWordTimings(o.wordTimings).length > 0 ? normalizeWordTimings(o.wordTimings) : undefined,
        lines: lines.length > 0 ? lines : [text],
        aid: blocks.length > 0 ? { blocks } : undefined,
      };
    }
  }
  return { id: "chunk_0", index: 0, lines: [""] };
}

function normalizeSource(v: unknown): SongSource | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const provider = String(o.provider ?? "").trim().toLowerCase();
  if (provider === "youtube" || !provider) {
    const videoId = String(o.videoId ?? "").trim();
    if (videoId) return { provider: "youtube", videoId };
  }
  if (provider === "spotify") {
    const trackId = String(o.trackId ?? "").trim();
    if (trackId) return { provider: "spotify", trackId };
  }
  if (provider === "custom") {
    const url = String(o.url ?? "").trim();
    if (url) return { provider: "custom", url };
  }
  const videoId = String(o.videoId ?? "").trim();
  if (videoId) return { provider: "youtube", videoId };
  return undefined;
}

function normalizeLexicon(v: unknown): Lexeme[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x): Lexeme | null => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const id = String(o.id ?? "").trim();
      const form = String(o.form ?? "").trim();
      if (!id || !form) return null;
      const senses = Array.isArray(o.senses)
        ? o.senses
            .map((s): LexemeSense | null => {
              if (!s || typeof s !== "object") return null;
              const so = s as Record<string, unknown>;
              const meaning = String(so.meaning ?? "").trim();
              if (!meaning) return null;
              const pos = so.pos as LexemeSense["pos"];
              const validPos = ["noun", "verb", "adj", "adv", "particle", "phrase", "other"] as const;
              return {
                pos: pos && validPos.includes(pos) ? pos : undefined,
                meaning,
                nuance: typeof so.nuance === "string" ? so.nuance.trim() || undefined : undefined,
                examples: Array.isArray(so.examples)
                  ? (so.examples
                      .map((e) => {
                        if (!e || typeof e !== "object") return null;
                        const ex = e as Record<string, unknown>;
                        return {
                          ko: typeof ex.ko === "string" ? ex.ko : undefined,
                          translation: typeof ex.translation === "string" ? ex.translation : undefined,
                          sourceChunkId: typeof ex.sourceChunkId === "string" ? ex.sourceChunkId : undefined,
                        };
                      })
                      .filter(Boolean) as LexemeSense["examples"])
                  : undefined,
              };
            })
            .filter((b): b is LexemeSense => b != null)
        : [];
      if (senses.length === 0) return null;
      const lex: Lexeme = {
        id,
        form,
        lemma: typeof o.lemma === "string" ? o.lemma.trim() || undefined : undefined,
        senses,
        note: typeof o.note === "string" ? o.note.trim() || undefined : undefined,
        phonetic: typeof o.phonetic === "string" ? o.phonetic.trim() || undefined : undefined,
        audioUrl: typeof o.audioUrl === "string" ? o.audioUrl.trim() || undefined : undefined,
        startSec: typeof o.startSec === "number" && Number.isFinite(o.startSec) ? o.startSec : undefined,
      };
      return lex;
    })
    .filter((b): b is Lexeme => b != null);
}

function normalizeImages(v: unknown): SongCard["images"] {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const thumb = typeof o.thumb === "string" ? o.thumb.trim() || undefined : undefined;
  const large = typeof o.large === "string" ? o.large.trim() || undefined : undefined;
  if (!thumb && !large) return undefined;
  return { thumb, large };
}

const CEFR_VALUES: CEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
function normalizeLevel(v: unknown): CEFR {
  const s = String(v ?? "A1").trim().toUpperCase();
  if (CEFR_VALUES.includes(s as CEFR)) return s as CEFR;
  return "A1";
}

function normalizeTags(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((t) => String(t ?? "").trim()).filter(Boolean);
}

export function slugifyTitle(title: string, artist?: string): string {
  const raw = `${title} ${artist ?? ""}`.trim();
  if (!raw) return "";

  const s = raw
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return s;
}

type SongDocLegacy = SongDoc & {
  imageThumb?: string;
  imageLarge?: string;
};

function toSong(doc: SongDoc | SongDocLegacy): Song {
  const { _id, slug, chunks: rawChunks, imageThumb, imageLarge, ...rest } = doc as SongDocLegacy;
  const chunks = Array.isArray(rawChunks) ? rawChunks.map(migrateChunkToNewShape) : [];
  const images =
    rest.images ??
    (imageThumb || imageLarge ? { thumb: imageThumb, large: imageLarge } : undefined);
  return {
    slug: slug || String(_id),
    ...rest,
    images,
    chunks,
  };
}

async function uniqueSlugFromBase(base: string): Promise<string> {
  const b = base.slice(0, 80);
  const { songs } = await cols();

  let slug = b;
  for (let i = 0; i < 50; i++) {
    const exists = await songs.findOne({ _id: slug }, { projection: { _id: 1 } });
    if (!exists) return slug;
    slug = `${b}-${i + 2}`;
  }
  return `${b}-${Date.now().toString(36)}`;
}

export async function listSongs(limit = 50): Promise<Song[]> {
  const { songs } = await cols();
  const n = Math.min(500, Math.max(1, Math.floor(limit)));
  const docs = await songs
    .find({})
    .sort({ createdAt: -1 })
    .limit(n)
    .toArray();
  return docs.map(toSong);
}

export async function getSong(slug: string): Promise<Song | null> {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const { songs } = await cols();
  const doc = await songs.findOne({ slug: s });
  return doc ? toSong(doc) : null;
}

export async function createSong(draft: Partial<SongCard> & { title: string; slug?: string }): Promise<Song> {
  const title = String(draft.title ?? "").trim();
  if (!title) throw new Error("Missing title");

  const artist = String(draft.artist ?? "").trim();
  const suppliedSlug = typeof draft.slug === "string" ? draft.slug.trim() : "";
  const slugBase = suppliedSlug || slugifyTitle(title, artist) || `song-${Date.now().toString(36)}`;
  const slug = await uniqueSlugFromBase(slugBase);
  const createdAt = draft.createdAt || nowIso();

  const doc: SongDoc = {
    _id: slug,
    slug,
    title,
    artist,
    level: normalizeLevel(draft.level),
    language: typeof draft.language === "string" ? draft.language.trim() || undefined : undefined,
    tags: normalizeTags(draft.tags),
    source: normalizeSource(draft.source),
    images: normalizeImages(draft.images),
    lexicon: Array.isArray(draft.lexicon) && draft.lexicon.length > 0 ? normalizeLexicon(draft.lexicon) : undefined,
    chunks: normalizeChunks(draft.chunks),
    createdAt,
    updatedAt: createdAt,
  };

  const { songs } = await cols();
  await songs.insertOne(doc);
  return toSong(doc);
}

export async function updateSong(
  slug: string,
  patch: Partial<SongCard>,
): Promise<Song | null> {
  const s = String(slug ?? "").trim();
  if (!s) return null;
  const { songs } = await cols();

  const cur = await songs.findOne({ slug: s });
  if (!cur) return null;

  const next: Partial<SongDoc> = {
    ...(patch.title !== undefined ? { title: String(patch.title ?? "").trim() } : {}),
    ...(patch.artist !== undefined ? { artist: String(patch.artist ?? "").trim() } : {}),
    ...(patch.level !== undefined ? { level: normalizeLevel(patch.level) } : {}),
    ...(patch.language !== undefined ? { language: String(patch.language ?? "").trim() || undefined } : {}),
    ...(patch.tags !== undefined ? { tags: normalizeTags(patch.tags) } : {}),
    ...(patch.source !== undefined ? { source: normalizeSource(patch.source) } : {}),
    ...(patch.images !== undefined ? { images: normalizeImages(patch.images) } : {}),
    ...(patch.lexicon !== undefined ? { lexicon: normalizeLexicon(patch.lexicon) } : {}),
    ...(patch.chunks !== undefined ? { chunks: normalizeChunks(patch.chunks) } : {}),
    updatedAt: nowIso(),
  };

  await songs.updateOne({ _id: cur._id }, { $set: next });
  const doc = await songs.findOne({ _id: cur._id });
  return doc ? toSong(doc) : toSong({ ...cur, ...next } as SongDoc);
}

export async function deleteSong(slug: string): Promise<boolean> {
  const s = String(slug ?? "").trim();
  if (!s) return false;
  const { songs } = await cols();
  const res = await songs.deleteOne({ _id: s });
  return res.deletedCount === 1;
}
