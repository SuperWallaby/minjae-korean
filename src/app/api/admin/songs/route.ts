import { NextResponse } from "next/server";

import { createSong, updateSong, deleteSong } from "@/lib/songsRepo";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // #region agent log
    const rawChunks = body.chunks;
    fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "3494ff" },
      body: JSON.stringify({
        sessionId: "3494ff",
        location: "api/admin/songs/route.ts:POST",
        message: "POST body chunks shape",
        data: {
          chunksLength: Array.isArray(rawChunks) ? rawChunks.length : 0,
          firstChunkKeys: Array.isArray(rawChunks) && rawChunks[0] ? Object.keys(rawChunks[0]) : [],
          hasLines: Array.isArray(rawChunks) && rawChunks[0] ? "lines" in rawChunks[0] : false,
          hasLinesMasked: Array.isArray(rawChunks) && rawChunks[0] ? "linesMasked" in rawChunks[0] : false,
          hasText: Array.isArray(rawChunks) && rawChunks[0] ? "text" in rawChunks[0] : false,
        },
        timestamp: Date.now(),
        hypothesisId: "H1",
      }),
    }).catch(() => {});
    // #endregion
    const title = String(body.title ?? "").trim();
    if (!title) {
      return json({ ok: false, error: "Missing title" }, 400);
    }
    const song = await createSong({
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
    return json({ ok: true, data: { song } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    if (!slug) {
      return json({ ok: false, error: "Missing slug" }, 400);
    }
    const song = await updateSong(slug, {
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
    if (!song) {
      return json({ ok: false, error: "Song not found" }, 404);
    }
    return json({ ok: true, data: { song } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug ?? "").trim();
    if (!slug) {
      return json({ ok: false, error: "Missing slug" }, 400);
    }
    const deleted = await deleteSong(slug);
    return json({ ok: deleted });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}
