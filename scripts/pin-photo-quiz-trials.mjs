#!/usr/bin/env node
/**
 * Pin photo-quiz trial cards (Minjae face composite) to Pinterest board
 * "Korean quiz". Extra / beyond daily vocab-wave limit — call explicitly.
 *
 *   node scripts/pin-photo-quiz-trials.mjs --count 4
 *   node scripts/pin-photo-quiz-trials.mjs --ids A1-pay-by-card,A2-coffee-please
 *
 * Source: neo-project/korean-quiz/local/photo-quiz-trials/raw-safezone/
 * Destination: kajakorean.com/quiz/result/{id} (noindex SPA-style result)
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ROOT } from "./lib/env_local.mjs";
import { optimizePinterestPin } from "./lib/optimize-pinterest-pin.mjs";
import { KO_PIN_BOARD_QUIZ } from "./lib/korean-pin-board.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const QUIZ_ROOT = path.resolve(
  ROOT,
  "../projects/neo-project/korean-quiz/local/photo-quiz-trials/raw-safezone",
);
const CATALOG = path.join(QUIZ_ROOT, "catalog.json");
const OUT = path.join(ROOT, ".tmp/photo-quiz-pins");
const PINNED = path.join(OUT, "pinterest-pinned.json");
const OPT_DIR = path.join(OUT, "pin-optimized");
const UPLOAD_PIN = path.join(
  ROOT,
  "../projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);
const BROWSER_URL = process.env.CHROME_WORK_DEBUG_URL || "http://127.0.0.1:9222";
const BOARD = process.env.PINTEREST_QUIZ_BOARD || KO_PIN_BOARD_QUIZ;
const SITE = "https://kajakorean.com";
const TOPIC = "Korean language";
const ATTEMPT_TIMEOUT_MS = 210_000;

function destFor(id) {
  const base = `${SITE}/quiz/result/${encodeURIComponent(id)}`;
  return `${base}?utm_source=pinterest&utm_medium=pin&utm_campaign=photo-quiz-pin`;
}

function parseArgs(argv) {
  let count = 4;
  let ids = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--count" && argv[i + 1]) {
      count = Math.max(1, Number(argv[++i]) || 4);
    } else if (a === "--ids" && argv[i + 1]) {
      ids = String(argv[++i])
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return { count, ids };
}

function loadJson(p, fallback) {
  if (!existsSync(p)) return fallback;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

function savePinned(map) {
  mkdirSync(path.dirname(PINNED), { recursive: true });
  writeFileSync(PINNED, `${JSON.stringify(map, null, 2)}\n`);
}

function pinKey(id) {
  return `photo-quiz-${id}`;
}

function titleFor(row) {
  const focus = String(row.focus || "").toLowerCase();
  const sentence = String(row.sentence || "").replace(/___/g, "…").trim();
  if (focus.includes("particle") || focus.includes("object") || focus.includes("dative") || focus.includes("location") || focus.includes("comitative")) {
    return "Korean particle quiz — fill in the blank";
  }
  if (focus.includes("past") || focus.includes("tense")) {
    return "Korean past tense quiz — what fits?";
  }
  if (focus.includes("want") || focus.includes("obligation") || focus.includes("reason")) {
    return "Korean grammar quiz — pick the ending";
  }
  if (sentence) {
    return `Korean quiz: ${sentence.slice(0, 42)}`;
  }
  return "Korean fill-in-the-blank quiz";
}

function descriptionFor(row) {
  const resultUrl = destFor(row.id).split("?")[0];
  const tweet = String(row.tweetText || "").trim();
  if (tweet) {
    return `${tweet}\n\nSee the answer → ${resultUrl}\n\n#learnkorean #koreanquiz #hangul #kajakorean`;
  }
  const choices = (row.choices || [])
    .map((c, i) => `${i + 1}) ${c}`)
    .join("  ·  ");
  return [
    "Quick Korean quiz — look at the picture, fill in the blank.",
    "",
    row.sentence || "",
    choices,
    "",
    `See the answer → ${resultUrl}`,
    "",
    "#learnkorean #koreanquiz #hangul #kajakorean",
  ]
    .filter((x) => x !== undefined)
    .join("\n");
}

function altFor(row) {
  return `Korean quiz card: ${String(row.sentence || row.id).slice(0, 80)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runUploadOnce({ media, title, description, alt, link, board }) {
  const result = spawnSync(
    process.execPath,
    [
      UPLOAD_PIN,
      "--media",
      media,
      "--title",
      title,
      "--description",
      description,
      "--link",
      link,
      "--topic",
      TOPIC,
      "--alt",
      alt,
      "--board",
      board,
      "--browser-url",
      BROWSER_URL,
      "--timeout",
      String(ATTEMPT_TIMEOUT_MS),
    ],
    {
      cwd: path.dirname(UPLOAD_PIN),
      encoding: "utf8",
      env: process.env,
      timeout: ATTEMPT_TIMEOUT_MS + 30_000,
      killSignal: "SIGKILL",
    },
  );
  const out = `${result.stdout || ""}${result.stderr || ""}`.trim();
  if (result.error?.code === "ETIMEDOUT" || result.signal === "SIGKILL") {
    return { ok: false, out: out || `timeout after ${ATTEMPT_TIMEOUT_MS}ms` };
  }
  if (result.status !== 0) {
    return { ok: false, out: out || `exit ${result.status}` };
  }
  return { ok: true, out: out || "ok" };
}

function parseUploadPayload(out) {
  const matches = String(out || "").match(/\{[^{}]*\}/g) || [];
  for (let i = matches.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(matches[i]);
    } catch {
      /* continue */
    }
  }
  return null;
}

