#!/usr/bin/env node
/**
 * Pinterest → getpronounce.net (multilingual Chrome :9224).
 *
 *   https://getpronounce.net/words/{slug}?utm_source=pinterest&utm_campaign=getpronounce-pin
 *
 *   yarn pronounce:pin --count 4
 *   yarn pronounce:pin --id zh_word__ni-hao
 *   yarn pronounce:pin --dry-run
 */
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  optimizePinterestPin,
  optimizedPinPath,
} from "./lib/optimize-pinterest-pin.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/pronouncePins/published.json");
const PNG_DIR = path.join(ROOT, "public", "pronounce", "pins");
const TMP = path.join(ROOT, ".tmp", "zh-pronounce-samples");
const PIN_OPT_DIR = path.join(TMP, "pin-optimized");
const PINNED = path.join(TMP, "pinterest-pinned.json");
const FAILED = path.join(TMP, "pinterest-failed.json");
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);
const DELETE_DRAFTS = path.join(path.dirname(UPLOAD_PIN), "delete-drafts.mjs");
const DRAFT_MIN_COUNT = Math.max(
  1,
  Number(process.env.PINTEREST_DRAFT_MIN_COUNT ?? 50) || 50,
);

const BROWSER_URL =
  process.env.CHROME_PINTEREST_ML_DEBUG_URL ||
  process.env.CHROME_GLOBAL_DEBUG_URL ||
  "http://127.0.0.1:9224";

const PRONOUNCE_SITE = (
  process.env.NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN ||
  process.env.PRONOUNCE_SITE_URL ||
  "https://getpronounce.net"
).replace(/\/+$/, "");

const SKIP_LIVE_CHECK =
  process.env.PRONOUNCE_PIN_SKIP_LIVE_CHECK === "1" ||
  process.argv.includes("--skip-live-check");
const LIVE_WAIT_MS = Math.max(
  0,
  Number(process.env.PRONOUNCE_PIN_LIVE_WAIT_MS || 180_000) || 180_000,
);
const DELAY_MIN_SEC = Math.max(
  0,
  Number(process.env.PINTEREST_UPLOAD_DELAY_MIN_SEC || 10),
);
const DELAY_MAX_SEC = Math.max(
  DELAY_MIN_SEC,
  Number(process.env.PINTEREST_UPLOAD_DELAY_MAX_SEC || 30),
);
const ATTEMPT_TIMEOUT_MS = Number(
  process.env.PINTEREST_ATTEMPT_TIMEOUT_MS || 180_000,
);
const MAX_RETRIES = Number(process.env.PINTEREST_MAX_RETRIES || 2);
const DESC_MAX = 480;
const DEFAULT_BOARD =
  process.env.PINTEREST_PRONOUNCE_BOARD_NAME ||
  process.env.PINTEREST_BOARD_NAME ||
  "Chinese words";

function parseArgs(argv) {
  let count = 4;
  let id = "";
  let dryRun = false;
  let board = DEFAULT_BOARD;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--skip-live-check") {
      /* SKIP_LIVE_CHECK */
    } else if (a === "--count" && argv[i + 1])
      count = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a.startsWith("--count="))
      count = Math.max(1, parseInt(a.slice(8), 10) || 4);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--board" && argv[i + 1]) board = argv[++i];
    else if (a.startsWith("--board=")) board = a.slice(8);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 4);
  }
  return { count, id, dryRun, board: String(board || "").trim() };
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nextDelaySec() {
  const lo = Math.floor(DELAY_MIN_SEC);
  const hi = Math.floor(DELAY_MAX_SEC);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function wordHasTts(w) {
  const cnF = String(w?.ttsFemaleCn || w?.ttsUrl || "").trim();
  const cnM = String(w?.ttsMaleCn || "").trim();
  return Boolean(cnF && cnM);
}

function pageHasTts(page) {
  const words = page?.words || [];
  if (!words.length) return false;
  return words.every(
    (w) => !String(w.chinese || "").trim() || wordHasTts(w),
  );
}

function pinUrl(page) {
  const slug = page.slug || page.id.replace(/^zh_word__/, "");
  const u = new URL(`/words/${encodeURIComponent(slug)}`, `${PRONOUNCE_SITE}/`);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_campaign", "getpronounce-pin");
  return u.toString();
}

function liveUrl(page) {
  const slug =
    typeof page === "string"
      ? page
      : page.slug || page.id?.replace(/^zh_word__/, "") || page.id;
  return `${PRONOUNCE_SITE}/words/${encodeURIComponent(slug)}`;
}

async function isLivePinPage(page) {
  const url = liveUrl(page);
  try {
    const head = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (head.ok) return true;
    if ([403, 404, 405].includes(head.status)) {
      const get = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(20_000),
        headers: { Accept: "text/html" },
      });
      return get.ok;
    }
    return false;
  } catch {
    return false;
  }
}

