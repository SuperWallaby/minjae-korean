#!/usr/bin/env node
/**
 * EigoSound EN→EN pin warehouse.
 *
 * Formats:
 *   - simple_upgrade  GPT art → composite
 *   - other_ways      GPT character bg → composite
 *   - slang_card      oneshot gpt-image-2 (full pin with text)
 *
 *   yarn sound:gen
 *   npx tsx scripts/generate-en-en-samples.ts --id en_upgrade__filthy
 *   npx tsx scripts/generate-en-en-samples.ts --format simple_upgrade --force
 *   npx tsx scripts/generate-en-en-samples.ts --format other_ways --force
 *
 * Output: .tmp/en-en-samples/{id}.png + {id}_art.png + {id}.json
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
  composeOtherWaysPin,
  composeSimpleUpgradePin,
  otherWaysArtPrompt,
  pickOtherWaysPalette,
  pickSimpleUpgradeBg,
  simpleUpgradeArtPrompt,
  slangCardFullPinPrompt,
} from "./lib/en-en-pin-formats.mjs";
import { EN_EN_QUEUE_JOBS, type EnEnJob } from "./data/en-en-queue-jobs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, ".tmp", "en-en-samples");
const LOG = join(OUT, "batch.log");
const PROGRESS = join(OUT, "progress.json");
const SOUND_LISTEN_CTA = "Listen on website";

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

function log(line: string) {
  const msg = `[${new Date().toISOString()}] ${line}`;
  console.log(msg);
  mkdirSync(OUT, { recursive: true });
  appendFileSync(LOG, msg + "\n");
}

function loadProgress(): {
  done: Record<string, unknown>;
  failed: Record<string, { at: string; error: string }>;
} {
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

async function generateArtPng(prompt: string): Promise<Buffer> {
  // Brand beige doodle CAPYBARA — force style-ref sheet (same as Kaja pins).
  const prevRef = process.env.VOCAB_IMAGE_USE_REF;
  process.env.VOCAB_IMAGE_USE_REF = "1";
  try {
    return await generateWithRetry(
      {
        prompt,
        size: "1024x1536",
        root: ROOT,
        styleRefMode: "mascot",
      },
      { maxRetries: 6 },
    );
  } finally {
    if (prevRef === undefined) delete process.env.VOCAB_IMAGE_USE_REF;
    else process.env.VOCAB_IMAGE_USE_REF = prevRef;
  }
}

async function runSimpleUpgrade(
  job: Extract<EnEnJob, { format: "simple_upgrade" }>,
) {
  const bg = pickSimpleUpgradeBg(job.id);
  const prompt = simpleUpgradeArtPrompt({
    scene: job.scene,
    bgColor: bg,
  });
  const art = await generateArtPng(prompt);
  const composed = await composeSimpleUpgradePin({
    simple: job.simple,
    target: job.target,
    illustrationPng: art,
    bgColor: bg,
    targetColor: job.targetColor,
  });
  const branded = await compositeListenCtaOnly(composed, {
    ctaText: SOUND_LISTEN_CTA,
    variant: "global",
    overlay: true,
    corner: "top-right",
  });
  return {
    art,
    branded,
    metaExtra: { bg, simple: job.simple, target: job.target },
  };
}

async function runOtherWays(job: Extract<EnEnJob, { format: "other_ways" }>) {
  const palette = pickOtherWaysPalette(job.id);
  const prompt = otherWaysArtPrompt({
    mood: job.mood,
    characterHint: job.characterHint,
    bgColor: palette.bg,
  });
  const art = await generateArtPng(prompt);
  const composed = await composeOtherWaysPin({
    headline: job.headline,
    phrases: job.phrases,
    illustrationPng: art,
    ink: palette.ink,
    kicker: job.kicker,
  });
  const branded = await compositeListenCtaOnly(composed, {
    ctaText: SOUND_LISTEN_CTA,
    variant: "global",
    overlay: true,
    corner: "top-right",
  });
  return {
    art,
    branded,
    metaExtra: {
      palette,
      headline: job.headline,
      phrases: job.phrases,
    },
  };
}

/** Full pin from gpt-image-2 (text baked in); only CTA band is composited after. */
async function runSlangCard(job: Extract<EnEnJob, { format: "slang_card" }>) {
  const prompt = slangCardFullPinPrompt({
    label: job.label,
    word: job.word,
    definition: job.definition,
    example: job.example,
    scene: job.scene,
    accent: job.accent,
  });
  const art = await generateArtPng(prompt);
  const branded = await compositeListenCtaOnly(art, {
    ctaText: SOUND_LISTEN_CTA,
    variant: "global",
    overlay: true,
    corner: "top-right",
  });
  return {
    art,
    branded,
    metaExtra: {
      pipeline: "oneshot_gpt_image",
      label: job.label,
      word: job.word,
      definition: job.definition,
      example: job.example,
      accent: job.accent || null,
      prompt,
    },
  };
}

