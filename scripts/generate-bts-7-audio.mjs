#!/usr/bin/env node
/**
 * Generate TTS audio for BTS 7 phrases. Requires: pip install edge-tts
 * Run from project root: node scripts/generate-bts-7-audio.mjs
 * Output: public/audio/bts-7/*.mp3
 */

import { spawn } from "child_process";
import { mkdir, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "public", "audio", "bts-7");
const VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-InJoonNeural";

const PHRASES = [
  { key: "rm", text: "꽤나 멋진 30대" },
  { key: "jin", text: "방탄중년노년단" },
  { key: "suga", text: "무엇이든 괜찮아." },
  { key: "jhope", text: "가자 달려라 방탄." },
  { key: "jimin", text: "걱정하지 말아요." },
  { key: "v", text: "늙어도 우린 청춘" },
  { key: "jungkook", text: "모먼 이즈 옛투컴" },
];

function runEdgeTts(text, outPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn("edge-tts", ["--voice", VOICE, "--text", text, "--write-media", outPath], {
      stdio: "pipe",
      cwd: ROOT,
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const dir = join(tmpdir(), `bts-7-${Date.now()}`);
  await mkdir(dir, { recursive: true });

  console.log("Generating 7 TTS files with edge-tts...");
  for (const { key, text } of PHRASES) {
    const tmpPath = join(dir, `${key}.mp3`);
    await runEdgeTts(text, tmpPath);
    const buf = await readFile(tmpPath);
    const outPath = join(OUT_DIR, `${key}.mp3`);
    await writeFile(outPath, buf);
    console.log(`  ${key}.mp3: ${text}`);
  }
  await rm(dir, { recursive: true, force: true }).catch(() => {});
  console.log("Done. Files in public/audio/bts-7/");
  console.log("Blog post can use: audio: \"/audio/bts-7/rm.mp3\" etc.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