async function waitLivePinPage(page, waitMs) {
  if (await isLivePinPage(page)) return true;
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    await sleep(12_000);
    if (await isLivePinPage(page)) return true;
  }
  return false;
}

function pngFor(id) {
  const pub = path.join(PNG_DIR, `${id}.png`);
  if (fs.existsSync(pub)) return pub;
  const tmp = path.join(TMP, `${id}.png`);
  if (fs.existsSync(tmp)) return tmp;
  return "";
}

function listCatalogReady() {
  const catalog = loadJson(PUBLISHED, {});
  return (catalog.pages || [])
    .map((page) => {
      const pngPath = pngFor(page.id);
      if (!pngPath) return null;
      return { ...page, pngPath };
    })
    .filter(Boolean);
}

function descriptionFromPage(page) {
  const w = page.words?.[0];
  const han = String(w?.chinese || "").trim();
  const py = String(w?.pinyin || "").trim();
  const en = String(w?.english || "").trim();
  const intro = `How to pronounce ${han}${py ? ` (${py})` : ""}${en ? ` — ${en}` : ""}. Listen in CN / TW / HK voices on GetPronounce.`;
  const tags =
    "#Chinese #Mandarin #pinyin #learnChinese #pronunciation #GetPronounce";
  return `${intro}\n\n${tags}`.slice(0, DESC_MAX);
}

function titleFromPage(page) {
  const w = page.words?.[0];
  const han = String(w?.chinese || "").trim();
  const py = String(w?.pinyin || "").trim();
  if (han && py) return `How to say ${han} (${py})`;
  return String(page.titleEn || page.id).trim().slice(0, 100);
}

function assertBrowserReady() {
  const res = spawnSync(
    "curl",
    ["-sf", "--max-time", "3", `${BROWSER_URL}/json/version`],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    throw new Error(`Chrome not ready at ${BROWSER_URL} (:9224)`);
  }
}

