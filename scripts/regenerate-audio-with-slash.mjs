#!/usr/bin/env node
/**
 * "/" 가 들어간 word 전부 찾아서, "/" 로 분리한 뒤 각 부분을 따로 TTS 생성 → 이어붙여 한 파일로 저장.
 * 예: "서 / 소" → "서" TTS + "소" TTS → public/audio/서 - 소.mp3
 *
 * Requires: pip install edge-tts, ffmpeg
 *
 * 사용법:
 *   node scripts/regenerate-audio-with-slash.mjs          # "/" 포함 단어만 재생성 (기존 파일 덮어씀)
 *   EDGE_TTS_RATE=-25% node scripts/regenerate-audio-with-slash.mjs
 */

import { readFile, mkdir, rm, writeFile } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "src", "data", "fundamentalChapterContent", "content");
const INDEX_PATH = join(ROOT, "src", "data", "fundamentalChapterContent", "index.ts");
const OUT_DIR = join(ROOT, "public", "audio");
const VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-InJoonNeural";
const RATE = process.env.EDGE_TTS_RATE || "";

function safeFileName(text) {
  return String(text).replace(/\//g, "-").replace(/\\/g, "-");
}

function extractSlugsFromIndex(content) {
  const slugs = [];
  const match = content.match(/const SLUG_LIST = \[([\s\S]*?)\]\s*as const/);
  if (!match) return slugs;
  const inner = match[1];
  for (const m of inner.matchAll(/"([^"]+)"/g)) slugs.push(m[1]);
  return slugs;
}

function extractWordsFromContent(content) {
  const words = new Set();
  for (const m of content.matchAll(/word:\s*"((?:[^"\\]|\\.)*)"/g)) {
    const w = m[1].replace(/\\"/g, '"').trim();
    if (w) words.add(w);
  }
  return [...words];
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

/** 끝쪽 침묵 제거 (TTS가 붙이는 긴 쉼 제거) */
function trimTrailingSilence(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-af",
        "silenceremove=stop_periods=1:stop_duration=0.3:stop_threshold=-40dB",
        "-acodec",
        "libmp3lame",
        "-q:a",
        "5",
        outputPath,
      ],
      { stdio: "pipe", cwd: ROOT }
    );
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg trim exit ${code}`))));
  });
}

/** 1초 침묵 MP3 생성 (구간 사이 간격용) */
function createSilenceSec(outputPath, sec = 1) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      "ffmpeg",
      [
        "-y",
        "-f",
        "lavfi",
        "-i",
        "anullsrc=r=44100:cl=mono",
        "-t",
        String(sec),
        "-acodec",
        "libmp3lame",
        "-q:a",
        "9",
        outputPath,
      ],
      { stdio: "pipe", cwd: ROOT }
    );
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg silence exit ${code}`))));
  });
}

/** MP3 파일들을 순서대로 이어붙여서 outPath에 저장 (ffmpeg concat) */
function concatMp3(paths, outPath, tmpDir) {
  const listPath = join(tmpDir, "concat-list.txt");
  const listContent = paths.map((p) => `file '${p.replace(/'/g, "'\\''")}'`).join("\n");
  return writeFile(listPath, listContent, "utf-8").then(() => {
    return new Promise((resolve, reject) => {
      const proc = spawn(
        "ffmpeg",
        ["-y", "-f", "concat", "-safe", "0", "-i", listPath, "-c", "copy", outPath],
        { stdio: "pipe", cwd: ROOT }
      );
      proc.on("error", reject);
      proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    });
  });
}

async function main() {
  const indexContent = await readFile(INDEX_PATH, "utf-8");
  const slugs = extractSlugsFromIndex(indexContent);
  if (slugs.length === 0) {
    console.error("Could not parse SLUG_LIST from index.ts");
    process.exit(1);
  }

  const allWords = new Set();
  for (const slug of slugs) {
    const path = join(CONTENT_DIR, `${slug}.ts`);
    try {
      const content = await readFile(path, "utf-8");
      const words = extractWordsFromContent(content);
      words.forEach((w) => allWords.add(w));
    } catch (e) {
      console.warn(`Skip ${slug}: ${e.message}`);
    }
  }

  const withSlash = [...allWords].filter((w) => w.includes("/")).sort();
  if (withSlash.length === 0) {
    console.log("No words containing '/' found. Nothing to do.");
    process.exit(0);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const tmpDir = join(process.env.TMPDIR || "/tmp", `audio-slash-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  console.log(
    `Found ${withSlash.length} words with "/". Regenerating (split → TTS each → concat)${RATE ? ` rate=${RATE}` : ""}...`
  );

  const failed = [];
  for (let i = 0; i < withSlash.length; i++) {
    const word = withSlash[i];
    const parts = word
      .split("/")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length < 2) {
      console.warn(`  Skip "${word}": no parts after split`);
      continue;
    }

    const outName = `${safeFileName(word)}.mp3`;
    const outPath = join(OUT_DIR, outName);

    try {
      const partPaths = [];
      for (let j = 0; j < parts.length; j++) {
        const partPath = join(tmpDir, `part-${i}-${j}.mp3`);
        await runEdgeTts(parts[j], partPath);
        partPaths.push(partPath);
      }
      const silencePath = join(tmpDir, `silence-1s-${i}.mp3`);
      await createSilenceSec(silencePath, 1);
      const trimmedPaths = [];
      for (let j = 0; j < partPaths.length; j++) {
        const tPath = join(tmpDir, `part-${i}-${j}-t.mp3`);
        await trimTrailingSilence(partPaths[j], tPath);
        trimmedPaths.push(tPath);
        if (j < partPaths.length - 1) trimmedPaths.push(silencePath);
      }
      await concatMp3(trimmedPaths, outPath, tmpDir);
      console.log(`  [${i + 1}/${withSlash.length}] ${word} → ${outName} (${parts.length} parts)`);
    } catch (e) {
      failed.push({ word, err: e.message });
      console.warn(`  [${i + 1}/${withSlash.length}] FAIL ${word}: ${e.message}`);
    }
  }

  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  console.log(`Done. ${withSlash.length - failed.length} files written to public/audio/`);
  if (failed.length > 0) {
    console.warn("Failed:", failed.length);
    failed.forEach(({ word }) => console.warn(`  - ${word}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
