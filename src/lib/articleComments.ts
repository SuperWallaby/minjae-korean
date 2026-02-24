import type { Collection } from "mongodb";
import { ObjectId } from "mongodb";
import { getMongoDb } from "@/lib/mongo";

export type CommentScope = "blog" | "news" | "grammar" | "expressions";

export type ArticleComment = {
  id: string;
  scope: string;
  slug: string;
  authorName: string;
  authorId?: string;
  text: string;
  createdAt: string; // ISO
};

type Doc = {
  _id: ObjectId;
  scope: string;
  slug: string;
  authorName: string;
  authorId?: string;
  text: string;
  createdAt: string;
};

let col: Collection<Doc> | null = null;

async function getCol(): Promise<Collection<Doc>> {
  if (col) return col;
  const db = await getMongoDb();
  col = db.collection<Doc>("article_comments");
  try {
    await col.createIndex({ scope: 1, slug: 1, createdAt: 1 });
  } catch {
    // ignore
  }
  return col;
}

function toComment(doc: Doc): ArticleComment {
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

export async function listArticleComments(
  scope: string,
  slug: string,
): Promise<ArticleComment[]> {
  const c = await getCol();
  const list = await c
    .find({ scope, slug })
    .sort({ createdAt: 1 })
    .limit(200)
    .toArray();
  return list.map(toComment);
}

export async function addArticleComment(
  scope: string,
  slug: string,
  author: { name: string; id?: string },
  text: string,
): Promise<ArticleComment | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const c = await getCol();
  const doc: Doc = {
    _id: new ObjectId(),
    scope,
    slug,
    authorName: author.name.trim() || "Member",
    authorId: author.id?.trim() || undefined,
    text: trimmed,
    createdAt: new Date().toISOString(),
  };
  await c.insertOne(doc as Doc & { _id: ObjectId });
  return toComment(doc);
}

export async function getCommentById(commentId: string): Promise<ArticleComment | null> {
  if (!ObjectId.isValid(commentId)) return null;
  const c = await getCol();
  const doc = await c.findOne({ _id: new ObjectId(commentId) });
  return doc ? toComment(doc) : null;
}

export async function updateArticleComment(
  commentId: string,
  userId: string,
  text: string,
): Promise<ArticleComment | null> {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const c = await getCol();
  const doc = await c.findOne({ _id: new ObjectId(commentId) });
  if (!doc || doc.authorId !== userId) return null;
  await c.updateOne(
    { _id: doc._id },
    { $set: { text: trimmed } },
  );
  return toComment({ ...doc, text: trimmed });
}

export async function deleteArticleComment(
  commentId: string,
  userId: string,
): Promise<boolean> {
  const c = await getCol();
  const doc = await c.findOne({ _id: new ObjectId(commentId) });
  if (!doc || doc.authorId !== userId) return false;
  await c.deleteOne({ _id: doc._id });
  return true;
}
