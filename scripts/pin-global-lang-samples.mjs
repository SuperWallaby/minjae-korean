#!/usr/bin/env node
/**
 * Global Pinterest (Account B / multilingual Chrome :9224).
 * Pins teach TARGET lang via English → destination:
 *   ~25% Preply/italki direct, rest → global site /pin/{id}
 *
 *   node scripts/pin-global-lang-samples.mjs --count 4
 *   node scripts/pin-global-lang-samples.mjs --dry-run
 *   node scripts/pin-global-lang-samples.mjs --id 01_eye-colors__es
 *
 * Requires: Chrome profile chrome-pinterest-multilingual logged in on :9224
 *   auto-video-korean/scripts/launch-chrome-pinterest-multilingual.sh
 *
 * Boards: one board named by language (e.g. "Spanish words") unless
 * PINTEREST_BOARD_NAME / --board is set (shared board).
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
const OUT = path.join(ROOT, ".tmp", "global-lang-en-samples");
const PIN_OPT_DIR = path.join(OUT, "pin-optimized");
const PINNED = path.join(OUT, "pinterest-pinned.json");
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);
const DELETE_DRAFTS = path.join(
  path.dirname(UPLOAD_PIN),
  "delete-drafts.mjs",
);
const DRAFT_MIN_COUNT = Math.max(
  1,
  Number(process.env.PINTEREST_DRAFT_MIN_COUNT ?? 50) || 50,
);

const BROWSER_URL =
  process.env.CHROME_PINTEREST_ML_DEBUG_URL ||
  process.env.CHROME_GLOBAL_DEBUG_URL ||
  "http://127.0.0.1:9224";
/** Pinterest destination — never affiliate direct; hop via global site content pages. */
// Canonical destination host (DNS may lag; pins use this ahead of time).
const GLOBAL_SITE = (
  process.env.GLOBAL_SITE_URL || "https://global.kajakorean.com"
).replace(/\/+$/, "");
const PREPLY =
  process.env.PINTEREST_AFFILIATE_PREPLY ||
  "https://preply.sjv.io/c/7574725/1987575/24422";
const ITALKI =
  process.env.PINTEREST_AFFILIATE_ITALKI ||
  "https://www.italki.com/en/affshare?ref=af33117569";
