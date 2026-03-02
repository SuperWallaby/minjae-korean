#!/usr/bin/env node
/**
 * 한글 모음×자음 조합 테이블용 음절 오디오 일괄 생성.
 * Requires: pip install edge-tts
 * Run from project root: node scripts/generate-hangeul-syllable-audio.mjs
 * Output: public/audio/가.mp3, 나.mp3, … (140개)
 *
 * 느리게 생성: EDGE_TTS_RATE=-25% node scripts/generate-hangeul-syllable-audio.mjs
 * (음수 = 느리게, 예: -20%, -30%. 다시 만들면 기존 파일 덮어씀)
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
/** 느리게: -20%, -30% 등. 비우면 기본 속도 */
const RATE = process.env.EDGE_TTS_RATE || "";

const CHOSEONG_INDEX = {
  ㄱ: 0, ㄲ: 1, ㄴ: 2, ㄷ: 3, ㄸ: 4, ㄹ: 5, ㅁ: 6, ㅂ: 7, ㅃ: 8,
  ㅅ: 9, ㅆ: 10, ㅇ: 11, ㅈ: 12, ㅉ: 13, ㅊ: 14, ㅋ: 15, ㅌ: 16, ㅍ: 17, ㅎ: 18,
};
const JUNGSEONG_INDEX = {
  ㅏ: 0, ㅐ: 1, ㅑ: 2, ㅒ: 3, ㅓ: 4, ㅔ: 5, ㅕ: 6, ㅖ: 7,
  ㅗ: 8, ㅘ: 9, ㅙ: 10, ㅚ: 11, ㅛ: 12, ㅜ: 13, ㅝ: 14, ㅞ: 15, ㅟ: 16,
  ㅠ: 17, ㅡ: 18, ㅢ: 19, ㅣ: 20,
};

function compose(consonant, vowel) {
  const c = CHOSEONG_INDEX[consonant];
  const v = JUNGSEONG_INDEX[vowel];
  if (c == null || v == null) return null;
  return String.fromCodePoint(0xac00 + c * 588 + v * 28);
}

const CONSONANTS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const VOWELS = ["ㅏ", "ㅑ", "ㅓ", "ㅕ", "ㅗ", "ㅛ", "ㅜ", "ㅠ", "ㅡ", "ㅣ"];

const syllables = [];
for (const v of VOWELS) {
  for (const c of CONSONANTS) {
    const s = compose(c, v);
    if (s) syllables.push(s);
  }
}

function runEdgeTts(text, outPath) {
  const args = ["--voice", VOICE, "--text", text, "--write-media", outPath];
  if (RATE) args.push("--rate=" + RATE);
  return new Promise((resolve, reject) => {
    const proc = spawn("edge-tts", args, {
      stdio: "pipe",
      cwd: ROOT,
    });
    proc.on("error", (err) => reject(err));
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const tmpDir = join(tmpdir(), `hangeul-syllables-${Date.now()}`);
  await mkdir(tmpDir, { recursive: true });

  console.log(`Generating ${syllables.length} syllable files with edge-tts${RATE ? ` (rate=${RATE})` : ""}...`);
  let done = 0;
  for (const syl of syllables) {
    const tmpPath = join(tmpDir, `syl-${done}.mp3`);
    await runEdgeTts(syl, tmpPath);
    const buf = await readFile(tmpPath);
    const outPath = join(OUT_DIR, `${syl}.mp3`);
    await writeFile(outPath, buf);
    done += 1;
    if (done % 20 === 0) console.log(`  ${done}/${syllables.length}`);
  }
  await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  console.log(`Done. ${syllables.length} files in public/audio/ (가.mp3, 나.mp3, …)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
