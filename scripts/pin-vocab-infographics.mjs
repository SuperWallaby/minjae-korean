#!/usr/bin/env node
/**
 * Pin ready vocab infographics to Pinterest (work Chrome) with title + description + topic.
 *
 *   node scripts/pin-vocab-infographics.mjs --count 30
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
const DEFAULT_BOARD = process.env.PINTEREST_BOARD_NAME || "Korean words";
const SITE_URL = "https://kajakorean.com";
const DEFAULT_TOPIC =
  process.env.PINTEREST_TOPIC?.trim() || "Korean language";
const BROWSER_URL = process.env.CHROME_WORK_DEBUG_URL || "http://127.0.0.1:9222";
const DELAY_SEC = Number(process.env.PINTEREST_UPLOAD_DELAY_SEC || 10);
const ATTEMPT_TIMEOUT_MS = Number(process.env.PINTEREST_ATTEMPT_TIMEOUT_MS || 180_000);
const MAX_RETRIES = Number(process.env.PINTEREST_MAX_RETRIES || 2);

function parseArgs(argv) {
  let count = 30;
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
    else if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 30);
    else if (a.startsWith("--count=")) count = Math.max(1, parseInt(a.slice(8), 10) || 30);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--prefix" && argv[i + 1]) prefix = argv[++i];
    else if (a.startsWith("--prefix=")) prefix = a.slice(9);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 30);
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

function linkForBundle(bundleId, publishedById, { allowHomeLink = false } = {}) {
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

function titleFromEntry(bundleId, entry) {
  const tweet = String(entry.tweetText || "");
  const first = tweet.split("\n").map((l) => l.trim()).find(Boolean) || "";
  let cleaned = first.replace(/^🇰🇷\s*/, "").trim();
  if (!cleaned) return bundleId.replace(/-/g, " ").slice(0, 60);

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
  return cleaned.slice(0, TITLE_MAX);
}

const DESC_MAX = 500;
const PIN_TAGS = "#koreanvocab #learnkorean #kajakorean #한국어";
const CHICO_DESC_CREDIT = "Charactor by @chico._.pu";
const WORD_EMOJIS = ["🔴", "🔵", "🟢", "🟡", "🟣", "🟠", "⚫️", "⚪️"];

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
 */
function descriptionFromEntry(entry, title = "", opts = {}) {
  const tags = PIN_TAGS;
  const credit =
    String(opts.cuteCast || entry?.cuteCast || "").toLowerCase() === "otter"
      ? ""
      : CHICO_DESC_CREDIT;
  const creditBlock = credit ? `\n\n${credit}` : "";
  const budget = Math.max(
    40,
    DESC_MAX - tags.length - creditBlock.length - 4,
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
    : `${credit}${credit ? "\n\n" : ""}${tags}`;
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
    `    board=${DEFAULT_BOARD} site=${SITE_URL} topic~=${DEFAULT_TOPIC} delay=${DELAY_SEC}s timeout=${ATTEMPT_TIMEOUT_MS}ms retries=${MAX_RETRIES} dryRun=${dryRun} liveCheck=${!skipLiveCheck} allowHome=${allowHomeLink}`,
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
    const description = descriptionFromEntry(entry, title);
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
      console.log(`  wait ${DELAY_SEC}s…`);
      await sleep(DELAY_SEC * 1000);
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
