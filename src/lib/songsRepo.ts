import type { Collection } from "mongodb";

import { getMongoDb } from "@/lib/mongo";

export type VocabItem = {
  word: string;
  meaning: string;
  note?: string;
};

export type ChunkAid = {
  translation: string;
  explanation: string;
  vocab: VocabItem[];
};

export type SongChunk = {
  id: string;
  index: number;
  startMs?: number | null;
  endMs?: number | null;
  text: string;
  aid: ChunkAid;
};

export type SongSource = {
  provider: string;
  videoId: string;
};

export type SongCard = {
  title: string;
  artist: string;
  level: string;
  language?: string;
  tags?: string[];
  source?: SongSource;
  imageThumb?: string;
  imageLarge?: string;
  chunks: SongChunk[];
  createdAt?: string;
  updatedAt?: string;
};

export type Song = SongCard & {
  slug: string;
};

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

function normalizeChunks(v: unknown): SongChunk[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((x, idx) => {
      if (!x || typeof x !== "object") return null;
      const o = x as Record<string, unknown>;
      const text = String(o.text ?? "").trim();
      if (!text) return null;

      const aid = o.aid && typeof o.aid === "object" ? (o.aid as Record<string, unknown>) : {};
      const vocab = Array.isArray(aid.vocab)
        ? aid.vocab.map((vv: unknown) => {
            const vo = vv && typeof vv === "object" ? (vv as Record<string, unknown>) : {};
            return {
              word: String(vo.word ?? ""),
              meaning: String(vo.meaning ?? ""),
              note: vo.note ? String(vo.note) : undefined,
            };
          })
        : [];

      return {
        id: String(o.id ?? `chunk_${idx}`),
        index: typeof o.index === "number" ? o.index : idx,
        startMs: typeof o.startMs === "number" ? o.startMs : null,
        endMs: typeof o.endMs === "number" ? o.endMs : null,
        text,
        aid: {
          translation: String(aid.translation ?? ""),
          explanation: String(aid.explanation ?? ""),
          vocab,
        },
      } satisfies SongChunk;
    })
    .filter(Boolean) as SongChunk[];
}

function normalizeSource(v: unknown): SongSource | undefined {
  if (!v || typeof v !== "object") return undefined;
  const o = v as Record<string, unknown>;
  const provider = String(o.provider ?? "").trim();
  const videoId = String(o.videoId ?? "").trim();
  if (!videoId) return undefined;
  return { provider: provider || "youtube", videoId };
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

function toSong(doc: SongDoc): Song {
  const { _id, slug, ...rest } = doc;
  return { slug: slug || String(_id), ...rest };
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
    level: String(draft.level ?? "A1"),
    language: typeof draft.language === "string" ? draft.language.trim() || undefined : undefined,
    tags: normalizeTags(draft.tags),
    source: normalizeSource(draft.source),
    imageThumb: typeof draft.imageThumb === "string" ? draft.imageThumb.trim() || undefined : undefined,
    imageLarge: typeof draft.imageLarge === "string" ? draft.imageLarge.trim() || undefined : undefined,
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
    ...(patch.title !== undefined ? { title: String(patch.title ?? "").trim() } : null),
    ...(patch.artist !== undefined ? { artist: String(patch.artist ?? "").trim() } : null),
    ...(patch.level !== undefined ? { level: String(patch.level ?? "") } : null),
    ...(patch.language !== undefined ? { language: String(patch.language ?? "").trim() || undefined } : null),
    ...(patch.tags !== undefined ? { tags: normalizeTags(patch.tags) } : null),
    ...(patch.source !== undefined ? { source: normalizeSource(patch.source) } : null),
    ...(patch.imageThumb !== undefined ? { imageThumb: String(patch.imageThumb ?? "").trim() || undefined } : null),
    ...(patch.imageLarge !== undefined ? { imageLarge: String(patch.imageLarge ?? "").trim() || undefined } : null),
    ...(patch.chunks !== undefined ? { chunks: normalizeChunks(patch.chunks) } : null),
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
