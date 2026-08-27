#!/usr/bin/env node
/**
 * getpronounce.net — Chinese pronunciation Pinterest pins (Sound-like).
 *
 *   yarn pronounce:gen
 *   npx tsx scripts/generate-zh-pronounce-samples.ts --id zh_word__ni-hao
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  appendFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import {
  IMAGE_DEPLOY,
  compositeListenCtaOnly,
  generateWithRetry,
} from "./lib/vocab-infographic-gen.mjs";
import {
  chineseWordArtPrompt,
  composeChineseWordPin,
  pickSimpleUpgradeBg,
} from "./lib/zh-pronounce-pin-formats.mjs";
import {
  ZH_PRONOUNCE_QUEUE_JOBS,
  type ZhWordJob,
} from "./data/zh-pronounce-queue-jobs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "zh-pronounce-samples");
const LOG = join(OUT, "batch.log");
const PROGRESS = join(OUT, "progress.json");
const LISTEN_CTA = "Listen on website";

function loadEnvFile(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}
loadEnvFile(join(ROOT, ".env.local"));
loadEnvFile(join(ROOT, ".env"));
loadEnvFile(join(ROOT, ".env.development.local"));
loadEnvFile(
  join(ROOT, "..", "projects", "neo-project", "korean-quiz", ".env.local"),
);
loadEnvFile(
  join(ROOT, "..", "projects", "neo-project", "auto-video-korean", ".env"),
);

function log(line: string) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  console.log(msg);
  mkdirSync(OUT, { recursive: true });
  appendFileSync(LOG, msg + "\n");
}

function loadProgress() {
  if (!existsSync(PROGRESS)) return { done: {}, failed: {} };
  try {
    return JSON.parse(readFileSync(PROGRESS, "utf8"));
  } catch {
    return { done: {}, failed: {} };
  }
}

function saveProgress(p: ReturnType<typeof loadProgress>) {
  writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

async function runJob(job: ZhWordJob) {
  const bg = pickSimpleUpgradeBg(job.id);
  const artPrompt = chineseWordArtPrompt(job.scene, bg);
  process.env.VOCAB_IMAGE_USE_REF = "1";
  const art = await generateWithRetry(
    { prompt: artPrompt, size: "1024x1536", root: ROOT, format: "zh_word" },
    { maxRetries: 5 },
  );
  const composed = await composeChineseWordPin({
    english: job.english,
    chinese: job.chinese,
    pinyin: job.pinyin,
    illustrationPng: art,
    bgColor: bg,
    targetColor: job.targetColor,
  });
  const branded = await compositeListenCtaOnly(composed);
  return { art, branded };
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const onlyId =
    argv.find((a) => a.startsWith("--id="))?.slice(5) ||
    (argv.includes("--id") ? argv[argv.indexOf("--id") + 1] : "");

  let jobs = ZH_PRONOUNCE_QUEUE_JOBS;
  if (onlyId) jobs = jobs.filter((j) => j.id === onlyId);
  if (!jobs.length) {
    console.error("No jobs matched");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  const progress = loadProgress();
  log(`==> zh-pronounce jobs=${jobs.length} model=${IMAGE_DEPLOY}`);

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const outPng = join(OUT, `${job.id}.png`);
    const artPng = join(OUT, `${job.id}_art.png`);
    const metaPath = join(OUT, `${job.id}.json`);
    log(`[${i + 1}/${jobs.length}] ${job.id}`);

    if (!force && existsSync(outPng) && existsSync(metaPath)) {
      log("  skip");
      continue;
    }

    try {
      const t0 = Date.now();
      const { art, branded } = await runJob(job);
      writeFileSync(artPng, art);
      writeFileSync(outPng, branded);
      const meta = {
        id: job.id,
        format: job.format,
        product: "teach_chinese_pronunciation",
        audience: "en",
        teaches: "zh",
        site: "getpronounce.net",
        topicSlug: job.topicSlug,
        slug: job.slug,
        titleEn: `${job.english} — ${job.chinese} (${job.pinyin})`,
        words: [
          {
            chinese: job.chinese,
            pinyin: job.pinyin,
            english: job.english,
          },
        ],
        examples: [],
        footer: { kind: "listen_website", cta: LISTEN_CTA, logo: false },
        sec: ((Date.now() - t0) / 1000).toFixed(1),
        model: IMAGE_DEPLOY,
        at: new Date().toISOString(),
      };
      writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      progress.done[job.id] = { at: meta.at, outPath: outPng };
      delete progress.failed[job.id];
      saveProgress(progress);
      log(`  ok → ${outPng}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      progress.failed[job.id] = { at: new Date().toISOString(), error: msg };
      saveProgress(progress);
      log(`  fail: ${msg}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
