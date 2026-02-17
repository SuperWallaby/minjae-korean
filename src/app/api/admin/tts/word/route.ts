import { spawn } from "child_process";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const DEFAULT_VOICE = "ko-KR-InJoonNeural";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function appBase(req: Request): string {
  try {
    const u = new URL(req.url);
    return u.origin;
  } catch {
    const v = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_APP_URL;
    if (v) return v.startsWith("http") ? v : `https://${v}`;
    return "http://localhost:3000";
  }
}

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return NextResponse.json({ ok: false, error: "Not found" }, {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === "string" ? body.text.trim() : "";
    if (!text) {
      return NextResponse.json(
        { ok: false, error: "text is required" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const voice = process.env.EDGE_TTS_VOICE ?? DEFAULT_VOICE;
    const dir = await mkdtemp(join(tmpdir(), "edge-tts-"));
    const outPath = join(dir, "word.mp3");

    const exitCode = await new Promise<number | null>((resolve) => {
      const proc = spawn(
        "edge-tts",
        ["--voice", voice, "--text", text, "--write-media", outPath],
        { stdio: "pipe" },
      );
      proc.on("error", () => resolve(null));
      proc.on("close", (code) => resolve(code ?? null));
    });

    if (exitCode !== 0) {
      await rm(dir, { recursive: true, force: true }).catch(() => {});
      return NextResponse.json(
        { ok: false, error: "edge-tts failed. Install: pip install edge-tts" },
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const audioBytes = await readFile(outPath);
    await rm(dir, { recursive: true, force: true }).catch(() => {});

    const fileName = `word-${Date.now()}.mp3`;
    const presignRes = await fetch(`${appBase(req)}/api/admin/r2/presign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName, contentType: "audio/mpeg" }),
    });
    const presignJson = await presignRes.json().catch(() => null);
    if (!presignRes.ok || !presignJson?.ok || !presignJson?.data?.uploadUrl || !presignJson?.data?.publicUrl) {
      return NextResponse.json(
        { ok: false, error: presignJson?.error ?? "Failed to get upload URL" },
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const putRes = await fetch(presignJson.data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "audio/mpeg" },
      body: audioBytes,
    });
    if (!putRes.ok) {
      return NextResponse.json(
        { ok: false, error: "R2 upload failed" },
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return NextResponse.json(
      { ok: true, url: presignJson.data.publicUrl },
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
