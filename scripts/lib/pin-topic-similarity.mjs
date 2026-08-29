/**
 * Pinterest vocab pin topic dedup — embedding similarity at generation time.
 * Mirrors auto-video-korean/src/topic_vectors.py (threshold 0.86, Azure or hash).
 */
import fs from "node:fs";
import path from "node:path";
import {
  buildClusterIndex,
  isClusterPinned,
  pinClusterIds,
  topicClusterKey,
} from "./pin-topic-clusters.mjs";

export const TOPIC_DEDUP_THRESHOLD = 0.86;
const HASH_DIM = 384;

/** Unused catalog titles must not block generation. */
export function isCatalogOnlyDedupSource(source) {
  return String(source || "").startsWith("catalog:");
}

export function filterLiveDedupEntries(entries) {
  return (entries || []).filter((row) => !isCatalogOnlyDedupSource(row?.source));
}

export function indexPath(outDir) {
  return path.join(outDir, "pin-topic-vectors.json");
}

function cleanTopic(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

/** tr- / twin ids — same pin as catalog id. */
export function pinIdFamily(id) {
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

export function cosineSimilarity(a, b) {
  if (!a?.length || a.length !== b?.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    dot += av * bv;
    normA += av * av;
    normB += bv * bv;
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (!Number.isFinite(denom) || denom === 0) return 0;
  return dot / denom;
}

function hashVector(text, dim = HASH_DIM) {
  const vec = new Float32Array(dim);
  const normalized = cleanTopic(text).toLowerCase();
  if (!normalized) return [...vec];
  for (let i = 0; i < Math.max(0, normalized.length - 2); i += 1) {
    const bucket = Math.abs(hashString(normalized.slice(i, i + 3))) % dim;
    vec[bucket] += 1;
  }
  const tokens = normalized.match(/[a-z0-9가-힣]+/g) || [];
  for (const token of tokens) {
    vec[Math.abs(hashString(token)) % dim] += 2;
  }
  let norm = 0;
  for (let i = 0; i < dim; i += 1) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i += 1) vec[i] /= norm;
  }
  return [...vec];
}

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h;
}

function azureSettings() {
  const endpoint = (
    process.env.AZURE_OPENAI_EMBEDDING_ENDPOINT ||
    process.env.AZURE_OPENAI_ENDPOINT ||
    ""
  ).trim().replace(/\/$/, "");
  const key = (
    process.env.AZURE_OPENAI_EMBEDDING_API_KEY ||
    process.env.AZURE_OPENAI_API_KEY ||
    ""
  ).trim();
  const deployment = (
    process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT ||
    process.env.AZURE_OPENAI_DEPLOYMENT_EMBEDDING ||
    "text-embedding-3-small"
  ).trim();
  const apiVersion = (
    process.env.AZURE_OPENAI_API_VERSION_EMBEDDINGS ||
    "2024-08-01-preview"
  ).trim();
  return { endpoint, key, deployment, apiVersion };
}

export function azureEmbeddingsConfigured() {
  const { endpoint, key, deployment } = azureSettings();
  return Boolean(endpoint && key && deployment);
}

async function azureEmbed(text) {
  const { endpoint, key, deployment, apiVersion } = azureSettings();
  const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/embeddings?api-version=${encodeURIComponent(apiVersion)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-key": key },
    body: JSON.stringify({ input: text }),
  });
  if (!res.ok) {
    throw new Error(`Azure Embeddings (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  const vector = data?.data?.[0]?.embedding;
  if (!Array.isArray(vector) || vector.length < 8) {
    throw new Error("Azure Embeddings: empty vector");
  }
  return vector.map(Number);
}

export async function embedTopicText(text, preferAzure = true) {
  const cleaned = cleanTopic(text);
  if (!cleaned) return { vector: hashVector(cleaned), backend: "hash" };
  if (preferAzure && azureEmbeddingsConfigured()) {
    try {
      return { vector: await azureEmbed(cleaned), backend: "azure" };
    } catch {
      /* hash fallback */
    }
  }
  return { vector: hashVector(cleaned), backend: "hash" };
}

/** Batch embed (Azure input array). Returns vectors in same order. */
export async function embedTopicTextsBatch(texts, preferAzure = true) {
  const cleaned = texts.map((t) => cleanTopic(t)).filter(Boolean);
  if (!cleaned.length) return [];
  if (preferAzure && azureEmbeddingsConfigured()) {
    try {
      const { endpoint, key, deployment, apiVersion } = azureSettings();
      const url = `${endpoint}/openai/deployments/${encodeURIComponent(deployment)}/embeddings?api-version=${encodeURIComponent(apiVersion)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": key },
        body: JSON.stringify({ input: cleaned }),
      });
      if (!res.ok) {
        throw new Error(`Azure batch (${res.status})`);
      }
      const data = await res.json();
      const rows = data?.data || [];
      if (rows.length !== cleaned.length) throw new Error("Azure batch size mismatch");
      return rows.map((row) => (row.embedding || []).map(Number));
    } catch {
      /* hash fallback below */
    }
  }
  return cleaned.map((t) => hashVector(t));
}

