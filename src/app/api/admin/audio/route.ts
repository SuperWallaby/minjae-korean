import { spawn } from "child_process";
import { mkdtemp, readFile, rm, unlink, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join, relative } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

/** public/audio 디렉터리 절대 경로 (프로젝트 루트 기준) */
function getAudioDir() {
  return join(process.cwd(), "public", "audio");
}

/** path가 public/audio 아래인지 검사 (path traversal 방지) */
function isUnderAudioDir(resolved: string) {
  const rel = relative(getAudioDir(), resolved);
  return rel !== "" && !rel.startsWith("..") && !rel.includes("..");
}

/**
 * DELETE: 녹음 파일 삭제 (개발 모드 전용).
 * Query: path = /audio/파일명.mp3 (예: /audio/ㄷ-group.mp3)
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
  const basename = pathParam.replace(/^\/audio\//, "").replace(/\/+/g, "");
  const decoded = decodeURIComponent(basename);
  const audioDir = getAudioDir();
  const resolved = join(audioDir, decoded);
  if (!isUnderAudioDir(resolved)) {
    return NextResponse.json({ ok: false, error: "Invalid path" }, { status: 400 });
  }
  try {
    await unlink(resolved);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const err = e as NodeJS.ErrnoException;
    if (err?.code === "ENOENT") return NextResponse.json({ ok: true });
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Delete failed" },
      { status: 500 }
    );
  }
}

/**
 * POST: (1) multipart로 녹음 파일 업로드 → public/audio/{filename}.mp3 저장
 *       (2) JSON { text, filename } → TTS 생성 후 저장 (개발 모드 전용)
 */
export async function POST(req: Request) {
  if (!devOnly()) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("file");
    const filenameEntry = formData.get("filename");
    const filename = typeof filenameEntry === "string" ? filenameEntry.trim() : "";
    if (!file || !(file instanceof Blob) || !filename) {
      return NextResponse.json(
        { ok: false, error: "file and filename required" },
        { status: 400 }
      );
    }
    const name = filename.includes(".mp3") ? filename : `${filename.replace(/\.\w+$/, "")}.mp3`;
    if (!name.endsWith(".mp3") || name.includes("..") || name.includes("/")) {
      return NextResponse.json(
        { ok: false, error: "filename must be a single .mp3 name" },
        { status: 400 }
      );
    }
    const audioDir = getAudioDir();
    const outPath = join(audioDir, name);
    if (!isUnderAudioDir(outPath)) {
      return NextResponse.json({ ok: false, error: "Invalid filename" }, { status: 400 });
    }

    const dir = await mkdtemp(join(tmpdir(), "audio-upload-"));
    const rawExt = file.type.includes("webm") ? "webm" : file.type.includes("mp4") ? "m4a" : "webm";
    const rawPath = join(dir, `raw.${rawExt}`);
    const buf = Buffer.from(await file.arrayBuffer());
    await writeFile(rawPath, buf);

    const mp3Path = join(dir, "out.mp3");
    const exitCode = await new Promise<number | null>((resolve) => {
      const proc = spawn(
        "ffmpeg",
        ["-y", "-i", rawPath, "-acodec", "libmp3lame", "-q:a", "5", mp3Path],
        { stdio: "pipe" }
      );
      proc.on("error", () => resolve(null));
      proc.on("close", (code) => resolve(code ?? null));
    });
    if (exitCode !== 0) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
      return NextResponse.json(
        { ok: false, error: "ffmpeg convert failed" },
        { status: 502 }
      );
    }
    const outBuf = await readFile(mp3Path);
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    await writeFile(outPath, outBuf);
    return NextResponse.json({ ok: true });
  }

  let body: { text?: string; filename?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "JSON body or multipart required" },
      { status: 400 }
    );
  }
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const filename = typeof body?.filename === "string" ? body.filename.trim() : "";
  if (!text || !filename) {
    return NextResponse.json(
      { ok: false, error: "text and filename are required" },
      { status: 400 }
    );
  }
  if (!filename.endsWith(".mp3") || filename.includes("..") || filename.includes("/")) {
    return NextResponse.json(
      { ok: false, error: "filename must be a single .mp3 name" },
      { status: 400 }
    );
  }
  const audioDir = getAudioDir();
  const outPath = join(audioDir, filename);
  if (!isUnderAudioDir(outPath)) {
    return NextResponse.json({ ok: false, error: "Invalid filename" }, { status: 400 });
  }

  const voice = process.env.EDGE_TTS_VOICE ?? "ko-KR-InJoonNeural";
  const rate = process.env.EDGE_TTS_RATE ?? "";
  const dir = await mkdtemp(join(tmpdir(), "edge-tts-"));
  const tmpPath = join(dir, "out.mp3");

  const args = ["--voice", voice, "--text", text, "--write-media", tmpPath];
  if (rate) args.push("--rate=" + rate);

  const exitCode = await new Promise<number | null>((resolve) => {
    const proc = spawn("edge-tts", args, { stdio: "pipe" });
    proc.on("error", () => resolve(null));
    proc.on("close", (code) => resolve(code ?? null));
  });

  if (exitCode !== 0) {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
    return NextResponse.json(
      { ok: false, error: "edge-tts failed. pip install edge-tts" },
      { status: 502 }
    );
  }

  const outBuf = await readFile(tmpPath).catch(() => null);
  await rm(dir, { recursive: true, force: true }).catch(() => {});

  if (!outBuf) {
    return NextResponse.json({ ok: false, error: "TTS output missing" }, { status: 502 });
  }

  await writeFile(outPath, outBuf);

  return NextResponse.json({ ok: true });
}
