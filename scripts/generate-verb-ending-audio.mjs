#!/usr/bin/env node
/**
 * korean-verb-ending.ts 의 examples[].text 를 edge-tts로 오디오 생성 후
 * public/audio/ 에 저장하고, 각 example 의 sound 를 "/audio/파일명.mp3" 로 채움.
 * Requires: pip install edge-tts
 *
 * 사용법:
 *   node scripts/generate-verb-ending-audio.mjs
 *   EDGE_TTS_RATE=-25% node scripts/generate-verb-ending-audio.mjs
 *
 * 이미 public/audio/ 에 해당 파일이 있으면 건너뜀. dry-run: DRY_RUN=1 node scripts/generate-verb-ending-audio.mjs
 */

import { readFile, writeFile, mkdir, rm, access } from "fs/promises";
import { spawn } from "child_process";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_FILE = join(ROOT, "src", "data", "blogPosts", "content", "korean-verb-ending.ts");
const OUT_DIR = join(ROOT, "public", "audio");
const VOICE = process.env.EDGE_TTS_VOICE || "ko-KR-InJoonNeural";
const RATE = process.env.EDGE_TTS_RATE || "";
const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

/** 파일명에 쓰이면 안 되는 문자 치환. 끝 마침표 제거 */
function safeFileName(text) {
  const s = String(text)
    .replace(/\//g, "-")
    .replace(/\\/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  return s.replace(/\.+$/, "");
}

/** TS 파일에서 "text": "..." 값들을 순서대로 추출 (이스케이프 처리) */
function extractTextsInOrder(content) {
  const texts = [];
  const re = /"text":\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const raw = m[1].replace(/\\"/g, '"').replace(/\\n/g, "\n").trim();
    if (raw) texts.push(raw);
  }
  return texts;
}

/** TS 파일에서 "sound": "" 를 순서대로 path 로 치환 */
function replaceEmptySounds(content, pathsInOrder) {
  let idx = 0;
  return content.replace(/"sound":\s*""/g, () => {
    const path = idx < pathsInOrder.length ? pathsInOrder[idx] : "";
    idx += 1;
    return `"sound": "${path}"`;
  });
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

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const raw = await readFile(DATA_FILE, "utf-8");
  const texts = extractTextsInOrder(raw);
  if (texts.length === 0) {
    console.error("No example texts found in", DATA_FILE);
    process.exit(1);
  }

  const pathsInOrder = texts.map((t) => `/audio/${safeFileName(t)}.mp3`);
  const toGenerate = [];
  const seen = new Set();
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i];
    const name = safeFileName(t);
    if (!name) continue;
    const key = name;
    if (seen.has(key)) continue;
    seen.add(key);
    toGenerate.push({ text: t, name });
  }

  await mkdir(OUT_DIR, { recursive: true });
  const tmpDir = join(process.env.TMPDIR || "/tmp", `verb-ending-audio-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  console.log(
    `Verb ending examples: ${texts.length} texts, ${toGenerate.length} unique. ${DRY_RUN ? "(dry run)" : "Generating..."}`
  );
  if (RATE) console.log("Rate:", RATE);

  let done = 0;
  for (const { text, name } of toGenerate) {
    const outPath = join(OUT_DIR, `${name}.mp3`);
    if (!DRY_RUN) {
      const exists = await fileExists(outPath);
      if (exists) {
        done++;
        if (done % 50 === 0) console.log(`  ${done}/${toGenerate.length} (skip existing)`);
        continue;
      }
      const tmpPath = join(tmpDir, `${name}.mp3`);
      try {
        await runEdgeTts(text, tmpPath);
        const buf = await readFile(tmpPath);
        await writeFile(outPath, buf);
      } catch (err) {
        console.error(`  FAIL: "${text.slice(0, 40)}..."`, err.message);
        continue;
      }
    }
    done++;
    if (done % 20 === 0) console.log(`  ${done}/${toGenerate.length}`);
  }

  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});

  if (DRY_RUN) {
    console.log("Dry run done. No files written. Run without DRY_RUN=1 to generate and update.");
    return;
  }

  const newContent = replaceEmptySounds(raw, pathsInOrder);
  await writeFile(DATA_FILE, newContent, "utf-8");
  console.log(`Done. Updated ${DATA_FILE} with sound paths.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