/** Vector for title — prefer indexed azure row, else hash. */
export function getTitleVector(title, entries = []) {
  const key = cleanTopic(title).toLowerCase();
  if (!key) return hashVector(title);
  for (const row of entries) {
    if (cleanTopic(row?.topic).toLowerCase() === key && Array.isArray(row?.vector)) {
      return row.vector;
    }
  }
  return hashVector(title);
}

export function topicSimilarityMatchesSync(
  title,
  entries,
  threshold = TOPIC_DEDUP_THRESHOLD,
  ignoreTopic = "",
) {
  const cleaned = cleanTopic(title);
  if (!cleaned || !entries?.length) return [];
  const vector = getTitleVector(title, entries);
  const ignoreKey = cleanTopic(ignoreTopic).toLowerCase();
  const matches = [];
  for (const row of entries) {
    const topic = String(row?.topic || "");
    if (!topic) continue;
    if (topic.toLowerCase() === cleaned.toLowerCase()) continue;
    if (ignoreKey && topic.toLowerCase() === ignoreKey) continue;
    const stored = row?.vector;
    if (!Array.isArray(stored) || !stored.length) continue;
    const score = cosineSimilarity(vector, stored);
    if (score >= threshold) {
      matches.push({ topic, score, source: row.source || "" });
    }
  }
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

export function isTopicVectorBlockedSync(
  title,
  entries,
  threshold = TOPIC_DEDUP_THRESHOLD,
) {
  return topicSimilarityMatchesSync(title, entries, threshold).length > 0;
}

export function loadTopicIndex(outDir) {
  const file = indexPath(outDir);
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(raw?.entries)) return { version: 1, entries: [] };
    return raw;
  } catch {
    return { version: 1, entries: [] };
  }
}

