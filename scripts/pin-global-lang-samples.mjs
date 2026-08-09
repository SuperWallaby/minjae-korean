#!/usr/bin/env node
/**
 * Global Pinterest (Account B / multilingual Chrome :9224).
 * Pins teach TARGET lang via English → destination = global.kajakorean.com/pin/{id}
 * Affiliate is only reached via the on-site /go/preply|italki hop (never pin link).
 *
 *   node scripts/pin-global-lang-samples.mjs --count 4
 *   node scripts/pin-global-lang-samples.mjs --dry-run
 *   node scripts/pin-global-lang-samples.mjs --id 01_eye-colors__es
 *
 * Requires: Chrome profile chrome-pinterest-multilingual logged in on :9224
 *   auto-video-korean/scripts/launch-chrome-pinterest-multilingual.sh
 *
 * Boards: one board named by language (e.g. "Spanish vocabulary") unless
 * PINTEREST_BOARD_NAME / --board is set (shared board).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  optimizePinterestPin,
  optimizedPinPath,
} from "./lib/optimize-pinterest-pin.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "global-lang-en-samples");
const PIN_OPT_DIR = path.join(OUT, "pin-optimized");
const PINNED = path.join(OUT, "pinterest-pinned.json");
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);

const BROWSER_URL =
  process.env.CHROME_PINTEREST_ML_DEBUG_URL ||
  process.env.CHROME_GLOBAL_DEBUG_URL ||
  "http://127.0.0.1:9224";
/** Pinterest destination — never affiliate direct; hop via global site content pages. */
const GLOBAL_SITE = (
  process.env.GLOBAL_SITE_URL || "https://global.kajakorean.com"
).replace(/\/+$/, "");

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
const WORD_EMOJIS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚪", "🟤", "⬛"];

function parseArgs(argv) {
  let count = 4;
  let id = "";
  let dryRun = false;
  let board = process.env.PINTEREST_BOARD_NAME || "";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--count" && argv[i + 1])
      count = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a.startsWith("--count="))
      count = Math.max(1, parseInt(a.slice(8), 10) || 4);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--board" && argv[i + 1]) board = argv[++i];
    else if (a.startsWith("--board=")) board = a.slice(8);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 4);
  }
  return { count, id, dryRun, board: board.trim() };
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

