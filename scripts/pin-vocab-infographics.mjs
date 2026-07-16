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
const UPLOAD_PIN = path.join(
  ROOT,
  "..",
  "projects/neo-project/auto-video-korean/scripts/pinterest-browser/upload-pin.mjs",
);
const DEFAULT_BOARD = process.env.PINTEREST_BOARD_NAME || "Korean words";
const DEFAULT_LINK =
  process.env.PINTEREST_DEFAULT_LINK?.trim() || "https://kajakorean.com";
const DEFAULT_TOPIC =
  process.env.PINTEREST_TOPIC?.trim() || "Korean language";
const BROWSER_URL = process.env.CHROME_WORK_DEBUG_URL || "http://127.0.0.1:9222";
const DELAY_SEC = Number(process.env.PINTEREST_UPLOAD_DELAY_SEC || 90);
const ATTEMPT_TIMEOUT_MS = Number(process.env.PINTEREST_ATTEMPT_TIMEOUT_MS || 180_000);
const MAX_RETRIES = Number(process.env.PINTEREST_MAX_RETRIES || 2);

function parseArgs(argv) {
  let count = 30;
  let id = "";
  let dryRun = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") dryRun = true;
    else if (a === "--count" && argv[i + 1]) count = Math.max(1, parseInt(argv[++i], 10) || 30);
    else if (a.startsWith("--count=")) count = Math.max(1, parseInt(a.slice(8), 10) || 30);
    else if (a === "--id" && argv[i + 1]) id = argv[++i];
    else if (a.startsWith("--id=")) id = a.slice(5);
    else if (/^\d+$/.test(a)) count = Math.max(1, parseInt(a, 10) || 30);
  }
  return { count, id, dryRun };
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

function titleFromEntry(bundleId, entry) {
  const tweet = String(entry.tweetText || "");
  const first = tweet.split("\n").map((l) => l.trim()).find(Boolean) || "";
  const cleaned = first.replace(/^🇰🇷\s*/, "").trim();
  if (cleaned) return cleaned.slice(0, 100);
  return bundleId.replace(/-/g, " ").slice(0, 100);
}

function descriptionFromEntry(entry, title = "") {
  const cap = entry.caption || {};
  const line1 = String(cap.line1 || "").trim();
  const line2 = String(cap.line2 || "").trim();
  const titleNorm = String(title || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  const parts = [];
  for (const line of [line1, line2]) {
    if (!line) continue;
    const norm = line.replace(/\s+/g, " ").toLowerCase();
    // Skip lines that repeat the pin title (Pinterest shows title + description).
    if (titleNorm && (norm === titleNorm || titleNorm.startsWith(norm) || norm.startsWith(titleNorm))) {
      continue;
    }
    // Also skip exact duplicates of an already-kept line.
    if (parts.some((p) => p.replace(/\s+/g, " ").toLowerCase() === norm)) continue;
    parts.push(line);
  }

  const body = parts.join("\n\n");
  const tags = "#koreanvocab #learnkorean #kajakorean #한국어";
  const text = body ? `${body}\n\n${tags}` : tags;
  return text.slice(0, 480);
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

function runUploadOnce({ media, title, description, topic, alt }) {
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
      DEFAULT_LINK,
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
  const { count, id, dryRun } = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(UPLOAD_PIN)) {
    throw new Error(`upload-pin.mjs not found: ${UPLOAD_PIN}`);
  }
  const scheduled = loadJson(SCHEDULED, {});
  const pinned = loadJson(PINNED, {});

  let candidates;
  if (id) {
    if (!scheduled[id]) throw new Error(`Not in vocab-x-scheduled.json: ${id}`);
    candidates = [id];
  } else {
    candidates = Object.keys(scheduled)
      .filter((k) => !pinned[k])
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
    `    board=${DEFAULT_BOARD} link=${DEFAULT_LINK} topic~=${DEFAULT_TOPIC} delay=${DELAY_SEC}s timeout=${ATTEMPT_TIMEOUT_MS}ms retries=${MAX_RETRIES} dryRun=${dryRun}`,
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
    console.log(`→ [${i + 1}/${candidates.length}] ${bundleId}`);
    console.log(`   title: ${title}`);
    console.log(`   topic: ${topic}`);
    console.log(`   alt: ${alt}`);
    console.log(`   desc: ${description.slice(0, 120).replace(/\n/g, " / ")}…`);

    if (dryRun) {
      ok += 1;
      continue;
    }

    const result = await uploadWithRetries({ media, title, description, topic, alt });
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
      link: DEFAULT_LINK,
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
