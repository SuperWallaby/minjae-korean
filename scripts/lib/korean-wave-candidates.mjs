/**
 * Approved pin backlog + format-balanced wave picking (vocab infographics + quiz word pins).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { isQuizWordPinId } from "./quiz_word_pin.mjs";
import {
  buildTopicDedupContext,
  getTitleVector,
  shouldSkipBundleForTopicDupSync,
} from "./pin-topic-similarity.mjs";
import { koPinIdForVocab } from "./vocab-ko-redirects.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PUBLISHED_PATH = path.join(
  ROOT,
  "src/data/vocabInfographic/published.json",
);

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

function isAsciiBundleId(id) {
  return /^[\x20-\x7E]+$/.test(String(id || ""));
}

function publishedPagesById() {
  const file = loadJson(PUBLISHED_PATH, { pages: [] });
  return new Map(
    (Array.isArray(file?.pages) ? file.pages : [])
      .filter((p) => p?.bundleId)
      .map((p) => [p.bundleId, p]),
  );
}

function publishedBundleIds() {
  return new Set(publishedPagesById().keys());
}

function atlasKoPinId(id) {
  const s = String(id || "").trim();
  return /__ko$/i.test(s) ? s : "";
}

function otherAtlasLang(id) {
  const m = String(id || "").match(/__([a-z]{2})$/i);
  return m && m[1].toLowerCase() !== "ko";
}

/** Chart must land on a live getpronounce /ko/pin — never kajakorean fallback. */
function hasGetpronounceDest(id, publishedById) {
  if (atlasKoPinId(id)) return true;
  const page = publishedById?.get?.(id);
  if (!page?.slug) return false;
  return Boolean(koPinIdForVocab(ROOT, id, page.slug));
}

/** Vocab pins already in published.json (SEO catalog) — safe for pin destination. */
function isSeoPinable(id, _scheduled, publishedIds) {
  if (!isAsciiBundleId(id)) return false;
  if (String(id).includes(".bak")) return false;
  return publishedIds.has(id);
}

/** seo-live-ok.json: { [bundleId]: { ok: boolean } } — ok:false skips until deploy catches up. */
function loadLiveDenied(outDir) {
  const file = loadJson(path.join(outDir, "seo-live-ok.json"), {});
  const denied = new Set();
  for (const [id, row] of Object.entries(file || {})) {
    if (row?.ok === false) denied.add(id);
  }
  return denied;
}

