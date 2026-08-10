#!/usr/bin/env node
/**
 * Pin ready vocab infographics to Pinterest (work Chrome) with title + description + topic.
 *
 *   node scripts/pin-vocab-infographics.mjs --count 8   # one wave (default)
 *   node scripts/pin-vocab-infographics.mjs --count 1 --dry-run
 *   node scripts/pin-vocab-infographics.mjs --id ant-inside-outside
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
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
const PIN_OPT_DIR = path.join(OUT, "pin-optimized");
const SCHEDULED = path.join(OUT, "vocab-x-scheduled.json");
const PINNED = path.join(OUT, "pinterest-pinned.json");
const PUBLISHED = path.join(
  ROOT,
  "src",
  "data",
  "vocabInfographic",
  "published.json",
);
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
const DEFAULT_BOARD = process.env.PINTEREST_BOARD_NAME || "Korean words";
const SITE_URL = "https://kajakorean.com";
const PREPLY =
  process.env.PINTEREST_AFFILIATE_PREPLY ||
  "https://preply.sjv.io/c/7574725/1987575/24422";
const ITALKI =
  process.env.PINTEREST_AFFILIATE_ITALKI ||
  "https://www.italki.com/en/affshare?ref=af33117569";
/** Direct Preply/italki on pin vs SEO page (default 25%). */
const AFFILIATE_RATE = Math.min(
  1,
  Math.max(0, Number(process.env.PINTEREST_AFFILIATE_RATE ?? 0.25) || 0),
);
const DEFAULT_TOPIC =
  process.env.PINTEREST_TOPIC?.trim() || "Korean language";
const BROWSER_URL = process.env.CHROME_WORK_DEBUG_URL || "http://127.0.0.1:9222";
/** Inter-pin pause: random whole seconds in [min, max]. Fixed delay via PINTEREST_UPLOAD_DELAY_SEC. */
const DELAY_MIN_SEC = Math.max(
  0,
  Number(process.env.PINTEREST_UPLOAD_DELAY_MIN_SEC || 10),
);
const DELAY_MAX_SEC = Math.max(
  DELAY_MIN_SEC,
  Number(process.env.PINTEREST_UPLOAD_DELAY_MAX_SEC || 30),
);
const DELAY_FIXED_SEC = process.env.PINTEREST_UPLOAD_DELAY_SEC
  ? Number(process.env.PINTEREST_UPLOAD_DELAY_SEC)
  : null;

function nextUploadDelaySec() {
  if (DELAY_FIXED_SEC != null && Number.isFinite(DELAY_FIXED_SEC) && DELAY_FIXED_SEC >= 0) {
    return DELAY_FIXED_SEC;
  }
  const lo = Math.floor(DELAY_MIN_SEC);
  const hi = Math.floor(DELAY_MAX_SEC);
  return lo + Math.floor(Math.random() * (hi - lo + 1));
}
const ATTEMPT_TIMEOUT_MS = Number(process.env.PINTEREST_ATTEMPT_TIMEOUT_MS || 180_000);
const MAX_RETRIES = Number(process.env.PINTEREST_MAX_RETRIES || 2);

function parseArgs(argv) {
  let count = 8;
  let id = "";
  let prefix = "";
  let dryRun = false;
  /** Allow homepage destination (legacy escape hatch only). */
  let allowHomeLink = false;
  /** Skip live HEAD/GET of kajakorean.com /vocab/... (local catalog only). */
  let skipLiveCheck = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--allow-home-link") allowHomeLink = true;
    else if (a === "--skip-live-check") skipLiveCheck = true;
    else if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 8);
    else if (a.startsWith("--count=")) count = Math.max(1, parseInt(a.slice(8), 10) || 8);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--prefix" && argv[i + 1]) prefix = argv[++i];
    else if (a.startsWith("--prefix=")) prefix = a.slice(9);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 8);
  }
  return { count, id, prefix, dryRun, allowHomeLink, skipLiveCheck };
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

function pickAffiliateLink() {
  const usePreply = Math.random() < 0.5;
  const raw = usePreply ? PREPLY : ITALKI;
  return {
    url: withUtm(raw, usePreply ? "aff-preply-pin" : "aff-italki-pin"),
    partner: usePreply ? "preply" : "italki",
  };
}

