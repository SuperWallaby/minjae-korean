#!/usr/bin/env node
/**
 * EigoChart Pinterest — SEO page first, pin second.
 *
 * Destination is always the live pin page (100% site, never affiliate):
 *   {JA_SITE}/pin/{id}?utm_source=pinterest&utm_campaign=eigochart-pin
 * Never homepage, Preply, italki, or Amazon. Skip if catalog TTS (US/UK/AU)
 * is missing or URL is not 200.
 *
 *   yarn ja:pin --count 4
 *   yarn ja:pin --dry-run
 *   yarn ja:pin --id 14_greetings__en-ja
 *
 * Chrome: Eigopin Pinterest profile on :9226
 *   bash scripts/launch-chrome-pinterest-eigopin.sh
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
import {
  buildJaEnDedupContext,
  shouldSkipJaEnTopicSync,
} from "./lib/ja-en-topic-similarity.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLISHED = path.join(ROOT, "src", "data", "jaPins", "published.json");
const PNG_DIR = path.join(ROOT, "public", "ja", "pins");
const TMP = path.join(ROOT, ".tmp", "ja-en-samples");
const PIN_OPT_DIR = path.join(TMP, "pin-optimized");
const PINNED = path.join(TMP, "pinterest-pinned.json");
const FAILED = path.join(TMP, "pinterest-failed.json");
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);
const DELETE_DRAFTS = path.join(path.dirname(UPLOAD_PIN), "delete-drafts.mjs");
/** Clear Pinterest drafts when backlog ≥ this (same rule as Korean/global pin). */
const DRAFT_MIN_COUNT = Math.max(
  1,
  Number(process.env.PINTEREST_DRAFT_MIN_COUNT ?? 50) || 50,
);

const BROWSER_URL =
  process.env.CHROME_PINTEREST_EIGOPIN_DEBUG_URL ||
  "http://127.0.0.1:9226";
const JA_SITE = (
  process.env.NEXT_PUBLIC_JA_SITE_ORIGIN ||
  process.env.EIGOCHART_SITE_URL ||
  "https://eigopin.com"
).replace(/\/+$/, "");
const SKIP_LIVE_CHECK =
  process.env.JA_PIN_SKIP_LIVE_CHECK === "1" ||
  process.argv.includes("--skip-live-check");
const LIVE_WAIT_MS = Math.max(
  0,
  Number(process.env.JA_PIN_LIVE_WAIT_MS || 180_000) || 180_000,
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
const DEFAULT_BOARD = process.env.PINTEREST_BOARD_NAME || "エイゴピン";

function parseArgs(argv) {
  let count = 4;
  let id = "";
  let ids = [];
  let dryRun = false;
  let catchUp = false;
  let board = DEFAULT_BOARD;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--catch-up" || a === "--retry") catchUp = true;
    else if (a === "--skip-live-check") {
      /* flag */
    } else if (a === "--count" && argv[i + 1])
      count = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a.startsWith("--count="))
      count = Math.max(1, parseInt(a.slice(8), 10) || 4);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--ids" && argv[i + 1])
      ids = String(argv[++i])
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a.startsWith("--ids="))
      ids = a
        .slice(6)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    else if (a === "--board" && argv[i + 1]) board = argv[++i];
    else if (a.startsWith("--board=")) board = a.slice(8);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 4);
  }
  return { count, id, ids, dryRun, catchUp, board: String(board || "").trim() };
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
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

