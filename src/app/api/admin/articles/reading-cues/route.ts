import { spawn } from "child_process";
import { access, mkdtemp, readFile, rm, stat, writeFile } from "fs/promises";
import { homedir, tmpdir } from "os";
import { extname, join } from "path";
import { NextResponse } from "next/server";

import {
  generateReadingCues,
  parseVttSegments,
  type ParagraphBlock,
} from "@/lib/articleReading";

export const runtime = "nodejs";

function devOnly() {
  return process.env.NODE_ENV !== "production";
}

function normalizeParagraphs(value: unknown): ParagraphBlock[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      return {
        subtitle: typeof row.subtitle === "string" ? row.subtitle : "",
        content: typeof row.content === "string" ? row.content : "",
        image:
          typeof row.image === "string" && row.image.trim()
            ? row.image.trim()
            : undefined,
        youtube:
          typeof row.youtube === "string" && row.youtube.trim()
            ? row.youtube.trim()
            : undefined,
      } satisfies ParagraphBlock;
    })
    .filter(Boolean) as ParagraphBlock[];
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function resolveWhisperModelPath(): Promise<string | null> {
  const configured = process.env.WHISPER_MODEL_PATH?.trim();
  const candidates = [
    configured || null,
    join(homedir(), ".cache", "kaja-whisper", "ggml-base.bin"),
    join(process.cwd(), ".cache", "whisper", "ggml-base.bin"),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    if (!(await fileExists(candidate))) continue;
    const info = await stat(candidate).catch(() => null);
    if (info && info.size > 10_000_000) return candidate;
  }

  return null;
}

function inferAudioExtension(audioUrl: string, contentType: string): string {
  const fromUrl = extname(new URL(audioUrl).pathname).toLowerCase();
  if (fromUrl === ".mp3" || fromUrl === ".wav" || fromUrl === ".flac" || fromUrl === ".ogg") {
    return fromUrl;
  }
  if (contentType.includes("wav")) return ".wav";
  if (contentType.includes("flac")) return ".flac";
  if (contentType.includes("ogg")) return ".ogg";
  return ".mp3";
}

async function runWhisper(inputPath: string, outBase: string, modelPath: string) {
  return await new Promise<{ code: number | null; stderr: string }>((resolve) => {
    let stderr = "";
    const proc = spawn(
      "whisper-cli",
      ["-m", modelPath, "-l", "auto", "-ovtt", "-of", outBase, "-np", inputPath],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    proc.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    proc.on("error", (err) => {
      stderr += err.message;
      resolve({ code: null, stderr });
    });
    proc.on("close", (code) => resolve({ code: code ?? null, stderr }));
  });
}

export async function POST(req: Request) {
  try {
    if (!devOnly()) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => null);
    const audioUrl = typeof body?.audioUrl === "string" ? body.audioUrl.trim() : "";
    const paragraphs = normalizeParagraphs(body?.paragraphs);

    if (!audioUrl) {
      return NextResponse.json(
        { ok: false, error: "audioUrl is required" },
        { status: 400 },
      );
    }
    if (!paragraphs.length) {
      return NextResponse.json(
        { ok: false, error: "paragraphs are required" },
        { status: 400 },
      );
    }

    const modelPath = await resolveWhisperModelPath();
    if (!modelPath) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Whisper model not found. Set WHISPER_MODEL_PATH or place ggml-base.bin in ~/.cache/kaja-whisper/.",
        },
        { status: 500 },
      );
    }

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) {
      return NextResponse.json(
        { ok: false, error: `Failed to fetch audio (${audioRes.status})` },
        { status: 502 },
      );
    }

    const workDir = await mkdtemp(join(tmpdir(), "article-whisper-"));
    try {
      const ext = inferAudioExtension(audioUrl, audioRes.headers.get("content-type") ?? "");
      const inputPath = join(workDir, `input${ext}`);
      const outBase = join(workDir, "transcript");
      const vttPath = `${outBase}.vtt`;

      const audioBytes = Buffer.from(await audioRes.arrayBuffer());
      await writeFile(inputPath, audioBytes);

      const { code, stderr } = await runWhisper(inputPath, outBase, modelPath);
      if (code !== 0) {
        return NextResponse.json(
          {
            ok: false,
            error: stderr.trim() || "whisper-cli failed",
          },
          { status: 502 },
        );
      }

      const vttBytes = await readFile(vttPath).catch(() => null);
      if (!vttBytes) {
        return NextResponse.json(
          { ok: false, error: "Whisper output missing" },
          { status: 502 },
        );
      }

      const segments = parseVttSegments(vttBytes.toString("utf8"));
      const readingCues = generateReadingCues(paragraphs, segments);
      if (!readingCues.length) {
        return NextResponse.json(
          { ok: false, error: "No timing cues could be generated" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        ok: true,
        data: {
          readingCues,
          segmentCount: segments.length,
          modelPath,
        },
      });
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
