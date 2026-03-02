import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

const OVERRIDES_PATH = join(process.cwd(), "public", "audio-overrides.json");

type Overrides = Record<string, string>;

async function readOverrides(): Promise<Overrides> {
  try {
    const raw = await readFile(OVERRIDES_PATH, "utf-8");
    const data = JSON.parse(raw) as unknown;
    if (data != null && typeof data === "object" && !Array.isArray(data)) {
      return data as Overrides;
    }
  } catch {
    // file missing or invalid
  }
  return {};
}

/**
 * POST: { originalPath: string, newPath: string } — 원본 path → 새 파일 path 매핑 저장
 */
export async function POST(req: Request) {
  if (!devOnly()) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  let body: { originalPath?: string; newPath?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "JSON body required" }, { status: 400 });
  }
  const originalPath = typeof body?.originalPath === "string" ? body.originalPath.trim() : "";
  const newPath = typeof body?.newPath === "string" ? body.newPath.trim() : "";
  if (!originalPath || !newPath || !originalPath.startsWith("/audio/") || !newPath.startsWith("/audio/")) {
    return NextResponse.json(
      { ok: false, error: "originalPath and newPath required, must start with /audio/" },
      { status: 400 }
    );
  }
  try {
    const overrides = await readOverrides();
    overrides[originalPath] = newPath;
    await writeFile(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Write failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE: ?path=/audio/가요.mp3 — 해당 키 제거 (녹음 override 해제)
 */
export async function DELETE(req: Request) {
  if (!devOnly()) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }
  const url = new URL(req.url);
  const pathParam = url.searchParams.get("path");
  if (!pathParam || !pathParam.startsWith("/audio/")) {
    return NextResponse.json(
      { ok: false, error: "path query required, e.g. path=/audio/word.mp3" },
      { status: 400 }
    );
  }
  try {
    const overrides = await readOverrides();
    delete overrides[pathParam];
    await writeFile(OVERRIDES_PATH, JSON.stringify(overrides, null, 2), "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Write failed" },
      { status: 500 }
    );
  }
}
