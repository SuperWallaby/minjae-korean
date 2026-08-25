#!/usr/bin/env node
/**
 * Global Pinterest (Account B / multilingual Chrome :9224) → EigoSound.
 *
 * Destination is ALWAYS the live sound pin page (never homepage / affiliate):
 *   https://sound.eigopin.com/pin/{id}?utm_source=pinterest&utm_campaign=eigosound-pin
 *
 *   yarn sound:pin --count 4
 *   yarn sound:pin --dry-run
 *   yarn sound:pin --id en_upgrade__filthy
 *   yarn sound:pin --catch-up
 *
 * Requires: chrome-pinterest-multilingual logged in on :9224
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLISHED = path.join(ROOT, "src", "data", "soundPins", "published.json");
const PNG_DIR = path.join(ROOT, "public", "sound", "pins");
const TMP = path.join(ROOT, ".tmp", "en-en-samples");
const PIN_OPT_DIR = path.join(TMP, "pin-optimized");
const PINNED = path.join(TMP, "pinterest-pinned.json");
const FAILED = path.join(TMP, "pinterest-failed.json");
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);

const BROWSER_URL =
  process.env.CHROME_PINTEREST_ML_DEBUG_URL ||
  process.env.CHROME_GLOBAL_DEBUG_URL ||
  "http://127.0.0.1:9224";

const SOUND_SITE = (
  process.env.NEXT_PUBLIC_SOUND_SITE_ORIGIN ||
  process.env.SOUND_SITE_URL ||
  "https://sound.eigopin.com"
).replace(/\/+$/, "");

const SKIP_LIVE_CHECK =
  process.env.SOUND_PIN_SKIP_LIVE_CHECK === "1" ||
  process.argv.includes("--skip-live-check");
const LIVE_WAIT_MS = Math.max(
  0,
  Number(process.env.SOUND_PIN_LIVE_WAIT_MS || 180_000) || 180_000,
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
  process.env.PINTEREST_SOUND_BOARD_NAME ||
  process.env.PINTEREST_BOARD_NAME ||
  "English words";

function parseArgs(argv) {
  let count = 4;
  let id = "";
  const ids = [];
  let dryRun = false;
  let catchUp = false;
  let board = DEFAULT_BOARD;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--catch-up" || a === "--retry") catchUp = true;
    else if (a === "--skip-live-check") {
      /* handled via SKIP_LIVE_CHECK */
    } else if (a === "--count" && argv[i + 1])
      count = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a.startsWith("--count="))
      count = Math.max(1, parseInt(a.slice(8), 10) || 4);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--ids" && argv[i + 1]) {
      ids.push(
        ...String(argv[++i])
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (a.startsWith("--ids=")) {
      ids.push(
        ...a
          .slice(6)
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      );
    } else if (a === "--board" && argv[i + 1]) board = argv[++i];
    else if (a.startsWith("--board=")) board = a.slice(8);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 4);
  }
  return {
    count,
    id,
    ids,
    dryRun,
    catchUp,
    board: String(board || "").trim(),
  };
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
  return arr;
}

function itemHasVoices(item) {
  const female = String(item?.ttsFemale || item?.ttsUrl || "").trim();
  const male = String(item?.ttsMale || "").trim();
  return Boolean(female && male);
}

function pageHasTts(page) {
  const words = page?.words || [];
  if (!words.length) return false;
  return words.every(
    (w) => !String(w.english || "").trim() || itemHasVoices(w),
  );
}

function assertSiteOnlyPinLink(link) {
  let u;
  try {
    u = new URL(link);
  } catch {
    throw new Error(`invalid pin destination: ${link}`);
  }
  const expected = new URL(SOUND_SITE);
  const hostOk =
    u.hostname === expected.hostname ||
    u.hostname === `www.${expected.hostname}`;
  const affiliate =
    /preply|italki|amazon\.|amzn\.|sjv\.io|impact\.com|kajakorean/i.test(
      u.href,
    );
  if (!hostOk || affiliate || !u.pathname.startsWith("/pin/")) {
    throw new Error(
      `EigoSound pins must go to ${SOUND_SITE}/pin/{id} — refused ${link}`,
    );
  }
}

