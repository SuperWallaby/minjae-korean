/**
 * EigoChart (ja-en) topic dedup — Azure/hash embeddings, separate index from Kaja vocab pins.
 */
import fs from "node:fs";
import path from "node:path";
import {
  TOPIC_DEDUP_THRESHOLD,
  embedTopicTextsBatch,
  azureEmbeddingsConfigured,
  topicSimilarityMatchesSync,
  isTopicVectorBlockedSync,
  canonicalDedupEntries,
} from "./pin-topic-similarity.mjs";

export { TOPIC_DEDUP_THRESHOLD };

export function jaEnOutDir(root) {
  return (
    (process.env.JA_EN_OUT || "").trim() ||
    path.join(root, ".tmp", "ja-en-samples")
  );
}

export function jaEnIndexPath(outDir) {
  return path.join(outDir, "ja-en-topic-vectors.json");
}

export function jaEnTopicLabel(titleJa, titleEn, id = "") {
  const ja = String(titleJa || "").trim();
  const en = String(titleEn || "").trim();
  if (ja && en) return `${ja} / ${en}`;
  return ja || en || String(id || "").trim();
}

function loadJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return fallback;
  }
}

export function loadJaEnTopicIndex(outDir) {
  const file = jaEnIndexPath(outDir);
  if (!fs.existsSync(file)) return { version: 1, entries: [] };
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!Array.isArray(raw?.entries)) return { version: 1, entries: [] };
    return raw;
  } catch {
    return { version: 1, entries: [] };
  }
}

