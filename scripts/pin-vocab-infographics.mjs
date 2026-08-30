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
import {
  auditPinnedClusters,
} from "./lib/pin-topic-clusters.mjs";
import {
  buildTopicDedupContext,
  shouldSkipBundleForTopicDupSync,
} from "./lib/pin-topic-similarity.mjs";
import { withListenOnWebsitePrefix } from "./lib/atlas-pin-description.mjs";
import { pronouncePinUrl } from "./lib/atlas-pin-destination.mjs";
import { koPinIdForVocab } from "./lib/vocab-ko-redirects.mjs";
import {
  isQuizWordPinId,
  quizWordPinDescription,
  quizWordPinLiveUrl,
  quizWordPinTitle,
  resolveQuizWordPinFile,
  wordPinMeta,
} from "./lib/quiz_word_pin.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT =
  (process.env.VOCAB_OUT || "").trim() ||
  path.join(ROOT, ".tmp", "vocab-infographic-gen");
const REVIEW = path.join(OUT, "pin-review.json");
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
const SITE_URL = "https://getpronounce.net";
const PREPLY =
  process.env.PINTEREST_AFFILIATE_PREPLY ||
  "https://preply.sjv.io/GbYYkn";
const ITALKI =
  process.env.PINTEREST_AFFILIATE_ITALKI ||
  "https://www.italki.com/en/affshare?ref=af33117569";
/** Site SEO page only on pin (default 0 = no Preply/italki). */
const AFFILIATE_RATE = Math.min(
  1,
  Math.max(0, Number(process.env.PINTEREST_AFFILIATE_RATE ?? 0) || 0),
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
  let ids = [];
  let prefix = "";
  let dryRun = false;
  /** Allow homepage destination (legacy escape hatch only). */
  let allowHomeLink = false;
  /** Skip live HEAD/GET of kajakorean.com /vocab/... (local catalog only). */
  let skipLiveCheck = false;
  /** Pin only dashboard-approved rows (pin-review.json status=approved). */
  let approvedOnly = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--allow-home-link") allowHomeLink = true;
    else if (a === "--skip-live-check") skipLiveCheck = true;
    else if (a === "--approved-only") approvedOnly = true;
    else if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 8);
    else if (a.startsWith("--count=")) count = Math.max(1, parseInt(a.slice(8), 10) || 8);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--ids" && argv[i + 1]) {
      ids = argv[++i]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a.startsWith("--ids=")) {
      ids = a
        .slice(6)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    } else if (a === "--prefix" && argv[i + 1]) prefix = argv[++i];
    else if (a.startsWith("--prefix=")) prefix = a.slice(9);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 8);
  }
  return { count, id, ids, prefix, dryRun, allowHomeLink, skipLiveCheck, approvedOnly };
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

/** tr- / twin ids — same pin as catalog id. */
function pinIdFamily(id) {
  const raw = String(id || "").trim();
  if (!raw) return [];
  let base = raw;
  if (raw.startsWith("tr-") && raw.endsWith("-tr") && raw.length > 6) {
    base = raw.slice(3, -3);
  } else if (raw.startsWith("tr-")) {
    base = raw.slice(3);
  }
  return [...new Set([raw, base, `tr-${base}`, `tr-${base}-tr`].filter(
    (x) => x && x !== "tr-" && x !== "tr--tr",
  ))];
}

function isUploadBlocked(id, pinned, scheduled, topicCtx) {
  const quizMeta = isQuizWordPinId(id) ? wordPinMeta(id) : null;
  const title =
    String(pinned[id]?.title || "").trim() ||
    String(scheduled[id]?.tweetText || "").split("\n")[0].trim() ||
    String(quizMeta?.title || "").trim() ||
    id;
  const gate = shouldSkipBundleForTopicDupSync(id, title, topicCtx);
  if (gate.skip) return { blocked: true, reason: gate.reason };
  return { blocked: false };
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
    const aff = pickAffiliateLink();
    return { url: aff.url, partner: aff.partner };
  }
  const atlasKo = /__ko$/i.test(String(bundleId || ""))
    ? String(bundleId)
    : "";
  if (atlasKo) {
    return {
      url: pronouncePinUrl(atlasKo, "ko", "vocab-pin"),
      partner: "site",
    };
  }
  const page = publishedById.get(bundleId);
  if (!page?.slug) {
    throw new Error(
      `no SEO page for ${bundleId} — run yarn vocab:publish + deploy before pinning`,
    );
  }
  const koPin = koPinIdForVocab(ROOT, bundleId, page.slug);
  if (!koPin) {
    throw new Error(
      `no getpronounce /ko/pin mapping for ${bundleId} — skip kajakorean fallback`,
    );
  }
  return {
    url: pronouncePinUrl(koPin, "ko", "vocab-pin"),
    partner: "site",
  };
}

