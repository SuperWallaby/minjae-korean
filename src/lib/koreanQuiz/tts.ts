import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

import {
  resolveAutoVideoKoreanPython,
  resolveAutoVideoKoreanRoot,
  vocabQuizTtsScript,
} from "./avkPaths";
import { patchKoreanQuizAnswerTtsMeta, resolveAnswerTtsText } from "./store";
import {
  buildQuizAnswerTtsR2Key,
  buildQuizAnswerTtsSlowR2Key,
  getFromR2,
  getR2LastModified,
  isR2Configured,
  publicUrlForR2Key,
  uploadToR2,
} from "./objectStorage";
import type { KoreanQuizItem } from "./types";

const execFileAsync = promisify(execFile);

import type { AnswerTtsVariant } from "./ttsUrls";
import { answerTtsApiUrl } from "./ttsUrls";

export type { AnswerTtsVariant };

export const DEFAULT_ANSWER_TTS_PROMPT =
  "Slow clear friendly Korean quiz answer — calm teacher voice, gentle pace, not rushed or flat";

export function isKoreanQuizTtsConfigured(): boolean {
  if (process.env.ELEVENLABS_API_KEY?.trim()) return true;
  const avkRoot = resolveAutoVideoKoreanRoot();
  const envPath = join(avkRoot, ".env");
  if (!existsSync(envPath)) return false;
  return readFileSync(envPath, "utf8").includes("ELEVENLABS_API_KEY=");
}

export function resolveAnswerTtsTonePrompt(
  item: Pick<KoreanQuizItem, "answerTtsPrompt">,
): string {
  return item.answerTtsPrompt?.trim() || DEFAULT_ANSWER_TTS_PROMPT;
}

function r2KeyForVariant(quizId: string, variant: AnswerTtsVariant): string {
  return variant === "slow"
    ? buildQuizAnswerTtsSlowR2Key(quizId)
    : buildQuizAnswerTtsR2Key(quizId);
}

/** Cache-bust token for TTS URLs — stored timestamp or R2 LastModified after regen. */
export async function resolveAnswerTtsCacheKey(
  item: Pick<
    KoreanQuizItem,
    "id" | "answerTtsUpdatedAt" | "answerTtsSlowUpdatedAt"
  >,
  variant: AnswerTtsVariant = "normal",
): Promise<string | undefined> {
  const stored =
    variant === "slow"
      ? item.answerTtsSlowUpdatedAt?.trim()
      : item.answerTtsUpdatedAt?.trim();
  if (stored) return stored;

  if (!isR2Configured()) return undefined;
  const mod = await getR2LastModified(r2KeyForVariant(item.id, variant));
  return mod ? String(mod.getTime()) : undefined;
}

export async function resolveAnswerTtsApiUrl(
  item: KoreanQuizItem,
  variant: AnswerTtsVariant = "normal",
): Promise<string> {
  const cacheKey = await resolveAnswerTtsCacheKey(item, variant);
  return answerTtsApiUrl(item.id, variant, cacheKey);
}

/** Same-origin API URL for browser playback (generates on demand when R2 cache is empty). */
export { answerTtsApiUrl } from "./ttsUrls";

export async function generateAnswerTtsMp3(
  text: string,
  variant: AnswerTtsVariant,
  options?: { tonePrompt?: string },
): Promise<Buffer> {
  const avkRoot = resolveAutoVideoKoreanRoot();
  const pythonBin = resolveAutoVideoKoreanPython(avkRoot);
  const script = vocabQuizTtsScript(avkRoot);
  if (!existsSync(script)) {
    throw new Error(`TTS script not found: ${script}`);
  }
  if (!isKoreanQuizTtsConfigured()) {
    throw new Error("ELEVENLABS_API_KEY is required.");
  }

  const tmpDir = await mkdtemp(join(tmpdir(), "vocab-quiz-tts-"));
  const outPath = join(tmpDir, "answer.mp3");
  const args = [
    script,
    "--text",
    text,
    "--variant",
    variant,
    "--output",
    outPath,
  ];
  const tonePrompt = options?.tonePrompt?.trim();
  if (tonePrompt) args.push("--tone-prompt", tonePrompt);

  try {
    const { stderr } = await execFileAsync(pythonBin, args, {
      cwd: avkRoot,
      env: process.env,
      maxBuffer: 8 * 1024 * 1024,
      timeout: 120_000,
    });
    if (stderr?.trim()) {
      console.warn("[vocab-quiz-tts]", stderr.trim());
    }
    return await readFile(outPath);
  } finally {
    await rm(tmpDir, { recursive: true, force: true });
  }
}

async function uploadAnswerTtsMp3(
  quizId: string,
  variant: AnswerTtsVariant,
  mp3: Buffer,
): Promise<void> {
  const r2Key = r2KeyForVariant(quizId, variant);
  const now = new Date().toISOString();
  await uploadToR2({
    key: r2Key,
    body: mp3,
    contentType: "audio/mpeg",
    cacheControl: "public, max-age=31536000, immutable",
  });
  await patchKoreanQuizAnswerTtsMeta(quizId, {
    answerTtsR2Key: variant === "normal" ? r2Key : undefined,
    answerTtsUpdatedAt: variant === "normal" ? now : undefined,
    answerTtsSlowUpdatedAt: variant === "slow" ? now : undefined,
  });
}

/** Load MP3 bytes from R2 or generate + cache. */
export async function resolveAnswerTtsMp3(
  item: KoreanQuizItem,
  variant: AnswerTtsVariant = "normal",
): Promise<Buffer | null> {
  const label = resolveAnswerTtsText(item);
  if (!label) return null;

  const r2Key = r2KeyForVariant(item.id, variant);
  if (isR2Configured()) {
    const cached = await getFromR2(r2Key);
    if (cached?.body.length) return cached.body;
  }

  if (!isKoreanQuizTtsConfigured()) {
    return null;
  }

  const mp3 = await generateAnswerTtsMp3(label, variant, {
    tonePrompt: resolveAnswerTtsTonePrompt(item),
  });
  if (isR2Configured()) {
    await uploadAnswerTtsMp3(item.id, variant, mp3);
  }
  return mp3;
}

/** @deprecated Use answerTtsApiUrl — kept for admin/debug */
export function getCachedAnswerTtsUrl(item: KoreanQuizItem): string | undefined {
  const existingKey = item.answerTtsR2Key?.trim();
  if (!existingKey || !isR2Configured()) return undefined;
  return publicUrlForR2Key(existingKey) ?? undefined;
}
