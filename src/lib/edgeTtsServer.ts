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

  const args = ["--voice", voice, "--text", trimmed, "--write-media", outPath];
  if (rate) args.push(`--rate=${rate}`);

  const exitCode = await new Promise<number | null>((resolve) => {
    const proc = spawn("edge-tts", args, { stdio: "pipe" });
    proc.on("error", () => resolve(null));
    proc.on("close", (code) => resolve(code ?? null));
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
