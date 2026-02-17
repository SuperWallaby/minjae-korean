import { spawn } from "child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODES = ["afftdn", "deepfilter"] as const;

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const mode = formData.get("mode");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (typeof mode !== "string" || !MODES.includes(mode as (typeof MODES)[number])) {
    return NextResponse.json(
      { error: "mode must be afftdn or deepfilter" },
      { status: 400 },
    );
  }

  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "enhance/route.ts:POST",
      message: "enhance request",
      data: { mode },
      timestamp: Date.now(),
      hypothesisId: "H4",
    }),
  }).catch(() => {});
  // #endregion

  const dir = await mkdtemp(join(tmpdir(), "audio-enhance-"));
  const ext = file.name.includes(".webm") ? "webm" : file.name.includes(".mp4") ? "mp4" : "webm";
  const inputPath = join(dir, `input.${ext}`);
  const wavPath = join(dir, "input.wav");
  const outputPath = join(dir, "output.wav");

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(inputPath, bytes);

    if (mode === "afftdn") {
      // FFmpeg: basic noise reduction (white/background noise)
      await runFfmpeg(
        inputPath,
        outputPath,
        ["-af", "afftdn=nr=12:nf=-50:tn=1"],
      );
    } else {
      // DeepFilterNet: breath / speech enhancement. Expects 48kHz WAV.
      await runFfmpeg(inputPath, wavPath, [
        "-ar",
        "48000",
        "-ac",
        "1",
      ]);
      const deepResult = await runDeepFilter(wavPath, dir);
      // #region agent log
      fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: "enhance/route.ts:deepfilter-result",
          message: "runDeepFilter result",
          data: { hasPath: !!deepResult.path, hasHint: !!deepResult.hint },
          timestamp: Date.now(),
          hypothesisId: "H1,H5",
        }),
      }).catch(() => {});
      // #endregion
      if (!deepResult.path) {
        await rm(dir, { recursive: true, force: true });
        const message =
          deepResult.hint ??
          "DeepFilterNet not available. Install: pip install deepfilternet (or deep-filter binary)";
        return NextResponse.json({ error: message }, { status: 501 });
      }
      const outBuf = await readFile(deepResult.path);
      await rm(dir, { recursive: true, force: true });
      return new NextResponse(outBuf, {
        headers: {
          "Content-Type": "audio/wav",
          "Content-Disposition": 'attachment; filename="enhanced.wav"',
        },
      });
    }

    const outBuf = await readFile(outputPath);
    await rm(dir, { recursive: true, force: true });

    return new NextResponse(outBuf, {
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": 'attachment; filename="enhanced.wav"',
      },
    });
  } catch (e) {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch {
      // ignore
    }
    console.error("audio enhance error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Enhance failed" },
      { status: 500 },
    );
  }
}

function runFfmpeg(
  inputPath: string,
  outputPath: string,
  extraArgs: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      "-y",
      "-i",
      inputPath,
      ...extraArgs,
      outputPath,
    ];
    const proc = spawn("ffmpeg", args, { stdio: "pipe" });
    let stderr = "";
    proc.stderr?.on("data", (d) => { stderr += d; });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
    });
    proc.on("error", (err) => reject(err));
  });
}

type DeepFilterResult = { path: string | null; hint?: string };

/** Runs deep-filter (Rust), deepFilter (Python CLI), or python3 -m df.enhance. Returns path or null + optional hint for 501. */
async function runDeepFilter(inputWav: string, workDir: string): Promise<DeepFilterResult> {
  const outDir = join(workDir, "df-out");
  await mkdir(outDir, { recursive: true });

  const rustOk = await new Promise<boolean>((resolve) => {
    const proc = spawn("deep-filter", [inputWav, "-o", outDir], { stdio: "pipe" });
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "enhance/route.ts:runDeepFilter-rust",
      message: "deep-filter (Rust) result",
      data: { rustOk },
      timestamp: Date.now(),
      hypothesisId: "H1,H3",
    }),
  }).catch(() => {});
  // #endregion
  if (rustOk) {
    const names = await readdir(outDir);
    const wav = names.find((n) => n.endsWith(".wav"));
    if (wav) return { path: join(outDir, wav) };
    return { path: null };
  }

  const pyOk = await new Promise<boolean>((resolve) => {
    const proc = spawn(
      "deepFilter",
      [inputWav, "--output-dir", outDir],
      { stdio: "pipe" },
    );
    proc.on("error", () => resolve(false));
    proc.on("close", (code) => resolve(code === 0));
  });
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "enhance/route.ts:runDeepFilter-deepFilter",
      message: "deepFilter (Python CLI) result",
      data: { pyOk },
      timestamp: Date.now(),
      hypothesisId: "H1,H3",
    }),
  }).catch(() => {});
  // #endregion
  if (pyOk) {
    const names = await readdir(outDir);
    const wav = names.find((n) => n.endsWith(".wav"));
    return wav ? { path: join(outDir, wav) } : { path: null };
  }

  // Fallback: python3 -m df.enhance (works when pip install deepfilternet, CLI not in PATH)
  let pyModuleStderr = "";
  const pyModuleResult = await new Promise<{ ok: boolean; code: number | null; err?: string }>((resolve) => {
    const proc = spawn(
      "python3",
      ["-m", "df.enhance", inputWav, "--output-dir", outDir],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    proc.stderr?.on("data", (d) => { pyModuleStderr += String(d); });
    proc.on("error", (err) => resolve({ ok: false, code: null, err: err.message }));
    proc.on("close", (code) => resolve({ ok: code === 0, code: code ?? null }));
  });
  // #region agent log
  fetch("http://127.0.0.1:7242/ingest/710510e9-a481-4605-9b78-a95129892604", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      location: "enhance/route.ts:runDeepFilter-python3-m",
      message: "python3 -m df.enhance result",
      data: {
        pyModuleOk: pyModuleResult.ok,
        code: pyModuleResult.code,
        err: pyModuleResult.err,
        stderrTail: pyModuleStderr.slice(-800),
        outDirContents: await readdir(outDir).catch(() => []),
      },
      timestamp: Date.now(),
      hypothesisId: "H6,H7,H8,H9",
    }),
  }).catch(() => {});
  // #endregion
  if (!pyModuleResult.ok) {
    const hint =
      pyModuleStderr.includes("torchaudio.backend") ||
      (pyModuleStderr.includes("ModuleNotFoundError") && pyModuleStderr.includes("torchaudio"))
        ? "DeepFilterNet needs an older torchaudio. Try: pip install 'torchaudio<2.2' (or use Python 3.11)."
        : pyModuleStderr.trim().slice(-400) || undefined;
    return { path: null, hint };
  }
  const names = await readdir(outDir);
  const wav = names.find((n) => n.endsWith(".wav"));
  return wav ? { path: join(outDir, wav) } : { path: null };
}