async function main() {
  loadEnvFile(join(ROOT, ".env.local"));
  loadEnvFile(join(ROOT, ".env"));
  loadEnvFile(join(ROOT, ".env.development.local"));
  loadEnvFile(
    join(ROOT, "../projects/neo-project/auto-video-korean/.env"),
  );

  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const idIdx = argv.indexOf("--id");
  const onlyId =
    idIdx >= 0 && argv[idIdx + 1]
      ? argv[idIdx + 1]
      : argv.find((a) => a.startsWith("--id="))?.slice(5) || "";
  const formatIdx = argv.indexOf("--format");
  const onlyFormat =
    formatIdx >= 0 && argv[formatIdx + 1]
      ? argv[formatIdx + 1]
      : argv.find((a) => a.startsWith("--format="))?.slice(9) || "";

  let jobs = [...EN_EN_QUEUE_JOBS];
  if (onlyId) jobs = jobs.filter((j) => j.id === onlyId);
  if (onlyFormat) jobs = jobs.filter((j) => j.format === onlyFormat);
  if (!jobs.length) {
    console.error("No jobs matched.");
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  const progress = loadProgress();
  log(`==> EN→EN jobs=${jobs.length} model=${IMAGE_DEPLOY} force=${force}`);

  let ok = 0;
  let skip = 0;
  let fail = 0;

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const outPng = join(OUT, `${job.id}.png`);
    const artPng = join(OUT, `${job.id}_art.png`);
    const metaPath = join(OUT, `${job.id}.json`);
    log(`\n[${i + 1}/${jobs.length}] ${job.format} ${job.id}`);

    if (!force && existsSync(outPng) && existsSync(metaPath)) {
      log("  skip (exists)");
      skip++;
      continue;
    }

    try {
      const t0 = Date.now();
      let result: Awaited<ReturnType<typeof runSimpleUpgrade>>;
      if (job.format === "simple_upgrade") {
        result = await runSimpleUpgrade(job);
      } else if (job.format === "other_ways") {
        result = await runOtherWays(job);
      } else {
        result = await runSlangCard(job);
      }
      writeFileSync(artPng, result.art);
      writeFileSync(outPng, result.branded);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      const words =
        job.format === "simple_upgrade"
          ? [{ english: job.target, gloss: job.simple }]
          : job.format === "other_ways"
            ? job.phrases.map((p) => ({ english: p }))
            : [
                {
                  english: job.word,
                  gloss: job.definition,
                  example: job.example,
                },
              ];
      const titleEn =
        job.format === "simple_upgrade"
          ? `${job.simple} → ${job.target}`
          : job.format === "other_ways"
            ? `Other ways to say ${job.headline}`
            : `${job.label}: ${job.word}`;
      const pipeline =
        job.format === "slang_card"
          ? "oneshot_gpt_image"
          : "art_gen_then_composite";
      const meta = {
        id: job.id,
        format: job.format,
        product: "teach_english_in_english",
        audience: "en",
        teaches: "en",
        site: "sound.eigopin.com",
        topicSlug: job.topicSlug,
        titleEn,
        words,
        examples: [],
        pipeline,
        artPath: artPng,
        outPath: outPng,
        footer: {
          kind: "listen_website",
          cta: SOUND_LISTEN_CTA,
          logo: false,
        },
        ...result.metaExtra,
        sec,
        model: IMAGE_DEPLOY,
        at: new Date().toISOString(),
      };
      writeFileSync(metaPath, JSON.stringify(meta, null, 2));
      progress.done[job.id] = {
        at: meta.at,
        sec,
        outPath: outPng,
        format: job.format,
      };
      delete progress.failed[job.id];
      saveProgress(progress);
      ok++;
      log(`  ok ${sec}s → ${outPng}`);
    } catch (e) {
      fail++;
      const msg = e instanceof Error ? e.message : String(e);
      progress.failed[job.id] = { at: new Date().toISOString(), error: msg };
      saveProgress(progress);
      log(`  ✗ fail: ${msg}`);
    }
  }

  log(`\n==> EN→EN done ok=${ok} skip=${skip} fail=${fail}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
