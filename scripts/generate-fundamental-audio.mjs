#!/usr/bin/env node
/**
 * Fundamental 챕터 content 파일들에서 word 값을 자동 추출해서 TTS 생성.
 * index.ts의 SLUG_LIST에 있는 모든 챕터의 .ts를 읽고, soundword_table/soundword 의 word 필드 수집.
 * Requires: pip install edge-tts
 *
 * 사용법:
 *   node scripts/generate-fundamental-audio.mjs
 *   EDGE_TTS_RATE=-25% node scripts/generate-fundamental-audio.mjs
 *
 * 이미 있는 파일은 건너뛰고, 없는 것만 생성. 한 단어 실패해도 나머지는 계속 진행.
 * "/" 가 포함된 단어는 항상 재생성(기존 파일 있어도) + "/" 로 나눠 각각 TTS 후 이어붙임. (ffmpeg 필요)
 * 생성 위치: public/audio/{word}.mp3 (/, \ 는 - 로 치환)
 */

import { readFile, mkdir, rm, writeFile, access, appendFile } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const DEBUG_LOG =
  process.env.DEBUG_LOG ||
  join(fileURLToPath(new URL(".", import.meta.url)), "..", ".cursor", "debug-3494ff.log");

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const CONTENT_DIR = join(ROOT, "src", "data", "fundamentalChapterContent", "content");
const INDEX_PATH = join(ROOT, "src", "data", "fundamentalChapterContent", "index.ts");
const OUT_DIR = join(ROOT, "public", "audio");
const VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-InJoonNeural";
const RATE = process.env.EDGE_TTS_RATE || "";

/** 파일명에 쓰이면 안 되는 문자(/, \) 치환. 끝 마침표 제거(가요. → 가요) 해서 경로 통일 */
function safeFileName(text) {
  const s = String(text).replace(/\//g, "-").replace(/\\/g, "-");
  return s.replace(/\.+$/, "");
}

/** index.ts에서 SLUG_LIST 배열 안의 slug 문자열들 추출 */
function extractSlugsFromIndex(content) {
  const slugs = [];
  const match = content.match(/const SLUG_LIST = \[([\s\S]*?)\]\s*as const/);
  if (!match) return slugs;
  const inner = match[1];
  for (const m of inner.matchAll(/"([^"]+)"/g)) slugs.push(m[1]);
  return slugs;
}

/** .ts 파일 내용에서 word: "..." 값 전부 추출 (soundword_table rows, soundword 블록) */
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
        `anullsrc=r=44100:cl=mono`,
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

/** MP3 여러 개를 ffmpeg concat으로 이어붙여 outPath에 저장 */
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

  const list = [...allWords].sort();
  if (list.length === 0) {
    console.log("No word values found in content files. Nothing to generate.");
    process.exit(0);
  }

  await mkdir(OUT_DIR, { recursive: true });

  const toGenerate = [];
  for (const text of list) {
    const hasSlash = text.includes("/");
    const outPath = join(OUT_DIR, `${safeFileName(text)}.mp3`);
    if (hasSlash) {
      toGenerate.push(text);
    } else {
      try {
        await access(outPath);
      } catch {
        toGenerate.push(text);
      }
    }
  }

  if (toGenerate.length === 0) {
    console.log(`All ${list.length} words already have audio. Nothing to do.`);
    process.exit(0);
  }

  const tmpDir = join(process.env.TMPDIR || "/tmp", `fundamental-audio-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  console.log(
    `Found ${list.length} words, ${toGenerate.length} missing. Generating TTS${RATE ? ` (rate=${RATE})` : ""}...`
  );
  let done = 0;
  const failed = [];
  for (let i = 0; i < toGenerate.length; i++) {
    const text = toGenerate[i];
    const outPath = join(OUT_DIR, `${safeFileName(text)}.mp3`);
    const hasSlash = text.includes("/");
    try {
      if (hasSlash) {
        const parts = text.split("/").map((s) => s.trim()).filter(Boolean);
        if (parts.length < 2) {
          await runEdgeTts(text, join(tmpDir, `out-${i}.mp3`));
          const buf = await readFile(join(tmpDir, `out-${i}.mp3`));
          await writeFile(outPath, buf);
        } else {
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
        }
      } else {
        const tmpPath = join(tmpDir, `out-${i}.mp3`);
        await runEdgeTts(text, tmpPath);
        const buf = await readFile(tmpPath);
        await writeFile(outPath, buf);
      }
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${toGenerate.length}`);
    } catch (e) {
      failed.push({ text, err: e.message });
    }
  }
  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  console.log(`Done. ${done} files written to public/audio/`);
  if (failed.length > 0) {
    console.warn(`Skipped (edge-tts failed): ${failed.length}`);
    failed.forEach(({ text }) => console.warn(`  - ${text}`));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