/** Catalog SEO flag — sitemap/home index only after a successful Pinterest upload. */
function markCatalogPinterestPinned(id, atIso) {
  try {
    if (!fs.existsSync(PUBLISHED)) return;
    const cat = JSON.parse(fs.readFileSync(PUBLISHED, "utf8"));
    const pages = cat.pages || [];
    const row = pages.find((p) => p.id === id);
    if (!row) return;
    if (row.pinterestPinnedAt) return;
    row.pinterestPinnedAt = atIso || new Date().toISOString();
    cat.generatedAt = new Date().toISOString();
    fs.writeFileSync(PUBLISHED, JSON.stringify(cat, null, 2) + "\n");
    console.log(`   catalog SEO public: ${id}`);
  } catch (e) {
    console.warn(`   catalog pin mark skip: ${e.message || e}`);
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function nextUploadDelaySec() {
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

function hasAllAccents(item) {
  const us = String(item?.ttsUs || item?.ttsUrl || "").trim();
  const uk = String(item?.ttsUk || "").trim();
  const au = String(item?.ttsAu || "").trim();
  return Boolean(us && uk && au);
}

function pageHasTts(page) {
  const words = page?.words || [];
  if (!words.length) return false;
  return words.every((w) => {
    const en = String(w.english || w.english || "").trim();
    return !en || hasAllAccents(w);
  });
}

function assertSiteOnlyPinLink(link) {
  let u;
  try {
    u = new URL(link);
  } catch {
    throw new Error(`invalid pin destination: ${link}`);
  }
  const expected = new URL(JA_SITE);
  const hostOk =
    u.hostname === expected.hostname ||
    u.hostname === `www.${expected.hostname}`;
  const affiliate =
    /preply|italki|amazon\.|amzn\.|sjv\.io|impact\.com/i.test(u.href);
  if (!hostOk || affiliate || !u.pathname.startsWith("/pin/")) {
    throw new Error(
      `Eigopin pins must go to ${JA_SITE}/pin/{id} — refused ${link}`,
    );
  }
}

function pinUrl(id) {
  const u = new URL(`/pin/${encodeURIComponent(id)}`, `${JA_SITE}/`);
  u.searchParams.set("utm_source", "pinterest");
  u.searchParams.set("utm_campaign", "eigochart-pin");
  const href = u.toString();
  assertSiteOnlyPinLink(href);
  return href;
}

function liveUrl(id) {
  return `${JA_SITE}/pin/${encodeURIComponent(id)}`;
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
    if (head.status === 405 || head.status === 403 || head.status === 404) {
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
  const lines = words.slice(0, 8).map((w) => {
    const en = String(w.english || w.english || "").trim();
    const ja = String(w.ja || "").trim();
    if (!en) return "";
    if (ja) return `${en} — ${ja}`;
    return en;
  }).filter(Boolean);
  const tags = "#英単語 #英語学習 #英語 #リスニング #アメリカ英語 #イギリス英語";
  const intro = `${page.titleJa || "英単語チャート"}。サイトで米・英・豪の発音を聞けます。`;
  let body = lines.join("\n");
  const budget = DESC_MAX - intro.length - tags.length - 8;
  if (body.length > budget) body = `${body.slice(0, Math.max(0, budget - 1)).trim()}…`;
  return `${intro}\n${body}\n\n${tags}`.slice(0, DESC_MAX);
}

function looksJapanese(s) {
  return /[\u3040-\u30ff\u4e00-\u9fff]/.test(String(s || ""));
}

function titleFromPage(page) {
  const ja = String(page.titleJa || "").trim();
  if (looksJapanese(ja)) return ja.slice(0, 100);
  const wrap = {
    "See you tomorrow.": "また明日ね",
    "hot vs cold": "反対の言葉 hot vs cold",
    "sun + flower = sunflower": "複合語 sunflower",
    "am / is / are": "文法 am / is / are",
    "say vs tell": "まぎらわしい英語 say vs tell",
  };
  if (wrap[ja]) return wrap[ja].slice(0, 100);
  const gloss = String(page.words?.[0]?.ja || "").trim();
  const en = ja || String(page.titleEn || page.id).trim();
  return (gloss ? `${gloss} — ${en}` : en).slice(0, 100);
}

function assertBrowserReady() {
  const res = spawnSync(
    "curl",
    ["-sf", "--max-time", "3", `${BROWSER_URL}/json/version`],
    { encoding: "utf8" },
  );
  if (res.status !== 0) {
    throw new Error(
      `Chrome not ready at ${BROWSER_URL} — run yarn ja:chrome and log in`,
    );
  }
}

function runUpload({ media, title, description, link, topic, alt, board, dryRun }) {
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
    process.env.PINTEREST_JA_LOCALE || "jp",
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
  const topicCtx = buildJaEnDedupContext(TMP);
  const ready = listCatalogReady();
  const ttsReady = ready.filter((p) => pageHasTts(p));

  /** Catch-up = every published pin missing from pinterest-pinned.json (never omit). */
  if (catchUp && !ids.length && !id) {
    const backlog = ready
      .filter((p) => !pinned[p.id])
      .map((p) => p.id);
    if (!backlog.length) {
      console.log("catch-up: nothing pending — all published pins are on Pinterest");
      return;
    }
    console.log(
      `==> catch-up: ${backlog.length} published but not pinned (will not skip)`,
    );
    ids.push(...backlog);
  }

  const idList = ids.length ? ids : id ? [id] : [];
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
    // Preserve catch-up / explicit order — never shuffle away failed retries.
    pool = idList.map((x) => pool.find((p) => p.id === x)).filter(Boolean);
  } else {
    shuffleInPlace(pool);
  }
  if (!idList.length) {
    pool = pool.filter((page) => {
      const gate = shouldSkipJaEnTopicSync(
        page.id,
        page.titleJa,
        page.titleEn,
        topicCtx,
      );
      if (gate.skip) {
        console.log(`    skip ${page.id} — ${gate.reason}`);
        return false;
      }
      return true;
    });
  }
  const candidates = idList.length ? pool : pool.slice(0, count);

  console.log(
    `==> EigoChart Pinterest: ${candidates.length} of ${ttsReady.length} TTS-ready (catalog ${ready.length}) site=${JA_SITE}`,
  );
  console.log(
    `    liveCheck=${SKIP_LIVE_CHECK ? "off" : "on"} dryRun=${dryRun} board=${board}`,
  );

  if (!candidates.length) {
    console.log("nothing to pin — publish + enrich US/UK/AU TTS, then deploy until /pin/{id} is 200");
    return;
  }

  if (!dryRun && fs.existsSync(DELETE_DRAFTS)) {
    console.log(
      `    draft cleanup if ≥${DRAFT_MIN_COUNT} (browser=${BROWSER_URL})`,
    );
    const dr = spawnSync(
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
    if (dr.stderr) process.stderr.write(dr.stderr);
    if (dr.stdout) process.stdout.write(dr.stdout);
    if (dr.status !== 0) {
      console.error("    WARN draft cleanup failed — continuing upload");
    }
  }

  let ok = 0;
  let fail = 0;
  let skippedNotLive = 0;

  for (let i = 0; i < candidates.length; i++) {
    const page = candidates[i];
    // Explicit / catch-up ids: never topic-skip — upload is non-optional.
    if (!idList.length) {
      topicCtx.pinned = loadJson(PINNED, {});
      const dup = shouldSkipJaEnTopicSync(
        page.id,
        page.titleJa,
        page.titleEn,
        topicCtx,
      );
      if (dup.skip) {
        console.log(
          `→ [${i + 1}/${candidates.length}] ${page.id} skip: ${dup.reason}`,
        );
        fail++;
        continue;
      }
    }
    const link = pinUrl(page.id);

    if (!pageHasTts(page)) {
      console.error(
        `→ [${i + 1}/${candidates.length}] ${page.id} need US+UK+AU TTS (yarn ja:enrich) — will retry later`,
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
          `→ [${i + 1}/${candidates.length}] ${page.id} not live ${liveUrl(page.id)} — will retry later`,
        );
        markFailed(page.id, "not live");
        skippedNotLive++;
        fail++;
        continue;
      }
    }

    const title = titleFromPage(page);
    const description = descriptionFromPage(page);
    const alt = `${page.titleJa} — 英単語チャート`;
    console.log(`→ [${i + 1}/${candidates.length}] ${page.id}`);
    console.log(`   title: ${title}`);
    console.log(`   link: ${link}`);

    const optPath = optimizedPinPath(page.pngPath, PIN_OPT_DIR);
    let mediaPath = page.pngPath;
    try {
      const opt = await optimizePinterestPin(page.pngPath, optPath);
      mediaPath = opt.path;
      console.log(
        `   media: ${opt.width}×${opt.height} jpeg ${opt.outputKb}KB`,
      );
    } catch (e) {
      console.warn(`   optimize skip: ${e.message || e}`);
    }

    if (dryRun) {
      console.log("   dry-run OK");
      ok++;
      continue;
    }

    let lastErr = null;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      try {
        const out = runUpload({
          media: mediaPath,
          title,
          description,
          link,
          topic: "",
          alt,
          board,
          dryRun: false,
        });
        console.log(`  ${out}`);
        pinned[page.id] = { at: new Date().toISOString(), title, board, link };
        saveJson(PINNED, pinned);
        markCatalogPinterestPinned(page.id, pinned[page.id].at);
        clearFailed(page.id);
        ok++;
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.error(`   fail: ${e.message || e}`);
        if (attempt <= MAX_RETRIES) await sleep(3000);
      }
    }
    if (lastErr) {
      markFailed(page.id, lastErr.message || lastErr);
      fail++;
    }
    if (i < candidates.length - 1 && !dryRun) {
      const wait = nextUploadDelaySec();
      console.log(`  wait ${wait}s…`);
      await sleep(wait * 1000);
    }
  }

  console.log(
    `done: ok=${ok} failed=${fail}${skippedNotLive ? ` (not-live=${skippedNotLive})` : ""}`,
  );
  if (fail) {
    console.error(
      `pending retries remain in catalog — run: yarn ja:pin:catchup`,
    );
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