function linkForBundle(bundleId, publishedById, { allowHomeLink = false } = {}) {
  if (AFFILIATE_RATE > 0 && Math.random() < AFFILIATE_RATE) {
    return pickAffiliateLink().url;
  }
  const page = publishedById.get(bundleId);
  if (!page?.slug) {
    if (!allowHomeLink) {
      throw new Error(
        `no SEO page for ${bundleId} — run yarn vocab:publish + deploy before pinning`,
      );
    }
  }
  const pathname = page?.slug
    ? `/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(page.slug)}`
    : "/";
  const url = new URL(pathname, `${SITE_URL}/`);
  url.searchParams.set("utm_source", "pinterest");
  url.searchParams.set("utm_campaign", "vocab-pin");
  return url.toString();
}

/** Path without UTM — for deploy smoke checks. */
function liveVocabPath(bundleId, publishedById) {
  const page = publishedById.get(bundleId);
  if (!page?.slug) return "";
  return `${SITE_URL}/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(page.slug)}`;
}

async function isLiveSeoPage(urlPath) {
  if (!urlPath) return false;
  try {
    const head = await fetch(urlPath, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(15_000),
    });
    if (head.ok) return true;
    // Some CDNs reject HEAD — fall back to GET.
    if (head.status === 405 || head.status === 403 || head.status === 404) {
      const get = await fetch(urlPath, {
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

function pickOne(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function titleFromEntry(bundleId, entry) {
  const tweet = String(entry.tweetText || "");
  const first = tweet.split("\n").map((l) => l.trim()).find(Boolean) || "";
  let cleaned = first.replace(/^🇰🇷\s*/, "").trim();
  if (!cleaned) {
    cleaned = bundleId.replace(/-/g, " ").slice(0, 60);
  }

  // Pinterest titles scan best short — never paste a long sentence wall.
  const TITLE_MAX = 64;
  if (cleaned.length > TITLE_MAX) {
    const cut = cleaned.slice(0, TITLE_MAX);
    const breakAt = Math.max(
      cut.lastIndexOf("?"),
      cut.lastIndexOf("!"),
      cut.lastIndexOf("."),
      cut.lastIndexOf(" — "),
      cut.lastIndexOf(" - "),
      cut.lastIndexOf(" "),
    );
    cleaned = (breakAt >= 28 ? cut.slice(0, breakAt) : cut).trim();
    cleaned = cleaned.replace(/[—,:;\-–\s]+$/u, "").trim();
  }

  // Light wrappers — keep most titles as-is, remix a minority.
  if (cleaned.length <= 48 && Math.random() < 0.35) {
    const wrappers = [
      (t) => t,
      (t) => `${t} ✨`,
      (t) => `Save this: ${t}`,
      (t) => `${t} 👇`,
      (t) => `Korean tip — ${t}`,
      (t) => `Pin for later: ${t}`,
    ];
    cleaned = pickOne(wrappers)(cleaned);
  }
  return cleaned.slice(0, TITLE_MAX);
}

const DESC_MAX = 500;
const PIN_TAG_SETS = [
  "#koreanvocab #learnkorean #kajakorean #한국어",
  "#learnkorean #koreanlanguage #vocabulary #한국어공부",
  "#kajakorean #studykorean #koreanvocab #한국어",
  "#koreanwords #languagelearning #learnkorean #한국어단어",
];
/** Optional — omit sometimes so not every pin repeats the same CTA. */
const SITE_AUDIO_LINES = [
  "Pronunciations are on the website 🎙️",
  "Audio + examples on the site 🎙️",
  "Hear them on the website 🔊",
];
const CHICO_DESC_CREDIT = "Charactor by @chico._.pu";
const WORD_EMOJIS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚫️", "⚪️"];

/**
 * Designer credit (점점이 / @chico._.pu) only when the pin actually features
 * the brand capybara cast or a 찌바라 cameo — never default-on.
 *
 * @param {{ bundleId?: string, cuteCast?: string|null, includeJjibara?: boolean|null, format?: string|null }} opts
 */
function shouldChicoDescCredit(opts = {}) {
  const cast = String(opts.cuteCast || "").toLowerCase().trim();
  if (cast === "otter") return false;
  if (opts.includeJjibara === true) return true;
  if (opts.includeJjibara === false) return false;
  const format = String(opts.format || "");
  if (format === "quiz_comment") return true;
  // Full cute_cast grid with capybara as the pin species
  if (format === "cute_cast" && cast === "capybara") return true;
  // Unknown / phrase / list / hanja without progress flag — do not credit
  return false;
}

function formatWordGloss(word, index) {
  const hangul = String(word?.hangul || "").trim();
  if (!hangul) return "";
  const rom = String(word?.romanization || "").trim();
  const en = String(word?.english || "")
    .replace(/\s*\(TOPIK\s*I+\)\s*/gi, "")
    .trim();
  const emoji = WORD_EMOJIS[index % WORD_EMOJIS.length] || "▪️";
  const romBit = rom ? ` [${rom}]` : "";
  // Keep each line short: Hangul + rom; English only if tiny
  if (en && en.length <= 18 && !/TOPIK/i.test(en)) {
    return `${emoji} ${hangul}${romBit} — ${en}`.trim();
  }
  return `${emoji} ${hangul}${romBit}`.trim();
}

/** TOPIK I→II: one upgrade pair per line (never a · soup). */
function topikPairLines(words) {
  const out = [];
  for (let i = 0; i + 1 < words.length; i += 2) {
    const a = words[i];
    const b = words[i + 1];
    const aEn = String(a?.english || "");
    const bEn = String(b?.english || "");
    const paired =
      /TOPIK\s*I\b/i.test(aEn) && /TOPIK\s*II\b/i.test(bEn);
    if (!paired) return null;
    const h1 = String(a.hangul || "").trim();
    const h2 = String(b.hangul || "").trim();
    if (!h1 || !h2) continue;
    const gloss = aEn.replace(/\s*\(TOPIK\s*I\)\s*/i, "").trim();
    const glossBit = gloss && gloss.length <= 16 ? `  · ${gloss}` : "";
    out.push(`${h1} → ${h2}${glossBit}`);
  }
  return out.length ? out : null;
}

function packLines(lines, budget) {
  const kept = [];
  for (const line of lines) {
    const next = kept.length ? `${kept.join("\n")}\n${line}` : line;
    if (next.length > budget) break;
    kept.push(line);
  }
  return kept.join("\n");
}

/**
 * Pin description: short lines + real newlines.
 * Never dump a long middle-dot (·) wall — hard to scan on Pinterest.
 * @param {object} entry
 * @param {string} title
 * @param {{ cuteCast?: string, bundleId?: string, castMap?: Record<string, string|null> }} [opts]
 */
function descriptionFromEntry(entry, title = "", opts = {}) {
  const tags = pickOne(PIN_TAG_SETS);
  const bundleId = String(opts.bundleId || entry?.bundleId || "").trim();
  const cuteCast =
    opts.cuteCast ??
    entry?.cuteCast ??
    (bundleId && opts.castMap ? opts.castMap[bundleId] : undefined);
  const credit = shouldChicoDescCredit({
    bundleId,
    cuteCast,
    includeJjibara: opts.includeJjibara ?? entry?.includeJjibara,
    format: opts.format ?? entry?.format,
  })
    ? CHICO_DESC_CREDIT
    : "";
  const creditBlock = credit ? `\n\n${credit}` : "";
  const audioLine =
    Math.random() < 0.72 ? pickOne(SITE_AUDIO_LINES) : "";
  const audioBlock = audioLine ? `\n\n${audioLine}` : "";
  const budget = Math.max(
    40,
    DESC_MAX - tags.length - creditBlock.length - audioBlock.length - 4,
  );
  const titleNorm = String(title || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  const words = Array.isArray(entry?.imageWords)
    ? entry.imageWords.filter((w) => String(w?.hangul || "").trim())
    : [];

  let body = "";

  if (words.length) {
    const pairLines = topikPairLines(words);
    if (pairLines?.length) {
      body = packLines(pairLines, budget);
    } else {
      const lines = words.map((w, i) => formatWordGloss(w, i)).filter(Boolean);
      body = packLines(lines, budget);
      // If nothing fit (edge), hangul-only lines
      if (!body) {
        const tiny = words
          .map((w) => String(w.hangul || "").trim())
          .filter(Boolean)
          .map((h, i) => `${WORD_EMOJIS[i % WORD_EMOJIS.length]} ${h}`);
        body = packLines(tiny, budget);
      }
    }
  }

  // Fallback: legacy caption lines (when no imageWords)
  if (!body) {
    const cap = entry?.caption || {};
    const parts = [];
    for (const line of [cap.line1, cap.line2]) {
      const s = String(line || "").trim();
      if (!s) continue;
      const norm = s.replace(/\s+/g, " ").toLowerCase();
      if (
        titleNorm &&
        (norm === titleNorm || titleNorm.startsWith(norm) || norm.startsWith(titleNorm))
      ) {
        continue;
      }
      if (parts.some((p) => p.replace(/\s+/g, " ").toLowerCase() === norm)) continue;
      // Cap each caption line
      parts.push(s.length > 90 ? `${s.slice(0, 87).trim()}…` : s);
    }
    body = parts.join("\n");
  }

  const fallbackAudio = audioLine || pickOne(SITE_AUDIO_LINES);
  const text = body
    ? `${body}${audioBlock}${creditBlock}\n\n${tags}`
    : `${fallbackAudio}${creditBlock}\n\n${tags}`;
  return text.slice(0, DESC_MAX);
}

/** Short alt text — core subject only (Pinterest prefers concise alt). */
function altTextFromEntry(title, bundleId) {
  let topic = String(title || "").trim();
  // First clause only (drop caption-style tails after ?!.)
  const head = topic
    .split(/[?!.]/)[0]
    .replace(/[^\w\s'/-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (head.length >= 4) topic = head;
  topic = topic.replace(/\s+in Korean$/i, "").trim();

  const tooHooky =
    topic.length > 40 ||
    /^(let'?s practice|want to|check out|start with|feeling|need to|learn how)\b/i.test(topic);
  if (tooHooky) {
    const fromId = String(bundleId || "")
      .replace(/^(grid|list|ant|quiz)-/i, "")
      .replace(/-/g, " ")
      .trim();
    if (fromId) topic = fromId;
  }

  topic = topic.slice(0, 56).trim();
  if (!topic) topic = "Korean vocabulary";
  return `${topic} — Korean vocab chart`.slice(0, 100);
}

/**
 * Pinterest interest tags that actually exist in typeahead for our account.
 * Empirically only "Korean Language" is useful among Korean* suggestions
 * (the rest are fashion/food/drama). Type seed "Korean", then pick exact.
 */
function topicCandidatesForPin() {
  return [DEFAULT_TOPIC];
}

function topicsArgFromCandidates(candidates) {
  return candidates.join("|");
}

/** Catalog cuteCast map (id → "capybara" | "otter" | null). Cached on disk. */
function loadCuteCastMap() {
  const cachePath = path.join(OUT, "cute-cast-map.json");
  if (fs.existsSync(cachePath)) {
    try {
      const st = fs.statSync(cachePath);
      // Refresh at most once a day
      if (Date.now() - st.mtimeMs < 24 * 60 * 60 * 1000) {
        return JSON.parse(fs.readFileSync(cachePath, "utf8"));
      }
    } catch {
      /* rebuild */
    }
  }
  const probe = `
    import { ALL_VOCAB_BUNDLES } from ${JSON.stringify(
      path.join(ROOT, "src/lib/vocabInfographic/bundle-catalog.ts"),
    )};
    const m = {};
    for (const b of ALL_VOCAB_BUNDLES) {
      if (b?.id) m[b.id] = b.cuteCast ?? null;
    }
    process.stdout.write(JSON.stringify(m));
  `;
  const r = spawnSync("npx", ["tsx", "--eval", probe], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0) {
    console.warn("    warn: cuteCast catalog load failed — credit only when progress says jibara");
    if (r.stderr) console.warn(String(r.stderr).slice(0, 300));
    return {};
  }
  try {
    const map = JSON.parse(r.stdout || "{}");
    fs.mkdirSync(OUT, { recursive: true });
    fs.writeFileSync(cachePath, JSON.stringify(map));
    return map;
  } catch {
    return {};
  }
}

/**
 * Per-bundle flags from batch progress + catalog format.
 * includeJjibara: true only when generation recorded a cameo.
 */
function loadProgressFlagsById() {
  const progressPath = path.join(OUT, "progress.json");
  const progress = loadJson(progressPath, { done: {} });
  const out = {};
  for (const [id, row] of Object.entries(progress.done || {})) {
    out[id] = {
      includeJjibara:
        typeof row?.includeJjibara === "boolean" ? row.includeJjibara : undefined,
      cuteCast: row?.cuteCast ?? undefined,
    };
  }
  // Catalog format for cute_cast credit
  const probe = `
    import { ALL_VOCAB_BUNDLES } from ${JSON.stringify(
      path.join(ROOT, "src/lib/vocabInfographic/bundle-catalog.ts"),
    )};
    const m = {};
    for (const b of ALL_VOCAB_BUNDLES) {
      if (b?.id) m[b.id] = b.format ?? null;
    }
    process.stdout.write(JSON.stringify(m));
  `;
  const r = spawnSync("npx", ["tsx", "--eval", probe], {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status === 0) {
    try {
      const formats = JSON.parse(r.stdout || "{}");
      for (const [id, format] of Object.entries(formats)) {
        if (!out[id]) out[id] = {};
        out[id].format = format;
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Bundle id prefix → format bucket (so mixed pins feel "even"). */
function formatBucket(bundleId) {
  const id = String(bundleId || "").toLowerCase();
  if (id.startsWith("hanja-")) return "hanja";
  if (id.startsWith("cute-") || id.startsWith("cute_")) return "cute";
  if (id.startsWith("grid-")) return "grid";
  if (id.startsWith("list-") || id.startsWith("super-")) return "list";
  if (id.startsWith("ant-") || id.startsWith("antonym-")) return "antonym";
  if (id.startsWith("sim-") || id.startsWith("similar-")) return "similar";
  if (id.startsWith("quiz-")) return "quiz";
  if (id.startsWith("concept-")) return "concept";
  if (id.startsWith("phrase-")) return "phrase";
  if (id.startsWith("topik-")) return "topik";
  const head = id.split("-")[0] || "other";
  return head || "other";
}

/**
 * Random order across unpinned ready pins, round-robin by format
 * so one format doesn't dump a streak onto the board.
 */
function pickCandidatesEvenly(ids, count) {
  const buckets = new Map();
  for (const id of ids) {
    const k = formatBucket(id);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(id);
  }
  for (const list of buckets.values()) shuffleInPlace(list);
  const keys = shuffleInPlace([...buckets.keys()]);
  const out = [];
  while (out.length < count) {
    let progressed = false;
    for (const k of keys) {
      const list = buckets.get(k);
      if (list?.length) {
        out.push(list.shift());
        progressed = true;
        if (out.length >= count) break;
      }
    }
    if (!progressed) break;
  }
  return out;
}

function runUploadOnce({ media, title, description, topic, topics, alt, link }) {
  const topicArg = String(topics || topic || DEFAULT_TOPIC).trim();
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
      topicArg,
      "--alt",
      alt,
      "--board",
      DEFAULT_BOARD,
      "--browser-url",
      BROWSER_URL,
      "--timeout",
      String(ATTEMPT_TIMEOUT_MS),
    ],
    {
      cwd: path.dirname(UPLOAD_PIN),
      encoding: "utf8",
      env: process.env,
      timeout: ATTEMPT_TIMEOUT_MS + 30_000, // hard kill if child hangs past UI timeout
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
  const text = String(out || "").trim();
  // Prefer last JSON object in output.
  const matches = text.match(/\{[^{}]*\}/g) || [];
  for (let i = matches.length - 1; i >= 0; i--) {
    try {
      return JSON.parse(matches[i]);
    } catch {
      /* continue */
    }
  }
  return null;
}

function isDuplicateRiskFailure(out) {
  const text = String(out || "");
  return /publish did not complete in time|publishUnconfirmed|assuming published/i.test(text);
}

async function uploadWithRetries(args) {
  let last = { ok: false, out: "no attempt" };
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    console.log(`   attempt ${attempt}/${MAX_RETRIES + 1}`);
    last = runUploadOnce(args);
    if (last.ok) return last;

    // Publish may have landed even when confirmation failed — never retry that.
    if (isDuplicateRiskFailure(last.out)) {
      console.error(`   attempt failed (no-retry, likely published): ${last.out}`);
      return { ok: true, out: last.out, publishUnconfirmed: true };
    }

    console.error(`   attempt failed: ${last.out}`);
    if (attempt <= MAX_RETRIES) {
      console.log("   retry in 8s…");
      await sleep(8000);
    }
  }
  return last;
}

async function main() {
  const { count, id, prefix, dryRun, allowHomeLink, skipLiveCheck } = parseArgs(
    process.argv.slice(2),
  );
  if (!fs.existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin.mjs not found: ${UPLOAD_PIN}`);
  }
  const scheduled = loadJson(SCHEDULED, {});
  const pinned = loadJson(PINNED, {});
  const published = loadJson(PUBLISHED, { pages: [] });
  const publishedById = new Map(
    (Array.isArray(published?.pages) ? published.pages : [])
      .filter((page) => page?.bundleId && page?.slug)
      .map((page) => [String(page.bundleId), page]),
  );
  const castMap = loadCuteCastMap();
  const progressFlagsById = loadProgressFlagsById();

  let candidates;
  if (id) {
    if (!scheduled[id]) throw new Error(`Not in vocab-x-scheduled.json: ${id}`);
    candidates = [id];
  } else {
    const ready = Object.keys(scheduled)
      .filter((k) => !pinned[k])
      .filter((k) => !prefix || k.startsWith(prefix))
      .filter((k) => fs.existsSync(path.join(OUT, `${k}.png`)))
      .filter((k) => allowHomeLink || publishedById.has(k));
    const missingSeo = Object.keys(scheduled).filter(
      (k) =>
        !pinned[k] &&
        fs.existsSync(path.join(OUT, `${k}.png`)) &&
        !publishedById.has(k) &&
        (!prefix || k.startsWith(prefix)),
    );
    if (missingSeo.length && !allowHomeLink) {
      console.log(
        `    note: ${missingSeo.length} unpinned PNG(s) skipped — not in published.json (yarn vocab:publish + deploy first)`,
      );
    }
    candidates = pickCandidatesEvenly(ready, count);
  }

  console.log(
    `==> Vocab Pinterest: ${candidates.length} (of ${Object.keys(scheduled).length} scheduled, ${Object.keys(pinned).length} already pinned, published=${publishedById.size})`,
  );
  console.log(
    `    board=${DEFAULT_BOARD} site=${SITE_URL} topic~=${DEFAULT_TOPIC} delay=${
      DELAY_FIXED_SEC != null && Number.isFinite(DELAY_FIXED_SEC)
        ? `${DELAY_FIXED_SEC}s fixed`
        : `${DELAY_MIN_SEC}–${DELAY_MAX_SEC}s random`
    } timeout=${ATTEMPT_TIMEOUT_MS}ms retries=${MAX_RETRIES} dryRun=${dryRun} liveCheck=${!skipLiveCheck} allowHome=${allowHomeLink}`,
  );
  if (candidates.length) {
    const mix = {};
    for (const c of candidates) {
      const k = formatBucket(c);
      mix[k] = (mix[k] || 0) + 1;
    }
    console.log(`    order=random-even mix=${JSON.stringify(mix)}`);
    console.log(`    next: ${candidates.slice(0, 8).join(" → ")}${candidates.length > 8 ? "…" : ""}`);
  }

  if (candidates.length === 0) {
    console.log("Nothing to pin.");
    if (!allowHomeLink && publishedById.size === 0) {
      console.error(
        "Hint: published.json empty/stale — yarn vocab:publish then deploy kajakorean.com.",
      );
    }
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
  let failed = 0;
  let consecutiveFails = 0;
  let skippedNotLive = 0;
  for (let i = 0; i < candidates.length; i++) {
    // Re-read pinned each loop so resumed runs never re-upload.
    Object.assign(pinned, loadJson(PINNED, {}));
    const bundleId = candidates[i];
    if (pinned[bundleId]) {
      console.log(`→ [${i + 1}/${candidates.length}] ${bundleId} (already pinned, skip)`);
      ok += 1;
      continue;
    }
    const entry = scheduled[bundleId];
    const sourcePng = path.join(OUT, `${bundleId}.png`);
    const title = titleFromEntry(bundleId, entry);
    const progressFlags = progressFlagsById[bundleId] || {};
    const description = descriptionFromEntry(entry, title, {
      bundleId,
      castMap,
      cuteCast: entry?.cuteCast ?? progressFlags.cuteCast ?? castMap[bundleId] ?? undefined,
      includeJjibara:
        entry?.includeJjibara ?? progressFlags.includeJjibara ?? undefined,
      format: entry?.format ?? progressFlags.format ?? undefined,
    });
    if (
      shouldChicoDescCredit({
        bundleId,
        cuteCast: entry?.cuteCast ?? progressFlags.cuteCast ?? castMap[bundleId],
        includeJjibara: entry?.includeJjibara ?? progressFlags.includeJjibara,
        format: entry?.format ?? progressFlags.format,
      })
    ) {
      console.log(`   credit: ${CHICO_DESC_CREDIT}`);
    }
    const topicList = topicCandidatesForPin();
    const topic = topicsArgFromCandidates(topicList);
    const alt = altTextFromEntry(title, bundleId);

    let link;
    try {
      link = linkForBundle(bundleId, publishedById, { allowHomeLink });
    } catch (e) {
      console.error(`→ [${i + 1}/${candidates.length}] ${bundleId} skip: ${e.message || e}`);
      failed += 1;
      continue;
    }

    const isHome =
      !publishedById.get(bundleId)?.slug ||
      new URL(link).pathname === "/" ||
      new URL(link).pathname === "";
    if (isHome && !allowHomeLink) {
      console.error(
        `→ [${i + 1}/${candidates.length}] ${bundleId} skip: homepage link forbidden`,
      );
      failed += 1;
      continue;
    }

    if (!skipLiveCheck && !isHome) {
      const livePath = liveVocabPath(bundleId, publishedById);
      const live = await isLiveSeoPage(livePath);
      if (!live) {
        console.error(
          `→ [${i + 1}/${candidates.length}] ${bundleId} skip: SEO not live yet (${livePath})`,
        );
        skippedNotLive += 1;
        failed += 1;
        continue;
      }
    }

    console.log(`→ [${i + 1}/${candidates.length}] ${bundleId}`);
    console.log(`   title: ${title}`);
    console.log(`   topics: ${topicList.join(" · ")}`);
    console.log(`   alt: ${alt}`);
    console.log(`   link: ${link}`);
    console.log(`   desc: ${description.slice(0, 120).replace(/\n/g, " / ")}…`);

    let media = sourcePng;
    try {
      const optPath = optimizedPinPath(sourcePng, PIN_OPT_DIR);
      const opt = await optimizePinterestPin(sourcePng, optPath);
      media = opt.path;
      console.log(
        `   media: ${opt.width}×${opt.height} ${opt.kind} jpeg ${opt.outputKb}KB (from png ${opt.inputKb}KB)`,
      );
    } catch (e) {
      console.warn(
        `   media optimize failed, using source png: ${e?.message || e}`,
      );
      media = sourcePng;
    }

    if (dryRun) {
      ok += 1;
      continue;
    }

    const result = await uploadWithRetries({
      media,
      title,
      description,
      topic,
      topics: topic,
      alt,
      link,
    });
    if (!result.ok) {
      console.error(`  failed after retries: ${result.out}`);
      failed += 1;
      consecutiveFails += 1;
      if (consecutiveFails >= 3) {
        console.error("  aborting: 3 consecutive failures");
        break;
      }
      continue;
    }

    consecutiveFails = 0;
    console.log(`  ${result.out}`);
    const payload = parseUploadPayload(result.out) || {};
    pinned[bundleId] = {
      at: new Date().toISOString(),
      title,
      description,
      topic,
      topics: topicList,
      alt,
      link,
      board: DEFAULT_BOARD,
      ...(payload.pin_id ? { pin_id: String(payload.pin_id) } : {}),
      ...(result.publishUnconfirmed || payload.publishUnconfirmed
        ? { publishUnconfirmed: true }
        : {}),
    };
    saveJson(PINNED, pinned);
    ok += 1;

    if (i < candidates.length - 1) {
      const waitSec = nextUploadDelaySec();
      console.log(`  wait ${waitSec}s…`);
      await sleep(waitSec * 1000);
    }
  }

  console.log(
    `done: ok=${ok} failed=${failed}${skippedNotLive ? ` (not-live=${skippedNotLive})` : ""}`,
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
