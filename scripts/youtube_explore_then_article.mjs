#!/usr/bin/env node
/**
 * YouTube 탐색(다이제스트) → 뉴스 기사 JSON 작성까지 한 번에 실행합니다.
 *
 *   yarn make-auto
 *       = digest(후보 5) + 사람이 하나 선택 + article + --register --full
 *   yarn youtube:explore-write
 *   yarn youtube:explore-write -- --register --full
 *
 * `--pick` (make-auto 기본): 자막 확보된 후보 5개를 보여 주고 번호로 선택합니다.
 *   YOUTUBE_PICK_INDEX=2  → 비대화형(2번 후보)
 *
 * `--register`가 있으면 기사 단계(LLM·등록·full 자동화)가 실패할 때마다
 * 유튜브 탐색부터 다시 시도합니다(기본 최대 5회, `YOUTUBE_PIPELINE_MAX_TRIES`).
 *
 * 두 번째 단계에 넘기는 인자는 `youtube_digest_to_news_article.mjs`와 동일합니다
 * (--input, --out, --index, --base-url 등).
 */
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { createInterface } from "node:readline/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const NODE = process.execPath;
const DIGEST_JSON = join(ROOT, ".tmp", "youtube-personal-digest.json");
const PICK_CANDIDATE_COUNT = Math.min(
  20,
  Math.max(
    1,
    Number.parseInt(process.env.YOUTUBE_PICK_CANDIDATE_COUNT || "5", 10) || 5,
  ),
);

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

function readDigestResults() {
  const raw = JSON.parse(readFileSync(DIGEST_JSON, "utf8"));
  return Array.isArray(raw.results) ? raw.results : [];
}

function formatViews(viewCount) {
  if (viewCount == null || viewCount === "") return "";
  const n = Number(viewCount);
  if (!Number.isFinite(n)) return "";
  return `${n.toLocaleString("en-US")} views`;
}

async function promptPickCandidate() {
  const results = readDigestResults();
  if (results.length === 0) {
    console.error("\n[youtube-pipeline] 자막 확보된 후보가 없습니다.\n");
    return null;
  }

  console.error("\n[youtube-pipeline] ─────────────────────────────────────────");
  console.error(
    `[youtube-pipeline] 주제 후보 ${results.length}개 — 번호를 골라 주세요:\n`,
  );
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const views = formatViews(r.viewCount);
    const meta = [r.url, views].filter(Boolean).join(" · ");
    console.error(`  ${i + 1}. ${r.title || r.videoId || "(제목 없음)"}`);
    if (meta) console.error(`     ${meta}`);
    if (r.query) console.error(`     검색: ${r.query}`);
    console.error("");
  }
  console.error("[youtube-pipeline] ─────────────────────────────────────────\n");

  const envIdx = process.env.YOUTUBE_PICK_INDEX?.trim();
  if (envIdx) {
    const n = Number.parseInt(envIdx, 10);
    if (Number.isFinite(n) && n >= 1 && n <= results.length) {
      console.error(
        `[youtube-pipeline] YOUTUBE_PICK_INDEX=${n} → ${results[n - 1].title || results[n - 1].videoId}\n`,
      );
      return n - 1;
    }
    console.error(
      `[youtube-pipeline] YOUTUBE_PICK_INDEX=${envIdx} 무시 (1–${results.length} 필요)\n`,
    );
  }

  const rl = createInterface({ input: process.stdin, output: process.stderr });
  try {
    while (true) {
      const ans = (await rl.question(`번호 (1-${results.length}): `)).trim();
      const n = Number.parseInt(ans, 10);
      if (Number.isFinite(n) && n >= 1 && n <= results.length) {
        console.error(
          `\n[youtube-pipeline] 선택: ${n}. ${results[n - 1].title || results[n - 1].videoId}\n`,
        );
        return n - 1;
      }
      console.error(`1–${results.length} 사이 숫자를 입력하세요.`);
    }
  } finally {
    rl.close();
  }
}

const rawArgs = process.argv.slice(2);
const wantsPick = rawArgs.includes("--pick");
const wantsRegister = rawArgs.includes("--register");
const articleArgs = rawArgs.filter((a) => a !== "--pick");
const maxTries = wantsRegister
  ? Math.min(
      12,
      Math.max(1, Number.parseInt(process.env.YOUTUBE_PIPELINE_MAX_TRIES || "5", 10) || 5),
    )
  : 1;

async function main() {
  for (let attempt = 1; attempt <= maxTries; attempt++) {
    if (attempt > 1) {
      console.error(
        `\n[youtube-pipeline] ${attempt}/${maxTries}: 기사 단계 실패 → 다른 영상으로 유튜브 재탐색 후 다시 시도합니다.\n`,
      );
    }

    const digestArgs = wantsPick ? ["--candidates", String(PICK_CANDIDATE_COUNT)] : [];
    const digestCode = runScript("scripts/youtube_personal_digest.mjs", digestArgs);
    if (digestCode !== 0) {
      process.exit(digestCode);
    }

    let articleRunArgs = [...articleArgs];
    if (wantsPick) {
      const pickIndex = await promptPickCandidate();
      if (pickIndex == null) {
        process.exit(1);
      }
      articleRunArgs = [...articleRunArgs, "--index", String(pickIndex)];
    }

    const articleCode = runScript(
      "scripts/youtube_digest_to_news_article.mjs",
      articleRunArgs,
    );
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
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
