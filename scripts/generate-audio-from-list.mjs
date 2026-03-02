#!/usr/bin/env node
/**
 * 목록 파일에서 한 줄씩 읽어 TTS로 public/audio/{내용}.mp3 생성.
 * Requires: pip install edge-tts
 *
 * 사용법:
 *   node scripts/generate-audio-from-list.mjs scripts/audio-lists/hangeul-batchim-basics.txt
 *   EDGE_TTS_RATE=-25% node scripts/generate-audio-from-list.mjs scripts/audio-lists/내목록.txt
 *
 * 목록 파일: 한 줄에 하나씩. 빈 줄·# 시작 줄 무시.
 * 생성 위치: public/audio/ (파일명 = 그 줄 내용 그대로, 예: 각.mp3, 먹다.mp3)
 */

import { spawn } from "child_process";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "audio");
const VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-InJoonNeural";
const RATE = process.env.EDGE_TTS_RATE || "";

/** 파일명에 /, \ 있으면 경로로 잘려서 ENOENT 나옴 → 치환 */
function safeFileName(text) {
  return String(text).replace(/\//g, "-").replace(/\\/g, "-");
}

function runEdgeTts(text, outPath) {
  const args = ["--voice", VOICE, "--text", text, "--write-media", outPath];
  if (RATE) args.push("--rate=" + RATE);
  return new Promise((resolve, reject) => {
    const proc = spawn("edge-tts", args, { stdio: "pipe", cwd: ROOT });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  const listPath = process.argv[2];
  if (!listPath) {
    console.error("Usage: node scripts/generate-audio-from-list.mjs <path-to-list.txt>");
    console.error("Example: node scripts/generate-audio-from-list.mjs scripts/audio-lists/hangeul-batchim-basics.txt");
    process.exit(1);
  }

  const raw = await readFile(listPath, "utf-8").catch((err) => {
    console.error("Failed to read list file:", err.message);
    process.exit(1);
  });

  const lines = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && !s.startsWith("#"));

  if (lines.length === 0) {
    console.error("No lines to generate. Add one phrase per line (skip empty and # comments).");
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  const tmpDir = join(tmpdir(), `audio-list-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  console.log(`Generating ${lines.length} files from ${listPath}${RATE ? ` (rate=${RATE})` : ""}...`);
  for (let i = 0; i < lines.length; i++) {
    const text = lines[i];
    const tmpPath = join(tmpDir, `out-${i}.mp3`);
    await runEdgeTts(text, tmpPath);
    const buf = await readFile(tmpPath);
    const outPath = join(OUT_DIR, `${safeFileName(text)}.mp3`);
    await writeFile(outPath, buf);
    if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${lines.length}`);
  }
  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  console.log(`Done. ${lines.length} files in public/audio/`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