const AFFILIATE_RATE = Math.min(
  1,
  Math.max(0, Number(process.env.PINTEREST_AFFILIATE_RATE ?? 0.25) || 0),
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

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** topic slug from id like 01_eye-colors__es → eye-colors */
function topicKey(meta) {
  const id = String(meta?.id || "");
  const m = id.match(/^\d+_(.+)__[a-z]{2}$/i);
  if (m) return m[1];
  return meta?.topicSlug || id.split("__")[0] || "other";
}

function langKey(meta) {
  return String(meta?.lang || meta?.langName || "xx").toLowerCase();
}

/**
 * Pin upload order = random, NEVER generation/id sequence.
 * Round-robin languages so boards/topics don't get dumped in catalog order.
 */
function pickCandidatesRandom(metas, count) {
  const byLang = new Map();
  for (const m of metas) {
    const k = langKey(m);
    if (!byLang.has(k)) byLang.set(k, []);
    byLang.get(k).push(m);
  }

  const queues = new Map();
  for (const [lang, list] of byLang) {
    const byTopic = new Map();
    for (const m of list) {
      const t = topicKey(m);
      if (!byTopic.has(t)) byTopic.set(t, []);
      byTopic.get(t).push(m);
    }
    for (const tList of byTopic.values()) shuffleInPlace(tList);
    const topicKeys = shuffleInPlace([...byTopic.keys()]);
    const spread = [];
    while (true) {
      let hit = false;
      for (const t of topicKeys) {
        const tList = byTopic.get(t);
        if (tList?.length) {
          spread.push(tList.shift());
          hit = true;
        }
      }
      if (!hit) break;
    }
    queues.set(lang, spread);
  }

  const langs = shuffleInPlace([...queues.keys()]);
  const out = [];
  while (out.length < count) {
    let progressed = false;
    for (const k of langs) {
      const q = queues.get(k);
      if (q?.length) {
        out.push(q.shift());
        progressed = true;
        if (out.length >= count) break;
      }
    }
    if (!progressed) break;
  }
  return out;
}

function listReady() {
  if (!fs.existsSync(OUT)) return [];
  // Unsorted — pin order is decided only by pickCandidatesRandom().
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
    .filter(Boolean);
}

function boardFor(meta, forcedBoard) {
  if (forcedBoard) return forcedBoard;
  const name = String(meta.langName || meta.lang || "Language").trim();
  return `${name} words`;
}

function topicFor(meta) {
  const name = String(meta.langName || meta.lang || "language").trim();
  return `${name} language`;
}

function withUtm(url, campaign) {
  try {
    const u = new URL(url);
    if (!u.searchParams.get("utm_source"))
      u.searchParams.set("utm_source", "pinterest");
    if (!u.searchParams.get("utm_medium"))
      u.searchParams.set("utm_medium", "pin");
    if (!u.searchParams.get("utm_campaign"))
      u.searchParams.set("utm_campaign", campaign);
    return u.toString();
  } catch {
    return url;
  }
}

function affiliateLink(meta) {
  // ~25% direct Preply/italki; otherwise global site pin page
  if (AFFILIATE_RATE > 0 && Math.random() < AFFILIATE_RATE) {
    const usePreply = Math.random() < 0.5;
    const raw = usePreply ? PREPLY : ITALKI;
    return {
      url: withUtm(raw, usePreply ? "global-aff-preply" : "global-aff-italki"),
      partner: usePreply ? "preply" : "italki",
    };
  }
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

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function topicAndLang(meta) {
  const lang = String(meta.langName || meta.lang || "Language").trim();
  let topic = String(meta.titleEn || "").trim();
  const re = new RegExp(`\\s+in\\s+${lang.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
  topic = topic.replace(re, "").trim();
  if (!topic) topic = "words";
  return { topic, lang };
}

function descriptionFromMeta(meta) {
  const words = Array.isArray(meta.words) ? meta.words : [];
  const useEmoji = Math.random() < 0.7;
  const lines = words
    .slice(0, 10)
    .map((w, i) => {
      const eng = String(w.english || "").trim();
      const tgt = String(w.target || "").trim();
      const rom = String(w.romanization || "").trim();
      if (!eng && !tgt) return "";
      const emoji = useEmoji ? `${WORD_EMOJIS[i % WORD_EMOJIS.length]} ` : "";
      const style = Math.floor(Math.random() * 3);
      if (eng && tgt && rom) {
        if (style === 0) return `${emoji}${eng} — ${tgt} [${rom}]`;
        if (style === 1) return `${emoji}${tgt} (${rom}) = ${eng}`;
        return `${emoji}${eng}: ${tgt}`;
      }
      if (eng && tgt) return `${emoji}${eng} — ${tgt}`;
      return `${emoji}${tgt || eng}`;
    })
    .filter(Boolean);

  const langTagMap = {
    es: "#learnspanish",
    fr: "#learnfrench",
    de: "#learngerman",
    ja: "#learnjapanese",
    it: "#learnitalian",
    ar: "#learnarabic",
  };
  const langTag =
    langTagMap[meta.lang] ||
    `#learn${String(meta.langName || "lang")
      .toLowerCase()
      .replace(/\s+/g, "")}`;
  const tagPools = [
    [langTag, "#languagelearning", "#vocabulary"],
    [langTag, "#polyglot", "#wordsoftheday"],
    [langTag, "#studytok", "#languagelearning"],
    [langTag, "#vocabulary", `#${String(meta.langName || "lang").toLowerCase().replace(/\s+/g, "")}`],
  ];
  const tags = pickOne(tagPools);

  const intros = [
    "",
    "Save for later 👇",
    "Quick scan:",
    "Tap through these:",
    "Useful everyday words:",
  ];
  const outros = [
    "",
    "Which one will you use first?",
    "Practice saying them out loud.",
    "Screenshot + review later.",
  ];
  const intro = pickOne(intros);
  const outro = Math.random() < 0.45 ? pickOne(outros.filter(Boolean).concat("")) : "";
  const joiner = pickOne(["\n", "\n", " / ", " · "]);

  let body = lines.join(joiner);
  const head = intro ? `${intro}\n` : "";
  const tail = outro ? `\n${outro}` : "";
  const tagLine = tags.join(" ");
  const budget = DESC_MAX - head.length - tail.length - tagLine.length - 8;
  if (body.length > budget) body = `${body.slice(0, Math.max(0, budget - 1)).trim()}…`;
  return `${head}${body}${tail}\n\n${tagLine}`.slice(0, DESC_MAX);
}

function titleFromMeta(meta) {
  const { topic, lang } = topicAndLang(meta);
  const templates = [
    () => `${topic} in ${lang}`,
    () => `Everyday ${lang}: ${topic}`,
    () => `${lang} vocab — ${topic}`,
    () => `Learn ${topic.toLowerCase()} in ${lang}`,
    () => `Quick ${lang} words: ${topic}`,
    () => `${lang} starter: ${topic}`,
    () => `${topic}? Say it in ${lang}`,
    () => `Need ${topic.toLowerCase()} in ${lang}?`,
    () => `${lang} cheat sheet: ${topic}`,
  ];
  const raw = String(meta.titleEn || "").trim();
  // Sometimes keep catalog title as-is for natural mix.
  if (raw && Math.random() < 0.28) return raw.slice(0, 100);
  return pickOne(templates)().slice(0, 100);
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
  const {
    count,
    id,
    dryRun,
    board: forcedBoard,
  } = parseArgs(process.argv.slice(2));

  if (!fs.existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin not found: ${UPLOAD_PIN}`);
  }

  assertBrowserReady();
  if (!dryRun) assertLoggedIn();

  const pinned = loadJson(PINNED, {});
  const ready = listReady();
  const unpinned = id
    ? ready.filter((m) => m.id === id)
    : ready.filter((m) => !pinned[m.id]);
  const genOrder = [...unpinned]
    .map((m) => m.id)
    .sort((a, b) => String(a).localeCompare(String(b)));
  // PIN order only — never upload in generation/id sequence.
  const candidates = id
    ? unpinned.slice(0, 1)
    : pickCandidatesRandom(unpinned, count);

  console.log(
    `==> Global Pinterest (Account B): ${candidates.length} of ${ready.length} ready, ${Object.keys(pinned).length} already pinned`,
  );
  console.log(
    `    browser=${BROWSER_URL} delay=${DELAY_MIN_SEC}–${DELAY_MAX_SEC}s dryRun=${dryRun} board=${forcedBoard || "(per language)"} order=random-lang-rr`,
  );
  if (candidates.length) {
    console.log(`    gen-order (NOT used): ${genOrder.slice(0, 12).join(" → ")}${genOrder.length > 12 ? "…" : ""}`);
    console.log(`    pin-order (upload):   ${candidates.map((m) => m.id).join(" → ")}`);
  }

  if (!candidates.length) {
    console.log("nothing to pin");
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
