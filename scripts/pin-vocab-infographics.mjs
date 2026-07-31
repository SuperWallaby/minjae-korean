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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, ".tmp", "vocab-infographic-gen");
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
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 30);
    else if (a.startsWith("--count=")) count = Math.max(1, parseInt(a.slice(8), 10) || 30);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (a === "--prefix" && argv[i + 1]) prefix = argv[++i];
    else if (a.startsWith("--prefix=")) prefix = a.slice(9);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 30);
  }
  return { count, id, prefix, dryRun };
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

function linkForBundle(bundleId, publishedById) {
  const page = publishedById.get(bundleId);
  const pathname = page?.slug
    ? `/vocab/${encodeURIComponent(bundleId)}/${encodeURIComponent(page.slug)}`
    : "/";
  const url = new URL(pathname, `${SITE_URL}/`);
  url.searchParams.set("utm_source", "pinterest");
  url.searchParams.set("utm_campaign", "vocab-pin");
  return url.toString();
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
function descriptionFromEntry(entry, title = "") {
  const tags = PIN_TAGS;
  const budget = Math.max(40, DESC_MAX - tags.length - 2);
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

  const text = body ? `${body}\n\n${tags}` : tags;
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

/** Prefer a specific interest tag from the title; fall back to Korean language. */
function topicFromTitle(title) {
  // Always use a Korean-learning interest tag. Title-derived queries
  // (e.g. "Stone fruits") match unrelated Pinterest interests.
  void title;
  return DEFAULT_TOPIC;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function runUploadOnce({ media, title, description, topic, alt, link }) {
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
      topic,
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
  const { count, id, prefix, dryRun } = parseArgs(process.argv.slice(2));
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
    candidates = Object.keys(scheduled)
      .filter((k) => !pinned[k])
      .filter((k) => !prefix || k.startsWith(prefix))
      .filter((k) => fs.existsSync(path.join(OUT, `${k}.png`)))
      .sort((a, b) => {
        const ta = Date.parse(scheduled[a]?.scheduledAt || 0) || 0;
        const tb = Date.parse(scheduled[b]?.scheduledAt || 0) || 0;
        return ta - tb;
      })
      .slice(0, count);
  }

  console.log(
    `==> Vocab Pinterest: ${candidates.length} (of ${Object.keys(scheduled).length} scheduled, ${Object.keys(pinned).length} already pinned)`,
  );
  console.log(
    `    board=${DEFAULT_BOARD} site=${SITE_URL} topic~=${DEFAULT_TOPIC} delay=${DELAY_SEC}s timeout=${ATTEMPT_TIMEOUT_MS}ms retries=${MAX_RETRIES} dryRun=${dryRun}`,
  );

  if (candidates.length === 0) {
    console.log("Nothing to pin.");
    return;
  }

  let ok = 0;
  let failed = 0;
  let consecutiveFails = 0;
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
    const media = path.join(OUT, `${bundleId}.png`);
    const title = titleFromEntry(bundleId, entry);
    const description = descriptionFromEntry(entry, title);
    const topic = topicFromTitle(title);
    const alt = altTextFromEntry(title, bundleId);
    const link = linkForBundle(bundleId, publishedById);
    console.log(`→ [${i + 1}/${candidates.length}] ${bundleId}`);
    console.log(`   title: ${title}`);
    console.log(`   topic: ${topic}`);
    console.log(`   alt: ${alt}`);
    console.log(`   link: ${link}`);
    console.log(`   desc: ${description.slice(0, 120).replace(/\n/g, " / ")}…`);

    if (dryRun) {
      ok += 1;
      continue;
    }

    const result = await uploadWithRetries({
      media,
      title,
      description,
      topic,
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
      alt,
      link,
      board: DEFAULT_BOARD,
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

  console.log(`done: ok=${ok} failed=${failed}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
