import { NextResponse } from "next/server";

import { renameSong } from "@/lib/songsRepo";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

export async function POST(req: Request) {
  if (!devOnly()) {
    return json({ ok: false, error: "Not found" }, 404);
  }
  try {
    const body = await req.json().catch(() => ({}));
    const oldSlug = String(body.oldSlug ?? body.old_slug ?? "").trim();
    const newSlug = String(body.newSlug ?? body.new_slug ?? "").trim();
    if (!oldSlug || !newSlug) {
      return json({ ok: false, error: "Missing oldSlug or newSlug" }, 400);
    }
    const song = await renameSong(oldSlug, newSlug);
    if (!song) {
      return json({ ok: false, error: "Song not found or new slug already exists" }, 404);
    }
    return json({ ok: true, data: { song } });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, 500);
  }
}
