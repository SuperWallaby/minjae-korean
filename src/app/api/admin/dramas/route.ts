import { NextResponse } from "next/server";

import { createDrama, updateDrama, deleteDrama } from "@/lib/dramaRepo";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim();
    if (!title) return json({ ok: false, error: "Missing title" }, 400);
    const drama = await createDrama({
      title,
      slug: body.slug,
      artist: String(body.artist ?? "").trim(),
      level: body.level,
      language: body.language,
      tags: body.tags,
      source: body.source,
      images: body.images,
      lexicon: body.lexicon,
      chunks: body.chunks,
      createdAt: body.createdAt,
    });
    return json({ ok: true, data: { drama } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    if (!slug) return json({ ok: false, error: "Missing slug" }, 400);
    const drama = await updateDrama(slug, {
      title: body.title,
      artist: body.artist,
      level: body.level,
      language: body.language,
      tags: body.tags,
      source: body.source,
      images: body.images,
      lexicon: body.lexicon,
      chunks: body.chunks,
    });
    if (!drama) return json({ ok: false, error: "Drama not found" }, 404);
    return json({ ok: true, data: { drama } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    if (!slug) return json({ ok: false, error: "Missing slug" }, 400);
    const deleted = await deleteDrama(slug);
    return json({ ok: deleted });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}