function nextUploadDelaySec() {
  const lo = Math.floor(DELAY_MIN_SEC);
  const hi = Math.floor(DELAY_MAX_SEC);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function listReady() {
  if (!fs.existsSync(OUT)) return [];
  return fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith(".json") && !f.includes("pinned"))
    .map((f) => {
      const meta = loadJson(path.join(OUT, f), null);
      if (!meta?.id) return null;
      const png = path.join(OUT, `${meta.id}.png`);
      if (!fs.existsSync(png)) return null;
      return { ...meta, pngPath: png };
    })
    .filter(Boolean)
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

function boardFor(meta, forcedBoard) {
  if (forcedBoard) return forcedBoard;
  const name = String(meta.langName || meta.lang || "Language").trim();
  return `${name} vocabulary`;
}

function topicFor(meta) {
  const name = String(meta.langName || meta.lang || "language").trim();
  return `${name} language`;
}

function affiliateLink(meta) {
  // Pinterest destination = global site pin page (affiliate only via /go/*)
  const id = String(meta.id || "").trim();
  if (!id) return { url: GLOBAL_SITE, partner: "site" };
  try {
    const u = new URL(`/pin/${encodeURIComponent(id)}`, GLOBAL_SITE);
    u.searchParams.set("utm_source", "pinterest");
    u.searchParams.set("utm_campaign", "global-lang-pin");
    return { url: u.toString(), partner: "site" };
  } catch {
    return {
      url: `${GLOBAL_SITE}/pin/${encodeURIComponent(id)}`,
      partner: "site",
    };
  }
}

function descriptionFromMeta(meta) {
  const words = Array.isArray(meta.words) ? meta.words : [];
  const lines = words
    .slice(0, 10)
    .map((w, i) => {
      const eng = String(w.english || "").trim();
      const tgt = String(w.target || "").trim();
      const rom = String(w.romanization || "").trim();
      if (!eng && !tgt) return "";
      const emoji = WORD_EMOJIS[i % WORD_EMOJIS.length];
      if (eng && tgt && rom) return `${emoji} ${eng} — ${tgt} [${rom}]`;
      if (eng && tgt) return `${emoji} ${eng} — ${tgt}`;
      return `${emoji} ${tgt || eng}`;
    })
    .filter(Boolean);

  const tags = [
    "#learnspanish",
    "#languagelearning",
    "#vocabulary",
    `#${String(meta.langName || "lang").toLowerCase().replace(/\s+/g, "")}`,
  ];
  // Tag match language
  const langTagMap = {
    es: "#learnspanish",
    fr: "#learnfrench",
    de: "#learngerman",
    ja: "#learnjapanese",
    it: "#learnitalian",
    ar: "#learnarabic",
  };
  tags[0] = langTagMap[meta.lang] || tags[0];

  let body = lines.join(" / ");
  const budget = DESC_MAX - tags.join(" ").length - 8;
  if (body.length > budget) body = `${body.slice(0, budget - 1).trim()}…`;
  return `${body}\n\n${tags.join(" ")}`.slice(0, DESC_MAX);
}

function titleFromMeta(meta) {
  const t = String(meta.titleEn || "").trim();
  if (t) return t.slice(0, 100);
  return `${meta.langName || "Language"} vocabulary`.slice(0, 100);
}

function altFromMeta(meta) {
  const t = String(meta.titleEn || meta.langName || "vocabulary chart")
    .trim()
    .slice(0, 80);
  return `${t} — vocab chart`;
}

function assertBrowserReady() {
  try {
    const res = spawnSync(
      "curl",
      ["-sf", "--max-time", "3", `${BROWSER_URL}/json/version`],
      { encoding: "utf8" },
    );
    if (res.status !== 0) {
      throw new Error(
        `Chrome not ready at ${BROWSER_URL} — run launch-chrome-pinterest-multilingual.sh`,
      );
    }
  } catch (e) {
    throw new Error(e.message || String(e));
  }
}

function assertLoggedIn() {
  const res = spawnSync(
    "curl",
    ["-sf", "--max-time", "5", `${BROWSER_URL}/json/list`],
    { encoding: "utf8" },
  );
  if (res.status !== 0 || !res.stdout) {
    throw new Error(`cannot list tabs on ${BROWSER_URL}`);
  }
  let tabs;
  try {
    tabs = JSON.parse(res.stdout);
  } catch {
    throw new Error("bad CDP json/list");
  }
  const urls = (tabs || [])
    .filter((t) => t.type === "page")
    .map((t) => String(t.url || ""));
  const onlyLogin =
    urls.length > 0 &&
    urls.every(
      (u) =>
        /pinterest\.com\/login/i.test(u) ||
        /accounts\.google\.com/i.test(u) ||
        !u ||
        u === "about:blank",
    );
  if (onlyLogin) {
    throw new Error(
      `Account B still on login — open ${BROWSER_URL} Chrome (multilingual) and sign into Pinterest first`,
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
    const err = new Error(out || `upload failed exit=${r.status}`);
    err.out = out;
    throw err;
  }
  return out;
}

async function main() {
  const { count, id, dryRun, board: forcedBoard } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin not found: ${UPLOAD_PIN}`);
  }

  assertBrowserReady();
  if (!dryRun) assertLoggedIn();

  const pinned = loadJson(PINNED, {});
  const ready = listReady();
  let candidates = id
    ? ready.filter((m) => m.id === id)
    : ready.filter((m) => !pinned[m.id]);
  candidates = candidates.slice(0, count);

  console.log(
    `==> Global Pinterest (Account B): ${candidates.length} of ${ready.length} ready, ${Object.keys(pinned).length} already pinned`,
  );
  console.log(
    `    browser=${BROWSER_URL} delay=${DELAY_MIN_SEC}–${DELAY_MAX_SEC}s dryRun=${dryRun} board=${forcedBoard || "(per language)"}`,
  );

  if (!candidates.length) {
    console.log("nothing to pin");
    return;
  }

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < candidates.length; i++) {
    const meta = candidates[i];
    const title = titleFromMeta(meta);
    const description = descriptionFromMeta(meta);
    const alt = altFromMeta(meta);
    const topic = topicFor(meta);
    const boardName = boardFor(meta, forcedBoard);
    const { url: link, partner } = affiliateLink(meta);

    console.log(`→ [${i + 1}/${candidates.length}] ${meta.id}`);
    console.log(`   title: ${title}`);
    console.log(`   board: ${boardName}  topic: ${topic}`);
    console.log(`   link: ${link} (${partner})`);
    console.log(`   desc: ${description.slice(0, 120)}…`);

    const optPath = optimizedPinPath(meta.pngPath, PIN_OPT_DIR);
    let mediaPath = meta.pngPath;
    try {
      const opt = await optimizePinterestPin(meta.pngPath, optPath);
      mediaPath = opt.path;
      console.log(
        `   media: ${opt.width}×${opt.height} ${opt.kind} jpeg ${opt.outputKb}KB (from png ${opt.inputKb}KB)`,
      );
    } catch (e) {
      console.warn(`   optimize skip: ${e.message || e} — using png`);
    }

    if (dryRun) {
      console.log("   dry-run OK");
      ok++;
      continue;
    }

    let lastErr = null;
    for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
      console.log(`   attempt ${attempt}/${MAX_RETRIES + 1}`);
      try {
        const out = runUpload({
          media: mediaPath,
          title,
          description,
          link,
          topic,
          alt,
          board: boardName,
          dryRun: false,
        });
        console.log(`  ${out}`);
        pinned[meta.id] = {
          at: new Date().toISOString(),
          title,
          board: boardName,
          link,
          partner,
        };
        saveJson(PINNED, pinned);
        ok++;
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        console.error(`   fail: ${e.message || e}`);
        if (attempt <= MAX_RETRIES) await sleep(3000);
      }
    }
    if (lastErr) fail++;

    if (i < candidates.length - 1 && !dryRun) {
      const wait = nextUploadDelaySec();
      console.log(`  wait ${wait}s…`);
      await sleep(wait * 1000);
    }
  }

  console.log(`done: ok=${ok} failed=${fail}`);
  if (fail) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
