import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongo";

type DocLike = { _id: ObjectId; scope: string; slug: string; userId: string; createdAt: string };
type DocBookmark = { _id: ObjectId; scope: string; slug: string; userId: string; createdAt: string };
type DocClap = { _id: ObjectId; scope: string; slug: string; createdAt: string };

let colLikes: Collection<DocLike> | null = null;
let colBookmarks: Collection<DocBookmark> | null = null;
let colClaps: Collection<DocClap> | null = null;

async function getLikesCol() {
  if (colLikes) return colLikes;
  const db = await getMongoDb();
  colLikes = db.collection<DocLike>("article_likes");
  try {
    await colLikes.createIndex({ scope: 1, slug: 1, userId: 1 }, { unique: true });
    await colLikes.createIndex({ scope: 1, slug: 1 });
  } catch {
    // ignore
  }
  return colLikes;
}

async function getBookmarksCol() {
  if (colBookmarks) return colBookmarks;
  const db = await getMongoDb();
  colBookmarks = db.collection<DocBookmark>("article_bookmarks");
  try {
    await colBookmarks.createIndex({ scope: 1, slug: 1, userId: 1 }, { unique: true });
  } catch {
    // ignore
  }
  return colBookmarks;
}

async function getClapsCol() {
  if (colClaps) return colClaps;
  const db = await getMongoDb();
  colClaps = db.collection<DocClap>("article_claps");
  try {
    await colClaps.createIndex({ scope: 1, slug: 1 });
  } catch {
    // ignore
  }
  return colClaps;
}

export async function getLikeCountAndLiked(
  scope: string,
  slug: string,
  userId: string | null,
): Promise<{ count: number; liked: boolean }> {
  const c = await getLikesCol();
  const count = await c.countDocuments({ scope, slug });
  let liked = false;
  if (userId) {
    liked = (await c.findOne({ scope, slug, userId })) != null;
  }
  return { count, liked };
}

export async function toggleLike(
  scope: string,
  slug: string,
  userId: string,
): Promise<{ liked: boolean; count: number }> {
  const c = await getLikesCol();
  const existing = await c.findOne({ scope, slug, userId });
  if (existing) {
    await c.deleteOne({ _id: existing._id });
    const count = await c.countDocuments({ scope, slug });
    return { liked: false, count };
  }
  await c.insertOne({
    _id: new ObjectId(),
    scope,
    slug,
    userId,
    createdAt: new Date().toISOString(),
  } as DocLike);
  const count = await c.countDocuments({ scope, slug });
  return { liked: true, count };
}

export async function getBookmarked(
  scope: string,
  slug: string,
  userId: string,
): Promise<boolean> {
  const c = await getBookmarksCol();
  const doc = await c.findOne({ scope, slug, userId });
  return doc != null;
}

export async function listBookmarks(userId: string): Promise<Array<{ scope: string; slug: string }>> {
  const c = await getBookmarksCol();
  const docs = await c.find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs.map((d) => ({ scope: d.scope, slug: d.slug }));
}

export async function toggleBookmark(
  scope: string,
  slug: string,
  userId: string,
): Promise<boolean> {
  const c = await getBookmarksCol();
  const existing = await c.findOne({ scope, slug, userId });
  if (existing) {
    await c.deleteOne({ _id: existing._id });
    return false;
  }
  await c.insertOne({
    _id: new ObjectId(),
    scope,
    slug,
    userId,
    createdAt: new Date().toISOString(),
  } as DocBookmark);
  return true;
}

export async function addClap(scope: string, slug: string): Promise<void> {
  const c = await getClapsCol();
  await c.insertOne({
    _id: new ObjectId(),
    scope,
    slug,
    createdAt: new Date().toISOString(),
  } as DocClap);
}