export function saveJaEnTopicIndex(outDir, data) {
  const file = jaEnIndexPath(outDir);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function loadJaEnPinned(outDir) {
  return loadJson(path.join(outDir, "pinterest-pinned.json"), {});
}

/** Resolve titleJa/titleEn from published catalog or warehouse meta json. */
export function jaEnMetaForId(id, outDir, catalog = null, root = null) {
  const publishedPath = root
    ? path.join(root, "src", "data", "jaPins", "published.json")
    : path.join(path.dirname(outDir), "..", "src", "data", "jaPins", "published.json");
  const cat =
    catalog ||
    loadJson(publishedPath, {});
  const page = (cat.pages || []).find((p) => p.id === id);
  if (page) {
    return {
      titleJa: page.titleJa || "",
      titleEn: page.titleEn || "",
    };
  }
  const metaPath = path.join(outDir, `${id}.json`);
  const meta = loadJson(metaPath, null);
  if (meta) {
    return {
      titleJa: meta.titleJa || "",
      titleEn: meta.titleEn || "",
    };
  }
  return { titleJa: id, titleEn: "" };
}

function warehouseMetaFiles(outDir) {
  if (!fs.existsSync(outDir)) return [];
  return fs
    .readdirSync(outDir)
    .filter((f) => f.endsWith(".json") && !/progress|pinned|results|queue|vectors/i.test(f))
    .map((f) => f.replace(/\.json$/, ""));
}

/**
 * Build vector index from published + pinned + warehouse + optional queue jobs.
 * @param {Array<{id:string,titleJa?:string,titleEn?:string}>} [queueJobs]
 */
export async function syncJaEnTopicIndex(outDir, root, queueJobs = []) {
  const preferAzure = true;
  const data = loadJaEnTopicIndex(outDir);
  const entries = [...(data.entries || [])];
  const known = new Map(
    entries.map((row) => [String(row.topic).toLowerCase(), row]),
  );

  const publishedPath = path.join(root, "src", "data", "jaPins", "published.json");
  const published = loadJson(publishedPath, {});
  const pinned = loadJaEnPinned(outDir);
  const progress = loadJson(path.join(outDir, "progress.json"), {});

  const toAdd = [];
  function pushTopic(titleJa, titleEn, source) {
    const topic = jaEnTopicLabel(titleJa, titleEn);
    if (!topic) return;
    const key = topic.toLowerCase();
    if (known.has(key)) return;
    toAdd.push({ topic, source });
    known.set(key, { topic });
  }

  for (const page of published.pages || []) {
    pushTopic(page.titleJa, page.titleEn, `published:${page.id}`);
  }

  for (const [id, row] of Object.entries(pinned)) {
    const meta = jaEnMetaForId(id, outDir, published, root);
    pushTopic(meta.titleJa || row?.title, meta.titleEn, `pinned:${id}`);
  }

  for (const id of Object.keys(progress?.done || {})) {
    const meta = jaEnMetaForId(id, outDir, published, root);
    pushTopic(meta.titleJa, meta.titleEn, `done:${id}`);
  }

  for (const id of warehouseMetaFiles(outDir)) {
    const meta = jaEnMetaForId(id, outDir, published, root);
    pushTopic(meta.titleJa, meta.titleEn, `warehouse:${id}`);
  }

  for (const job of queueJobs) {
    pushTopic(job.titleJa, job.titleEn, `queue:${job.id}`);
  }

  const BATCH = 64;
  let added = 0;
  for (let i = 0; i < toAdd.length; i += BATCH) {
    const chunk = toAdd.slice(i, i + BATCH);
    const vectors = await embedTopicTextsBatch(
      chunk.map((r) => r.topic),
      preferAzure,
    );
    const backend = preferAzure && azureEmbeddingsConfigured() ? "azure" : "hash";
    for (let j = 0; j < chunk.length; j += 1) {
      entries.push({
        topic: chunk[j].topic,
        vector: vectors[j],
        backend,
        source: chunk[j].source,
        updated_at: Math.floor(Date.now() / 1000),
      });
      added += 1;
    }
    if (added) {
      data.entries = entries;
      saveJaEnTopicIndex(outDir, data);
    }
  }

  return { added, total: entries.length };
}

export function buildJaEnDedupContext(outDir) {
  const pinned = loadJaEnPinned(outDir);
  const topicEntries = canonicalDedupEntries(loadJaEnTopicIndex(outDir).entries || []);
  return {
    pinned,
    topicEntries,
    threshold: TOPIC_DEDUP_THRESHOLD,
  };
}

export function shouldSkipJaEnTopicSync(id, titleJa, titleEn, ctx) {
  const pinId = String(id || "").trim();
  if (ctx?.pinned?.[pinId]) {
    return { skip: true, reason: `already pinned: ${pinId}` };
  }
  const label = jaEnTopicLabel(titleJa, titleEn, pinId);
  if (
    ctx?.topicEntries?.length &&
    isTopicVectorBlockedSync(label, ctx.topicEntries, ctx.threshold)
  ) {
    const matches = topicSimilarityMatchesSync(
      label,
      ctx.topicEntries,
      ctx.threshold,
    );
    const top = matches[0];
    return {
      skip: true,
      reason: top
        ? `topic similar (${top.score.toFixed(3)}): "${top.topic}" [${top.source}]`
        : "topic similar to existing pin",
      match: top,
    };
  }
  return { skip: false };
}

/** Pre-filter job list before image generation. */
export function filterJaEnJobs(jobs, ctx, { bypass = false } = {}) {
  if (bypass) return { kept: jobs, skipped: [] };
  const kept = [];
  const skipped = [];
  for (const job of jobs) {
    const gate = shouldSkipJaEnTopicSync(
      job.id,
      job.titleJa,
      job.titleEn,
      ctx,
    );
    if (gate.skip) {
      skipped.push({ id: job.id, reason: gate.reason });
    } else {
      kept.push(job);
    }
  }
  return { kept, skipped };
}

export function filterJaEnIds(ids, outDir, catalog, ctx) {
  const kept = [];
  const skipped = [];
  for (const id of ids) {
    const meta = jaEnMetaForId(id, outDir, catalog);
    const gate = shouldSkipJaEnTopicSync(id, meta.titleJa, meta.titleEn, ctx);
    if (gate.skip) skipped.push({ id, reason: gate.reason });
    else kept.push(id);
  }
  return { kept, skipped };
}