function cleanTopic(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function reserveTopic(ctx, title, source) {
  const cleaned = cleanTopic(title);
  if (!cleaned || !ctx) return;
  const key = cleaned.toLowerCase();
  const entries = ctx.topicEntries || [];
  if (entries.some((row) => cleanTopic(row?.topic).toLowerCase() === key)) return;
  entries.push({
    topic: cleaned,
    vector: getTitleVector(cleaned, entries),
    backend: "hash",
    source,
  });
  ctx.topicEntries = entries;
}

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

export function formatBucket(bundleId, formatById = null) {
  const id = String(bundleId || "").toLowerCase();
  if (isQuizWordPinId(id)) return "quiz_word";
  const fromCatalog = bucketFromCatalogFormat(
    formatById?.get?.(id) || formatById?.[id],
  );
  if (fromCatalog) return fromCatalog;

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

export function pickCandidatesEvenly(ids, count, formatById = null, preferFewer = []) {
  const buckets = new Map();
  for (const id of ids) {
    const k = formatBucket(id, formatById);
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k).push(id);
  }
  for (const list of buckets.values()) shuffleInPlace(list);

  const counts = new Map();
  for (const id of preferFewer) {
    const k = formatBucket(id, formatById);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  for (const k of buckets.keys()) {
    if (!counts.has(k)) counts.set(k, 0);
  }

  const out = [];
  while (out.length < count) {
    const available = [...buckets.entries()].filter(([, list]) => list.length);
    if (!available.length) break;
    available.sort((a, b) => {
      const ca = counts.get(a[0]) || 0;
      const cb = counts.get(b[0]) || 0;
      if (ca !== cb) return ca - cb;
      return Math.random() - 0.5;
    });
    const [k, list] = available[0];
    const id = list.shift();
    out.push(id);
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  return out;
}

function interleave(a, b) {
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length) out.push(a[i++]);
    if (j < b.length) out.push(b[j++]);
  }
  return out;
}

function quizWordPinnedToday(pinned, tz = "Asia/Seoul") {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  let n = 0;
  for (const [id, row] of Object.entries(pinned || {})) {
    if (!isQuizWordPinId(id)) continue;
    const at = String(row?.at || "");
    if (!at) continue;
    const d = new Date(at).toLocaleDateString("en-CA", { timeZone: tz });
    if (d === today) n += 1;
  }
  return n;
}

/** Approved + image-ready + SEO-pinable + not pinned. */
export function listApprovedReady(outDir) {
  const review = loadJson(path.join(outDir, "pin-review.json"), {});
  const pinned = loadJson(path.join(outDir, "pinterest-pinned.json"), {});
  const scheduled = loadJson(path.join(outDir, "vocab-x-scheduled.json"), {});
  const publishedIds = publishedBundleIds();
  const publishedById = publishedPagesById();
  const liveDenied = loadLiveDenied(outDir);

  const rows = [];
  for (const [id, entry] of Object.entries(review || {})) {
    if (entry?.status !== "approved" || pinned[id]) continue;

    if (isQuizWordPinId(id)) {
      continue;
    }
    if (otherAtlasLang(id)) continue;

    if (!fs.existsSync(path.join(outDir, `${id}.png`))) continue;
    if (!scheduled[id]?.tweetText && !scheduled[id]?.imageUrl) continue;
    if (atlasKoPinId(id)) {
      // Already a getpronounce Korean chart / reading pin.
    } else {
      if (!isSeoPinable(id, scheduled, publishedIds)) continue;
      if (!hasGetpronounceDest(id, publishedById)) continue;
    }
    // seo-live-ok.json is leftover kajakorean /vocab HEAD status — ignore when dest is getpronounce.
    if (liveDenied.has(id) && !hasGetpronounceDest(id, publishedById)) continue;
    rows.push({
      id,
      at: String(entry.approvedAt || ""),
      title:
        String(scheduled[id]?.tweetText || "").split("\n")[0].trim() || id,
      bucket: formatBucket(id, null),
    });
  }

  rows.sort((a, b) => a.at.localeCompare(b.at));
  return rows;
}

export function countApprovedReady(outDir) {
  return listApprovedReady(outDir).length;
}

/**
 * Pick wave ids with format balance. Quiz word pins are capped per wave/day so
 * 55 approved cards drain gradually mixed with vocab infographics.
 */
export function pickKoreanWaveIds(outDir, limit) {
  const maxPerWave = Math.max(
    0,
    Number(process.env.KR_PIN_QUIZ_WORD_MAX_PER_WAVE ?? 0) || 0,
  );
  const maxPerDay = Math.max(
    0,
    Number(process.env.KR_PIN_QUIZ_WORD_MAX_PER_DAY ?? 0) || 0,
  );

  const pinned = loadJson(path.join(outDir, "pinterest-pinned.json"), {});
  const scheduled = loadJson(path.join(outDir, "vocab-x-scheduled.json"), {});
  const approved = listApprovedReady(outDir);
  const topicCtx = buildTopicDedupContext(outDir, Object.keys(scheduled));

  const deduped = [];
  for (const row of approved) {
    const gate = shouldSkipBundleForTopicDupSync(row.id, row.title, topicCtx);
    if (gate.skip) continue;
    deduped.push(row);
    reserveTopic(topicCtx, row.title, `wave:${row.id}`);
  }

  const quizLeftToday = Math.max(0, maxPerDay - quizWordPinnedToday(pinned));
  const quizQuota = Math.min(maxPerWave, quizLeftToday, limit);

  const quizPool = deduped.filter((r) => r.bucket === "quiz_word").map((r) => r.id);
  const vocabPool = deduped.filter((r) => r.bucket !== "quiz_word").map((r) => r.id);

  const quizPick = pickCandidatesEvenly(quizPool, quizQuota);
  const vocabPick = pickCandidatesEvenly(
    vocabPool,
    Math.max(0, limit - quizPick.length),
  );

  return interleave(vocabPick, quizPick).slice(0, limit);
}