function runUpload(opts) {
  const args = [
    UPLOAD_PIN,
    "--media",
    opts.media,
    "--title",
    opts.title,
    "--description",
    opts.description,
    "--link",
    opts.link,
    "--topic",
    opts.topic,
    "--alt",
    opts.alt,
    "--board",
    opts.board,
    "--browser-url",
    BROWSER_URL,
    "--locale",
    "www",
    "--timeout",
    String(ATTEMPT_TIMEOUT_MS),
  ];
  if (opts.dryRun) args.push("--dry-run");
  const r = spawnSync(process.execPath, args, {
    encoding: "utf8",
    cwd: path.dirname(UPLOAD_PIN),
    env: process.env,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status !== 0) throw new Error(out || `upload failed exit=${r.status}`);
  return out;
}

async function main() {
  const { count, id, dryRun, board } = parseArgs(process.argv.slice(2));

  const allowSingleWordPin =
    process.env.PRONOUNCE_PIN_ALLOW_SINGLE_WORD === "1" ||
    process.argv.includes("--force-single-word");
  if (!allowSingleWordPin) {
    console.error(`
BLOCKED: pronounce single-word pins are NOT the global Pinterest pipeline.

Chinese (and other teach-lang) Pinterest uses the same rule as es/fr/de:
  1) yarn global:gen-zh   (TOPICS from generate-global-lang-en-samples.ts)
  2) yarn global:publish-pins → enrich → deploy
  3) node scripts/pin-global-lang-samples.mjs --board "Chinese words"

Destination: https://global.kajakorean.com/pin/{topic}__zh?utm_...
NOT getpronounce.net/words/{slug} single-word cards.

To override (debug only): PRONOUNCE_PIN_ALLOW_SINGLE_WORD=1 or --force-single-word
`);
    process.exit(1);
  }

  if (!fs.existsSync(UPLOAD_PIN) && !dryRun) {
    throw new Error(`upload-pin not found: ${UPLOAD_PIN}`);
  }
  if (!dryRun) assertBrowserReady();

  const pinned = loadJson(PINNED, {});
  const ready = listCatalogReady();
  const ttsReady = ready.filter((p) => pageHasTts(p));

  let pool = id
    ? ready.filter((p) => p.id === id)
    : ttsReady.filter((p) => !pinned[p.id]);

  if (id && !pool.length) {
    throw new Error(`id not in catalog or missing PNG: ${id}`);
  }
  if (!id) {
    shuffleInPlace(pool);
    pool = pool.slice(0, count);
  }

  console.log(
    `==> GetPronounce Pinterest: ${pool.length} of ${ttsReady.length} TTS-ready`,
  );
  console.log(
    `    site=${PRONOUNCE_SITE} board=${board} dryRun=${dryRun} liveCheck=${SKIP_LIVE_CHECK ? "off" : "on"}`,
  );

  if (!pool.length) {
    console.log("nothing to pin — gen + publish + enrich + deploy first");
    return;
  }

  if (!dryRun && fs.existsSync(DELETE_DRAFTS)) {
    spawnSync(
      process.execPath,
      [
        DELETE_DRAFTS,
        "--browser-url",
        BROWSER_URL,
        "--min-count",
        String(DRAFT_MIN_COUNT),
      ],
      { encoding: "utf8", timeout: 180_000 },
    );
  }

  fs.mkdirSync(PIN_OPT_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < pool.length; i++) {
    const page = pool[i];
    const link = pinUrl(page);

    if (!pageHasTts(page)) {
      console.error(`→ ${page.id} need CN female+male TTS (yarn pronounce:enrich)`);
      fail++;
      continue;
    }

    if (!SKIP_LIVE_CHECK && !dryRun) {
      const live =
        LIVE_WAIT_MS > 0
          ? await waitLivePinPage(page, LIVE_WAIT_MS)
          : await isLivePinPage(page);
      if (!live) {
        console.error(`→ ${page.id} not live ${liveUrl(page)}`);
        fail++;
        continue;
      }
    }

    const title = titleFromPage(page);
    const description = descriptionFromPage(page);
    console.log(`→ [${i + 1}/${pool.length}] ${page.id}`);
    console.log(`   link: ${link}`);

    let media = page.pngPath;
    try {
      const outPath = optimizedPinPath(page.pngPath, PIN_OPT_DIR);
      const opt = await optimizePinterestPin(page.pngPath, outPath);
      media = opt?.path || outPath || page.pngPath;
    } catch (e) {
      console.warn(`   optimize skip: ${e.message || e}`);
    }

    if (dryRun) {
      ok++;
      continue;
    }

    let uploaded = false;
    let lastErr = "";
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        runUpload({
          media,
          title,
          description,
          link,
          topic: page.topicSlug || "chinese",
          alt: title,
          board,
          dryRun: false,
        });
        uploaded = true;
        break;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        if (attempt < MAX_RETRIES) await sleep(5000);
      }
    }

    if (!uploaded) {
      fail++;
      continue;
    }

    pinned[page.id] = { at: new Date().toISOString(), link, board, title };
    saveJson(PINNED, pinned);
    ok++;

    if (i < pool.length - 1) {
      await sleep(nextDelaySec() * 1000);
    }
  }

  console.log(`==> done ok=${ok} fail=${fail}`);
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