async function main() {
  const { count, ids } = parseArgs(process.argv.slice(2));
  if (!existsSync(CATALOG)) {
    throw new Error(`catalog missing: ${CATALOG}`);
  }
  if (!existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin missing: ${UPLOAD_PIN}`);
  }
  mkdirSync(OPT_DIR, { recursive: true });

  const catalog = loadJson(CATALOG, []);
  const pinned = loadJson(PINNED, {});
  const vocabPinned = loadJson(
    path.join(ROOT, ".tmp/vocab-infographic-gen/pinterest-pinned.json"),
    {},
  );

  let candidates = catalog.filter((row) => {
    const key = pinKey(row.id);
    if (pinned[key] || vocabPinned[key] || vocabPinned[row.id]) return false;
    const composed = path.join(QUIZ_ROOT, row.composedFile || "");
    return existsSync(composed);
  });
  if (ids?.length) {
    const want = new Set(ids);
    candidates = candidates.filter((r) => want.has(r.id));
  }
  candidates = candidates.slice(0, count);

  console.log(
    `==> Photo quiz Pinterest: ${candidates.length} → board="${BOARD}" dest=/quiz/result/{id}`,
  );
  if (!candidates.length) {
    console.log("nothing to pin");
    return;
  }

  let okN = 0;
  for (let i = 0; i < candidates.length; i++) {
    const row = candidates[i];
    const key = pinKey(row.id);
    const link = destFor(row.id);
    const source = path.join(QUIZ_ROOT, row.composedFile);
    const optPath = path.join(OPT_DIR, `${row.id}.jpg`);
    const title = titleFor(row);
    const description = descriptionFor(row);
    const alt = altFor(row);

    console.log(`\n→ [${i + 1}/${candidates.length}] ${row.id}`);
    console.log(`   board: ${BOARD}`);
    console.log(`   title: ${title}`);
    console.log(`   link: ${link}`);

    const opt = await optimizePinterestPin(source, optPath);
    console.log(`   media: ${opt.path} (${opt.w}×${opt.h})`);

    let last = { ok: false, out: "no attempt" };
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`   attempt ${attempt}/2`);
      last = runUploadOnce({
        media: opt.path,
        title,
        description,
        alt,
        link,
        board: BOARD,
      });
      if (last.ok) break;
      console.log(`   fail: ${String(last.out).slice(0, 240)}`);
      await sleep(4000);
    }

    const payload = parseUploadPayload(last.out);
    if (!last.ok && !payload?.ok) {
      console.log(`   SKIP ${row.id} — upload failed`);
      continue;
    }

    pinned[key] = {
      at: new Date().toISOString(),
      title,
      description,
      pin_id: payload?.pin_id,
      pin_url: payload?.pin_url,
      link,
      board: payload?.board || BOARD,
      source: "photo-quiz-trial",
      trialId: row.id,
      publishUnconfirmed: Boolean(payload?.publishUnconfirmed),
    };
    // Mirror into vocab ledger so daily health / review tools see them.
    vocabPinned[key] = {
      ...pinned[key],
      board: BOARD,
    };
    savePinned(pinned);
    writeFileSync(
      path.join(ROOT, ".tmp/vocab-infographic-gen/pinterest-pinned.json"),
      `${JSON.stringify(vocabPinned, null, 2)}\n`,
    );
    okN += 1;
    console.log(
      `   OK pin_id=${payload?.pin_id || "?"} board=${payload?.board || BOARD}`,
    );

    if (i < candidates.length - 1) {
      const delay = 12_000 + Math.floor(Math.random() * 18_000);
      console.log(`   pause ${Math.round(delay / 1000)}s`);
      await sleep(delay);
    }
  }

  console.log(`\ndone: ${okN}/${candidates.length} photo-quiz pins on "${BOARD}"`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
