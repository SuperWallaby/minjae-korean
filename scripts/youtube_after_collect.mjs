#!/usr/bin/env node
/**
 * 다이제스트 수집 이후만 다시: 기사 JSON(LLM) → POST 등록 → --full 자동화.
 * 입력: .tmp/youtube-personal-digest.json (기본) / YOUTUBE_NEWS_INPUT
 *
 *   yarn make-after-collect
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
console.error("\n[make-after-collect] ═══════════════════════════════════════");
console.error("[make-after-collect] 다이제스트 → LLM 기사 → DB 등록 → 풀 자동화 (재수집 없음)");
console.error(
  "[make-after-collect] 진행 로그는 stderr에 [youtube-article] 단계로 출력됩니다.",
);
console.error(
  "[make-after-collect] 먼저 다른 터미널에서 `yarn dev`를 실행해 두세요.",
);
console.error("[make-after-collect] ═══════════════════════════════════════\n");
const r = spawnSync(
  process.execPath,
  [join(ROOT, "scripts", "youtube_digest_to_news_article.mjs"), "--register", "--full"],
  { cwd: ROOT, stdio: "inherit", env: process.env },
);
process.exit(r.status === 0 ? 0 : r.status ?? 1);