function pinUrl(id) {
  const u = new URL(`/pin/${encodeURIComponent(id)}`, `${SOUND_SITE}/`);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_campaign", "eigosound-pin");
  const href = u.toString();
  assertSiteOnlyPinLink(href);
  return href;
}

function liveUrl(id) {
  return `${SOUND_SITE}/pin/${encodeURIComponent(id)}`;
}

async function isLivePinPage(id) {
  const url = liveUrl(id);
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

async function waitLivePinPage(id, waitMs) {
  if (await isLivePinPage(id)) return true;
  const deadline = Date.now() + waitMs;
  while (Date.now() < deadline) {
    await sleep(12_000);
    if (await isLivePinPage(id)) return true;
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
  const words = Array.isArray(page.words) ? page.words : [];
  const lines = words
    .slice(0, 10)
    .map((w) => {
      const en = String(w.english || "").trim();
      const gloss = String(w.gloss || "").trim();
      if (!en) return "";
      return gloss ? `${en} — ${gloss}` : en;
    })
    .filter(Boolean);
  const tags =
    "#English #vocabulary #pronunciation #ESL #learnEnglish #EigoSound";
  const intro = `${page.titleEn || "English chart"}. Listen in female & male voices on the site.`;
  let body = lines.join("\n");
  const budget = DESC_MAX - intro.length - tags.length - 8;
  if (body.length > budget) {
    body = `${body.slice(0, Math.max(0, budget - 1)).trim()}…`;
  }
  return `${intro}\n${body}\n\n${tags}`.slice(0, DESC_MAX);
}

function titleFromPage(page) {
  return String(page.titleEn || page.id)
    .trim()
    .slice(0, 100);
}

function assertBrowserReady() {
  const res = spawnSync(
    "curl",
    ["-sf", "--max-time", "3", `${BROWSER_URL}/json/version`],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    throw new Error(
      `Chrome not ready at ${BROWSER_URL} — launch multilingual Pinterest Chrome (:9224)`,
    );
  }
}

function runUpload({
  media,
  title,
  description,
  link,
  topic,
  alt,
  board,
  dryRun,
}) {
  const args = [
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
    topic,
    "--alt",
    alt,
    "--board",
    board,
    "--browser-url",
    BROWSER_URL,
    "--locale",
    "www",
    "--timeout",
    String(ATTEMPT_TIMEOUT_MS),
  ];
  if (dryRun) args.push("--dry-run");
  const r = spawnSync(process.execPath, args, {
    encoding: "utf8",
    cwd: path.dirname(UPLOAD_PIN),
    env: process.env,
  });
  const out = `${r.stdout || ""}${r.stderr || ""}`.trim();
  if (r.status !== 0) {
    throw new Error(out || `upload failed exit=${r.status}`);
  }
  return out;
}

function markCatalogPinned(id, atIso) {
  try {
    if (!fs.existsSync(PUBLISHED)) return;
    const cat = JSON.parse(fs.readFileSync(PUBLISHED, "utf8"));
    const row = (cat.pages || []).find((p) => p.id === id);
    if (!row || row.pinterestPinnedAt) return;
    row.pinterestPinnedAt = atIso || new Date().toISOString();
    cat.generatedAt = new Date().toISOString();
    fs.writeFileSync(PUBLISHED, JSON.stringify(cat, null, 2) + "\n");
    console.log(`   catalog marked pinned: ${id}`);
  } catch (e) {
    console.warn(`   catalog pin mark skip: ${e.message || e}`);
  }
}

function markFailed(id, error) {
  const failed = loadJson(FAILED, {});
  failed[id] = {
    at: new Date().toISOString(),
    error: String(error || "upload failed").slice(0, 500),
  };
  saveJson(FAILED, failed);
}

function clearFailed(id) {
  const failed = loadJson(FAILED, {});
  if (!failed[id]) return;
  delete failed[id];
  saveJson(FAILED, failed);
}

async function main() {
  const { count, id, ids, dryRun, catchUp, board } = parseArgs(
    process.argv.slice(2),
  );
  if (!fs.existsSync(UPLOAD_PIN) && !dryRun) {
    throw new Error(`upload-pin not found: ${UPLOAD_PIN}`);
  }
  if (!dryRun) assertBrowserReady();

  const pinned = loadJson(PINNED, {});
  const ready = listCatalogReady();
  const ttsReady = ready.filter((p) => pageHasTts(p));

  const idList = [...ids];
  if (id) idList.push(id);

  if (catchUp && !idList.length) {
    const backlog = ready.filter((p) => !pinned[p.id]).map((p) => p.id);
    if (!backlog.length) {
      console.log("catch-up: nothing pending");
      return;
    }
    console.log(`==> catch-up: ${backlog.length} published but not pinned`);
    idList.push(...backlog);
  }

  let pool = idList.length
    ? ready.filter((p) => idList.includes(p.id))
    : ttsReady.filter((p) => !pinned[p.id]);

  if (idList.length) {
    const have = new Set(pool.map((p) => p.id));
    const missing = idList.filter((x) => !have.has(x));
    if (missing.length) {
      throw new Error(
        `id not in published.json or missing PNG: ${missing.join(",")}`,
      );
    }
    pool = idList.map((x) => pool.find((p) => p.id === x)).filter(Boolean);
  } else {
    shuffleInPlace(pool);
    pool = pool.slice(0, count);
  }

  console.log(
    `==> EigoSound Pinterest (Account B): ${pool.length} of ${ttsReady.length} TTS-ready (catalog ${ready.length})`,
  );
  console.log(
    `    site=${SOUND_SITE} browser=${BROWSER_URL} board=${board} dryRun=${dryRun} liveCheck=${SKIP_LIVE_CHECK ? "off" : "on"}`,
  );

  if (!pool.length) {
    console.log(
      "nothing to pin — publish + enrich female/male TTS, deploy until /pin/{id} is 200",
    );
    return;
  }

  fs.mkdirSync(PIN_OPT_DIR, { recursive: true });
  let ok = 0;
  let fail = 0;

  for (let i = 0; i < pool.length; i++) {
    const page = pool[i];
    const link = pinUrl(page.id);

    if (!pageHasTts(page) && !idList.length) {
      console.error(
        `→ [${i + 1}/${pool.length}] ${page.id} need female+male TTS (yarn sound:enrich)`,
      );
      markFailed(page.id, "missing TTS");
      fail++;
      continue;
    }

    if (!SKIP_LIVE_CHECK && !dryRun) {
      const live =
        LIVE_WAIT_MS > 0
          ? await waitLivePinPage(page.id, LIVE_WAIT_MS)
          : await isLivePinPage(page.id);
      if (!live) {
        console.error(
          `→ [${i + 1}/${pool.length}] ${page.id} not live ${liveUrl(page.id)}`,
        );
        markFailed(page.id, "not live");
        fail++;
        continue;
      }
    }

    const title = titleFromPage(page);
    const description = descriptionFromPage(page);
    const alt = `${page.titleEn} — English pronunciation chart`;
    console.log(`→ [${i + 1}/${pool.length}] ${page.id}`);
    console.log(`   title: ${title}`);
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
      console.log("   dry-run OK");
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
          topic: page.topicSlug || page.format || "english",
          alt,
          board,
          dryRun: false,
        });
        uploaded = true;
        break;
      } catch (e) {
        lastErr = e instanceof Error ? e.message : String(e);
        console.warn(
          `   attempt ${attempt + 1} fail: ${lastErr.slice(0, 200)}`,
        );
        if (attempt < MAX_RETRIES) await sleep(5000);
      }
    }

    if (!uploaded) {
      markFailed(page.id, lastErr);
      fail++;
      continue;
    }

    const at = new Date().toISOString();
    pinned[page.id] = { at, link, board, title };
    saveJson(PINNED, pinned);
    clearFailed(page.id);
    markCatalogPinned(page.id, at);
    ok++;

    if (i < pool.length - 1) {
      const sec = nextDelaySec();
      console.log(`   wait ${sec}s`);
      await sleep(sec * 1000);
    }
  }

  console.log(`==> done ok=${ok} fail=${fail}`);
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