export function saveTopicIndex(outDir, data) {
  const file = indexPath(outDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadPinned(outDir) {
  return loadJson(path.join(outDir, "pinterest-pinned.json"), {});
}

export function canonicalDedupEntries(entries = []) {
  const genericHook =
    /^(🗣️|let's practice|save this:|real-life korean|learn korean with)/i;
  return entries.filter((row) => {
    const topic = String(row?.topic || "").trim();
    if (!topic || topic.length < 8) return false;
    if (genericHook.test(topic)) return false;
    const src = String(row?.source || "");
    return (
      src.startsWith("catalog:") ||
      src.startsWith("done:") ||
      src.startsWith("png:") ||
      src.startsWith("scheduled:") ||
      src.startsWith("pinned:") ||
      src.startsWith("review:") ||
      src.startsWith("meta:") ||
      src.startsWith("pass:") ||
      src.startsWith("batch:")
    );
  });
}

export async function topicSimilarityMatches(
  candidate,
  entries,
  threshold = TOPIC_DEDUP_THRESHOLD,
  ignoreTopic = "",
  preferAzure = true,
) {
  const cleaned = cleanTopic(candidate);
  if (!cleaned || !entries?.length) return [];
  const { vector } = await embedTopicText(cleaned, preferAzure);
  const ignoreKey = cleanTopic(ignoreTopic).toLowerCase();
  const matches = [];
  for (const row of entries) {
    const topic = String(row?.topic || "");
    if (!topic) continue;
    if (topic.toLowerCase() === cleaned.toLowerCase()) continue;
    if (ignoreKey && topic.toLowerCase() === ignoreKey) continue;
    const stored = row?.vector;
    if (!Array.isArray(stored) || !stored.length) continue;
    const score = cosineSimilarity(vector, stored);
    if (score >= threshold) matches.push({ topic, score, source: row.source || "" });
  }
  matches.sort((a, b) => b.score - a.score);
  return matches;
}

export async function isTopicTooSimilar(
  candidate,
  entries,
  threshold = TOPIC_DEDUP_THRESHOLD,
) {
  const matches = await topicSimilarityMatches(candidate, entries, threshold);
  return matches.length > 0;
}

/**
 * Build / refresh vector index from pinned + generated + scheduled catalog titles.
 * @param {Record<string, { title?: string }>} catalogById
 */
export async function syncPinTopicIndex(outDir, catalogById = {}, options = {}) {
  const preferAzure = options.preferAzure ?? true;
  const data = loadTopicIndex(outDir);
  const entries = [...(data.entries || [])];
  const known = new Map(
    entries.map((row) => [cleanTopic(row.topic).toLowerCase(), row]),
  );

  const pinned = loadPinned(outDir);
  const progress = loadJson(path.join(outDir, "progress.json"), {});
  const scheduled = loadJson(path.join(outDir, "vocab-x-scheduled.json"), {});

  const toAdd = [];

  function pushTopic(topic, source) {
    const cleaned = cleanTopic(topic);
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (known.has(key)) return;
    toAdd.push({ topic: cleaned, source });
    known.set(key, { topic: cleaned });
  }

  for (const [id, row] of Object.entries(pinned)) {
    const title = catalogById[id]?.title || row?.title;
    pushTopic(title, `pinned:${id}`);
  }

  for (const id of Object.keys(progress?.done || {})) {
    const title = catalogById[id]?.title;
    pushTopic(title, `done:${id}`);
  }

  for (const id of Object.keys(scheduled)) {
    const title = catalogById[id]?.title;
    pushTopic(title, `scheduled:${id}`);
  }

  for (const id of Object.keys(progress?.done || {})) {
    const png = path.join(outDir, `${id}.png`);
    if (fs.existsSync(png)) {
      const title = catalogById[id]?.title;
      pushTopic(title, `png:${id}`);
    }
  }

  // Do NOT index unused catalog titles — they mutual-block siblings before any PNG exists.
  // Opt-in only (e.g. offline audits): options.includeCatalogTitles === true
  if (options.includeCatalogTitles) {
    for (const [id, bundle] of Object.entries(catalogById)) {
      const title = bundle?.title;
      if (title) pushTopic(title, `catalog:${id}`);
    }
  }

  const review = loadJson(path.join(outDir, "pin-review.json"), {});
  for (const [id, entry] of Object.entries(review)) {
    const st = entry?.status;
    if (!["pending", "approved", "regenerating"].includes(st)) continue;
    const title =
      String(entry?.title || "").trim() ||
      catalogById[id]?.title ||
      String(scheduled[id]?.tweetText || "").split("\n")[0].trim();
    if (title) pushTopic(title, `review:${id}`);
  }

  if (options.scanMetaJson && fs.existsSync(outDir)) {
    for (const f of fs.readdirSync(outDir)) {
      if (!f.endsWith(".json")) continue;
      if (/progress|pinned|manifest|wave-/i.test(f)) continue;
      try {
        const meta = JSON.parse(fs.readFileSync(path.join(outDir, f), "utf8"));
        const id = meta?.id || f.replace(/\.json$/, "");
        const title = meta?.titleEn || meta?.title;
        if (title) pushTopic(String(title), `meta:${id}`);
      } catch {
        /* ignore bad meta */
      }
    }
  }

  const BATCH = 64;
  let added = 0;
  for (let i = 0; i < toAdd.length; i += BATCH) {
    const chunk = toAdd.slice(i, i + BATCH);
    const vectors = await embedTopicTextsBatch(
      chunk.map((r) => r.topic),
      preferAzure,
    );
    const backend =
      preferAzure && azureEmbeddingsConfigured() ? "azure" : "hash";
    for (let j = 0; j < chunk.length; j += 1) {
      const row = chunk[j];
      entries.push({
        topic: row.topic,
        vector: vectors[j] || hashVector(row.topic),
        backend,
        source: row.source,
        updated_at: Math.floor(Date.now() / 1000),
      });
      added += 1;
    }
    if (added && (added % 128 === 0 || i + BATCH >= toAdd.length)) {
      data.entries = entries;
      saveTopicIndex(outDir, data);
    }
  }

  if (added && data.entries !== entries) {
    data.entries = entries;
    saveTopicIndex(outDir, data);
  }
  return { added, total: entries.length };
}

export function buildTopicDedupContext(outDir, scheduledIds = [], options = {}) {
  const pinned = loadPinned(outDir);
  const pinnedKeys = Object.keys(pinned);
  const clusterIndex = buildClusterIndex(scheduledIds, pinnedKeys);
  let topicEntries = filterLiveDedupEntries(
    canonicalDedupEntries(loadTopicIndex(outDir).entries || []),
  );
  const mergeFrom = String(options.mergeIndexFrom || "").trim();
  if (mergeFrom) {
    const extra = filterLiveDedupEntries(
      canonicalDedupEntries(loadTopicIndex(mergeFrom).entries || []),
    );
    const seen = new Set(topicEntries.map((r) => cleanTopic(r?.topic).toLowerCase()));
    for (const row of extra) {
      const key = cleanTopic(row?.topic).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      topicEntries.push(row);
    }
  }
  return {
    pinned,
    clusterIndex,
    topicEntries,
    threshold: TOPIC_DEDUP_THRESHOLD,
    outDir,
  };
}

/** Generation-time gate: id family + slug cluster + embedding similarity. */
export async function shouldSkipBundleForTopicDup(bundleId, title, ctx) {
  const id = String(bundleId || "").trim();
  const pinned = ctx?.pinned || {};

  for (const alt of pinIdFamily(id)) {
    if (pinned[alt]) {
      return { skip: true, reason: `family already pinned: ${alt}` };
    }
  }

  if (isClusterPinned(id, pinned, ctx?.clusterIndex)) {
    const cluster = topicClusterKey(id) || "unknown";
    const hit = pinClusterIds(id, ctx.clusterIndex).find((x) => pinned[x]);
    return { skip: true, reason: `topic cluster ${cluster} pinned: ${hit}` };
  }

  const matches = await topicSimilarityMatches(
    title,
    ctx?.topicEntries || [],
    ctx?.threshold ?? TOPIC_DEDUP_THRESHOLD,
  );
  if (matches.length) {
    const top = matches[0];
    return {
      skip: true,
      reason: `topic similar (${top.score.toFixed(3)}): "${top.topic}" [${top.source}]`,
      match: top,
    };
  }

  return { skip: false };
}

/** Sync gate for upload / review (uses indexed title vectors). */
export function shouldSkipBundleForTopicDupSync(bundleId, title, ctx) {
  const id = String(bundleId || "").trim();
  const pinned = ctx?.pinned || {};

  for (const alt of pinIdFamily(id)) {
    if (pinned[alt]) {
      return { skip: true, reason: `family already pinned: ${alt}` };
    }
  }

  if (isClusterPinned(id, pinned, ctx?.clusterIndex)) {
    const cluster = topicClusterKey(id) || "unknown";
    const hit = pinClusterIds(id, ctx.clusterIndex).find((x) => pinned[x]);
    return { skip: true, reason: `topic cluster ${cluster} pinned: ${hit}` };
  }

  const matches = topicSimilarityMatchesSync(
    title,
    ctx?.topicEntries || [],
    ctx?.threshold ?? TOPIC_DEDUP_THRESHOLD,
  );
  if (matches.length) {
    const top = matches[0];
    return {
      skip: true,
      reason: `topic similar (${top.score.toFixed(3)}): "${top.topic}" [${top.source}]`,
      match: top,
    };
  }

  return { skip: false };
}

/** Add a title to in-memory dedup ctx (same batch pass / loop). */
export async function appendTopicToDedupContext(ctx, title, source = "batch") {
  const cleaned = cleanTopic(title);
  if (!cleaned || !ctx) return;
  const key = cleaned.toLowerCase();
  const entries = ctx.topicEntries || [];
  if (entries.some((row) => cleanTopic(row?.topic).toLowerCase() === key)) return;
  const { vector, backend } = await embedTopicText(cleaned, true);
  entries.push({
    topic: cleaned,
    vector,
    backend,
    source,
  });
  ctx.topicEntries = entries;
}

/** Persist one title into pin-topic-vectors.json (after successful generation). */
export async function registerTopicInIndex(outDir, title, source) {
  const cleaned = cleanTopic(title);
  if (!cleaned) return false;
  const data = loadTopicIndex(outDir);
  const entries = [...(data.entries || [])];
  const key = cleaned.toLowerCase();
  if (entries.some((row) => cleanTopic(row?.topic).toLowerCase() === key)) {
    return false;
  }
  const { vector, backend } = await embedTopicText(cleaned, true);
  entries.push({
    topic: cleaned,
    vector,
    backend,
    source,
    updated_at: Math.floor(Date.now() / 1000),
  });
  data.entries = entries;
  saveTopicIndex(outDir, data);
  return true;
}

/** Generation/upload gate with optional in-pass ctx reservation. */
export async function topicDedupGate(bundleId, title, ctx, opts = {}) {
  let gate = shouldSkipBundleForTopicDupSync(bundleId, title, ctx);
  if (!gate.skip) {
    gate = await shouldSkipBundleForTopicDup(bundleId, title, ctx);
  }
  if (!gate.skip && opts.reserveOnPass) {
    const source = opts.reserveSource || `pass:${bundleId}`;
    await appendTopicToDedupContext(ctx, title, source);
    const persistTo =
      String(opts.persistReserveTo || ctx?.outDir || "").trim() || "";
    if (persistTo) {
      // Disk reserve so concurrent batch processes block on in-flight titles.
      await registerTopicInIndex(persistTo, title, source);
    }
  }
  return gate;
}
