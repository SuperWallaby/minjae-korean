#!/usr/bin/env node
/**
 * YouTube 탐색(다이제스트) → 뉴스 기사 JSON 작성까지 한 번에 실행합니다.
 *
 *   yarn make-auto
 *       = digest + article + --register --full
 *   yarn youtube:explore-write
 *   yarn youtube:explore-write -- --register --full
 *
 * `--register`가 있으면 기사 단계(LLM·등록·full 자동화)가 실패할 때마다
 * 유튜브 탐색부터 다시 시도합니다(기본 최대 5회, `YOUTUBE_PIPELINE_MAX_TRIES`).
 * (같은 영상 중복 등록은 DB에서 막히며, 그 경우에도 새 탐색으로 이어집니다.)
 *
 * 두 번째 단계에 넘기는 인자는 `youtube_digest_to_news_article.mjs`와 동일합니다
 * (--input, --out, --index, --base-url 등).
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NODE = process.execPath;

/**
 * @returns {number} exit code (0 = success)
 */
function runScript(relPath, args) {
  const scriptPath = join(ROOT, relPath);
  const r = spawnSync(NODE, [scriptPath, ...args], {
    cwd: ROOT,
    stdio: "inherit",
    env: process.env,
  });
  if (r.error) {
    console.error(r.error);
    return 1;
  }
  return r.status === 0 ? 0 : r.status ?? 1;
}

const articleArgs = process.argv.slice(2);
const wantsRegister = articleArgs.includes("--register");
const maxTries = wantsRegister
  ? Math.min(
      12,
      Math.max(1, Number.parseInt(process.env.YOUTUBE_PIPELINE_MAX_TRIES || "5", 10) || 5),
    )
  : 1;

for (let attempt = 1; attempt <= maxTries; attempt++) {
  if (attempt > 1) {
    console.error(
      `\n[youtube-pipeline] ${attempt}/${maxTries}: 기사 단계 실패 → 다른 영상으로 유튜브 재탐색 후 다시 시도합니다.\n`,
    );
  }

  const digestCode = runScript("scripts/youtube_personal_digest.mjs", []);
  if (digestCode !== 0) {
    process.exit(digestCode);
  }

  const articleCode = runScript("scripts/youtube_digest_to_news_article.mjs", articleArgs);
  if (articleCode === 0) {
    process.exit(0);
  }

  if (attempt >= maxTries) {
    console.error(
      `\n[youtube-pipeline] 최대 시도(${maxTries})에 도달했습니다. 로그의 HTTP/LLM 메시지를 확인하세요.\n`,
    );
    process.exit(articleCode);
  }
}