/** FTC/Pinterest disclosure — affiliate destinations lead with #ad. */
function withAdDisclosure(description, partner) {
  const body = String(description || "").trim();
  if (partner !== "preply" && partner !== "italki") return body;
  if (/^#ad\b/i.test(body)) return body;
  return body ? `#ad\n${body}` : "#ad";
}

/** Path without UTM — for deploy smoke checks. */
function atlasKoPinId(id) {
  const s = String(id || "").trim();
  return /__ko$/i.test(s) ? s : "";
}

function otherAtlasLang(id) {
  const m = String(id || "").match(/__([a-z]{2})$/i);
  return Boolean(m && m[1].toLowerCase() !== "ko");
}

function hasGetpronounceDest(bundleId, publishedById) {
  if (atlasKoPinId(bundleId)) return true;
  const page = publishedById.get(bundleId);
  if (!page?.slug) return false;
  return Boolean(koPinIdForVocab(ROOT, bundleId, page.slug));
}

function liveVocabPath(bundleId, publishedById) {
  if (/__ko$/i.test(String(bundleId || ""))) {
    return pronouncePinUrl(bundleId, "ko", "vocab-pin").split("?")[0];
  }
  const page = publishedById.get(bundleId);
  if (!page?.slug) return "";
  const koPin = koPinIdForVocab(ROOT, bundleId, page.slug);
  if (!koPin) return "";
  return pronouncePinUrl(koPin, "ko", "vocab-pin").split("?")[0];
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
  // Listen CTA is prepended later via withListenOnWebsitePrefix (same as atlas pins).
  const budget = Math.max(
    40,
    DESC_MAX - tags.length - creditBlock.length - 60,
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

  const text = body
    ? `${body}${creditBlock}\n\n${tags}`
    : `${creditBlock}\n\n${tags}`.trim();
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

/** Catalog format_id → even-mix bucket (trends share the same format bucket). */
function bucketFromCatalogFormat(format) {
  const f = String(format || "").toLowerCase();
  const map = {
    grid_cluster: "grid",
    antonym_split: "antonym",
    similar_split: "similar",
    super_list: "list",
    phrase_stack: "phrase",
    concept_rows: "concept",
    topik_upgrade: "topik",
    quiz_comment: "quiz",
    cute_cast: "cute",
    hanja_hub: "hanja",
    pronunciation_grid: "pronunciation",
    grammar_spotlight: "grammar",
    idiom_card: "idiom",
    compound_word: "compound",
    phrase_square: "phrase_square",
    quiz_word_pin: "quiz_word",
  };
  return map[f] || null;
}

/**
 * Bundle id → format bucket (so mixed pins feel "even").
 * Prefer catalog format when known so tr-* / cmp-* / gram-* land in the
 * same buckets as their non-trend siblings.
 */
function formatBucket(bundleId, formatById = null) {
  const id = String(bundleId || "").toLowerCase();
  if (isQuizWordPinId(id)) return "quiz_word";
  const fromCatalog = bucketFromCatalogFormat(formatById?.get?.(id) || formatById?.[id]);
  if (fromCatalog) return fromCatalog;

  // Trend wave ids: tr-{fmt}-{slug}
  if (id.startsWith("tr-")) {
    const rest = id.slice(3);
    if (rest.startsWith("ant-")) return "antonym";
    if (rest.startsWith("sim-")) return "similar";
    if (rest.startsWith("grid-")) return "grid";
    if (rest.startsWith("list-")) return "list";
    if (rest.startsWith("phrase-")) return "phrase";
    if (rest.startsWith("concept-")) return "concept";
    if (rest.startsWith("quiz-")) return "quiz";
    if (rest.startsWith("cute-")) return "cute";
    if (rest.startsWith("cmp-") || rest.startsWith("compound-")) return "compound";
    if (rest.startsWith("gram-")) return "grammar";
    if (rest.startsWith("idiom-")) return "idiom";
    if (rest.startsWith("hanja-")) return "hanja";
    if (rest.startsWith("topik-")) return "topik";
    if (rest.startsWith("pron-")) return "pronunciation";
  }

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
  if (id.startsWith("gram-")) return "grammar";
  if (id.startsWith("idiom-")) return "idiom";
  if (id.startsWith("cmp-") || id.startsWith("compound-")) return "compound";
  if (id.startsWith("pron-")) return "pronunciation";
  const head = id.split("-")[0] || "other";
  return head || "other";
}

/**
 * Random order across unpinned ready pins, round-robin by format
 * so one format doesn't dump a streak onto the board.
 * @param {string[]} ids
 * @param {number} count
 * @param {Map<string,string>|Record<string,string>|null} [formatById]
 */
function pickCandidatesEvenly(ids, count, formatById = null) {
  const buckets = new Map();
  for (const id of ids) {
    const k = formatBucket(id, formatById);
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

function isApproved(review, bundleId) {
  return review?.[bundleId]?.status === "approved";
}

function readyUnpinned(scheduled, pinned, publishedById, {
  prefix = "",
  allowHomeLink = false,
  approvedOnly = false,
  review = {},
  topicCtx = null,
} = {}) {
  return Object.keys(scheduled)
    .filter((k) => {
      const block = isUploadBlocked(k, pinned, scheduled, topicCtx);
      return !block.blocked;
    })
    .filter((k) => !prefix || k.startsWith(prefix))
    .filter((k) => !isQuizWordPinId(k))
    .filter((k) => !otherAtlasLang(k))
    .filter((k) => fs.existsSync(path.join(OUT, `${k}.png`)))
    .filter((k) => hasGetpronounceDest(k, publishedById))
    .filter((k) => !approvedOnly || isApproved(review, k));
}

async function main() {
  const {
    count,
    id,
    ids: idsArg,
    prefix,
    dryRun,
    allowHomeLink,
    skipLiveCheck,
    approvedOnly,
  } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin.mjs not found: ${UPLOAD_PIN}`);
  }
  const scheduled = loadJson(SCHEDULED, {});
  const pinned = loadJson(PINNED, {});
  const review = loadJson(REVIEW, {});
  const published = loadJson(PUBLISHED, { pages: [] });
  const publishedById = new Map(
    (Array.isArray(published?.pages) ? published.pages : [])
      .filter((page) => page?.bundleId && page?.slug)
      .map((page) => [String(page.bundleId), page]),
  );
  const castMap = loadCuteCastMap();
  const progressFlagsById = loadProgressFlagsById();
  const formatById = new Map(
    Object.entries(progressFlagsById)
      .filter(([, v]) => v?.format)
      .map(([k, v]) => [k, String(v.format)]),
  );
  const topicCtx = buildTopicDedupContext(OUT, Object.keys(scheduled));
  const clusterDupes = auditPinnedClusters(pinned, scheduled, review);
  if (clusterDupes.length) {
    console.log(
      `    topic-cluster duplicates already on Pinterest: ${clusterDupes.length} clusters`,
    );
    for (const row of clusterDupes.slice(0, 6)) {
      console.log(`      ${row.cluster}: ${row.pinned.join(", ")}`);
    }
  }

  let candidates;
  if (id) {
    if (!scheduled[id]) throw new Error(`Not in vocab-x-scheduled.json: ${id}`);
    if (approvedOnly && !isApproved(review, id)) {
      throw new Error(`Not approved in pin-review.json: ${id}`);
    }
    candidates = [id];
  } else if (idsArg.length) {
    if (approvedOnly) {
      const notApproved = idsArg.filter((k) => !isApproved(review, k));
      if (notApproved.length) {
        throw new Error(
          `Refusing to pin non-approved ids: ${notApproved.join(", ")}`,
        );
      }
    }
    candidates = idsArg.filter((k) => {
      if (isQuizWordPinId(k)) {
        console.log(`    skip ${k} — quiz word pins stay off (kajakorean how-to-say)`);
        return false;
      }
      if (otherAtlasLang(k)) {
        console.log(`    skip ${k} — not a Korean getpronounce pin`);
        return false;
      }
      if (!scheduled[k]) {
        console.log(`    skip ${k} — not in vocab-x-scheduled.json`);
        return false;
      }
      const block = isUploadBlocked(k, pinned, scheduled, topicCtx);
      if (block.blocked) {
        console.log(`    skip ${k} — ${block.reason}`);
        return false;
      }
      if (!fs.existsSync(path.join(OUT, `${k}.png`))) {
        console.log(`    skip ${k} — missing PNG`);
        return false;
      }
      if (!hasGetpronounceDest(k, publishedById)) {
        console.log(`    skip ${k} — no getpronounce /ko/pin mapping`);
        return false;
      }
      if (approvedOnly && !isApproved(review, k)) {
        console.log(`    skip ${k} — not approved`);
        return false;
      }
      return true;
    });
    if (approvedOnly && candidates.length !== idsArg.filter((k) => !pinned[k]).length) {
      const missing = idsArg.filter((k) => {
        if (pinned[k]) return false;
        if (isQuizWordPinId(k) || otherAtlasLang(k)) return false;
        return (
          !scheduled[k] ||
          !fs.existsSync(path.join(OUT, `${k}.png`)) ||
          !hasGetpronounceDest(k, publishedById)
        );
      });
      if (missing.length) {
        throw new Error(
          `Approved wave ids not ready to pin: ${missing.join(", ")}`,
        );
      }
    }
  } else {
    const ready = readyUnpinned(scheduled, pinned, publishedById, {
      prefix,
      allowHomeLink,
      approvedOnly,
      review,
      topicCtx,
    });
    const missingSeo = Object.keys(scheduled).filter(
      (k) =>
        !pinned[k] &&
        !isQuizWordPinId(k) &&
        !otherAtlasLang(k) &&
        fs.existsSync(path.join(OUT, `${k}.png`)) &&
        !hasGetpronounceDest(k, publishedById) &&
        (!prefix || k.startsWith(prefix)) &&
        (!approvedOnly || isApproved(review, k)),
    );
    if (missingSeo.length) {
      console.log(
        `    note: ${missingSeo.length} unpinned PNG(s) skipped — no getpronounce /ko/pin mapping`,
      );
    }
    candidates = pickCandidatesEvenly(ready, count, formatById);
  }

  console.log(
    `==> Vocab Pinterest: ${candidates.length} (of ${Object.keys(scheduled).length} scheduled, ${Object.keys(pinned).length} already pinned, published=${publishedById.size})`,
  );
  console.log(
    `    board=${DEFAULT_BOARD} site=${SITE_URL} topic~=${DEFAULT_TOPIC} delay=${
      DELAY_FIXED_SEC != null && Number.isFinite(DELAY_FIXED_SEC)
        ? `${DELAY_FIXED_SEC}s fixed`
        : `${DELAY_MIN_SEC}–${DELAY_MAX_SEC}s random`
    } timeout=${ATTEMPT_TIMEOUT_MS}ms retries=${MAX_RETRIES} dryRun=${dryRun} liveCheck=${!skipLiveCheck} allowHome=${allowHomeLink} approvedOnly=${approvedOnly}`,
  );
  if (candidates.length) {
    const mix = {};
    for (const c of candidates) {
      const k = formatBucket(c, formatById);
      mix[k] = (mix[k] || 0) + 1;
    }
    console.log(`    order=random-even mix=${JSON.stringify(mix)}`);
    console.log(`    next: ${candidates.slice(0, 8).join(" → ")}${candidates.length > 8 ? "…" : ""}`);
  }

  if (candidates.length === 0) {
    console.log("Nothing to pin.");
    if (!allowHomeLink && publishedById.size === 0) {
      console.error(
        "Hint: need getpronounce /ko/pin mapping (yarn vocab:publish + yarn vocab:ko-redirects).",
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
    topicCtx.pinned = pinned;
    const bundleId = candidates[i];
    const block = isUploadBlocked(bundleId, pinned, scheduled, topicCtx);
    if (block.blocked) {
      console.log(`→ [${i + 1}/${candidates.length}] ${bundleId} (${block.reason}, skip)`);
      ok += 1;
      continue;
    }
    if (pinned[bundleId]) {
      console.log(`→ [${i + 1}/${candidates.length}] ${bundleId} (already pinned, skip)`);
      ok += 1;
      continue;
    }
    if (isQuizWordPinId(bundleId)) {
      console.log(
        `→ [${i + 1}/${candidates.length}] ${bundleId} skip: quiz word pins stay off (kajakorean how-to-say)`,
      );
      failed += 1;
      continue;
    }

    const isQuizWord = isQuizWordPinId(bundleId);
    const quizMeta = isQuizWord ? wordPinMeta(bundleId) : null;
    const entry = isQuizWord
      ? { format: "quiz_word_pin", tweetText: quizMeta?.title || bundleId }
      : scheduled[bundleId];
    const sourcePng = isQuizWord
      ? resolveQuizWordPinFile(bundleId)
      : path.join(OUT, `${bundleId}.png`);
    const title = isQuizWord
      ? quizWordPinTitle(quizMeta)
      : titleFromEntry(bundleId, entry);
    const progressFlags = progressFlagsById[bundleId] || {};
    const rawDescription = isQuizWord
      ? quizWordPinDescription(quizMeta)
      : descriptionFromEntry(entry, title, {
          bundleId,
          castMap,
          cuteCast: entry?.cuteCast ?? progressFlags.cuteCast ?? castMap[bundleId] ?? undefined,
          includeJjibara:
            entry?.includeJjibara ?? progressFlags.includeJjibara ?? undefined,
          format: entry?.format ?? progressFlags.format ?? undefined,
        });
    const description = withListenOnWebsitePrefix(rawDescription, DESC_MAX);
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
    let partner = "site";
    try {
      if (isQuizWord) {
        const dest = String(quizMeta?.destination || "").trim();
        if (!dest) throw new Error("missing how-to-say destination in word-pin ledger");
        link = dest;
        partner = "site";
      } else {
        const dest = linkForBundle(bundleId, publishedById, { allowHomeLink });
        link = dest.url;
        partner = dest.partner || "site";
      }
    } catch (e) {
      console.error(`→ [${i + 1}/${candidates.length}] ${bundleId} skip: ${e.message || e}`);
      failed += 1;
      continue;
    }

    const descriptionWithAd = withAdDisclosure(description, partner);

    const destPath = (() => {
      try {
        return new URL(link).pathname;
      } catch {
        return "";
      }
    })();
    const isHome =
      !isQuizWord &&
      partner === "site" &&
      (destPath === "/" || destPath === "");
    if (isHome && !allowHomeLink) {
      console.error(
        `→ [${i + 1}/${candidates.length}] ${bundleId} skip: homepage link forbidden`,
      );
      failed += 1;
      continue;
    }

    if (!skipLiveCheck && partner === "site" && !isHome) {
      const livePath = isQuizWord
        ? quizWordPinLiveUrl(quizMeta)
        : liveVocabPath(bundleId, publishedById);
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
    console.log(`   link: ${link} (${partner})`);
    console.log(`   desc: ${descriptionWithAd.slice(0, 120).replace(/\n/g, " / ")}…`);

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
      description: descriptionWithAd,
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
      description: descriptionWithAd,
      topic,
      topics: topicList,
      alt,
      link,
      board: DEFAULT_BOARD,
      ...(payload.pin_id ? { pin_id: String(payload.pin_id) } : {}),
      ...(payload.pin_id
        ? {
            pin_url: `https://www.pinterest.com/pin/${String(payload.pin_id)}/`,
            analytics_url: `https://www.pinterest.com/pin/${String(payload.pin_id)}/analytics/?aggregation=last30d`,
          }
        : {}),
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
