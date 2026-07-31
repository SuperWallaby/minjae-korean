import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DEFAULT_VOICE = "ko-KR-InJoonNeural";

export async function synthesizeEdgeTtsMp3(
  text: string,
  opts?: { voice?: string; rate?: string },
): Promise<Buffer> {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error("TTS text is required");
  }

  const voice =
    opts?.voice?.trim() ||
    process.env.EDGE_TTS_VOICE?.trim() ||
    DEFAULT_VOICE;
  const rate = opts?.rate?.trim() || process.env.EDGE_TTS_RATE?.trim();
  const dir = await mkdtemp(join(tmpdir(), "edge-tts-"));
  const outPath = join(dir, "out.mp3");

  const args = ["--voice", voice, `--text=${trimmed}`, "--write-media", outPath];
  if (rate) args.push(`--rate=${rate}`);

  const exitCode = await new Promise<number | null>((resolve) => {
    const candidates = [
      process.env.EDGE_TTS_BIN?.trim(),
      process.env.HOME
        ? `${process.env.HOME}/Library/Python/3.9/bin/edge-tts`
        : undefined,
      process.env.HOME ? `${process.env.HOME}/.local/bin/edge-tts` : undefined,
      "edge-tts",
    ].filter((v): v is string => Boolean(v));

    const tryNext = (index: number) => {
      const bin = candidates[index];
      if (!bin) {
        resolve(null);
        return;
      }
      const proc = spawn(bin, args, { stdio: "pipe", env: process.env });
      proc.on("error", () => tryNext(index + 1));
      proc.on("close", (code) => {
        if (code === 0) resolve(0);
        else if (index + 1 < candidates.length) tryNext(index + 1);
        else resolve(code ?? null);
      });
    };
    tryNext(0);
  });

  try {
    if (exitCode !== 0) {
      throw new Error(
        "edge-tts failed. Install with: pip install edge-tts",
      );
    }
    return await readFile(outPath);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
