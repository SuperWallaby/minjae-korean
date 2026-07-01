import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

/** Sibling repo: neo-project/auto-video-korean (format 8 object_quiz TTS). */
export function resolveAutoVideoKoreanRoot(): string {
  const fromEnv = process.env.AUTO_VIDEO_KOREAN_ROOT?.trim();
  if (fromEnv) return resolve(fromEnv);
  return resolve(process.cwd(), "../projects/neo-project/auto-video-korean");
}

export function resolveAutoVideoKoreanPython(avkRoot: string): string {
  if (process.env.PYTHON_BIN?.trim()) {
    return process.env.PYTHON_BIN.trim();
  }
  const venvPy = join(avkRoot, ".venv/bin/python3");
  if (existsSync(venvPy)) return venvPy;
  return "python3";
}

export function vocabQuizTtsScript(avkRoot: string): string {
  return join(avkRoot, "scripts/generate_vocab_quiz_answer_tts.py");
}
