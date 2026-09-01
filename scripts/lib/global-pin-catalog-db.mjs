/**
 * Global pin catalog source of truth (SQLite).
 * published.json is a deploy snapshot only — always export from the DB.
 *
 *   import { openCatalogDb, upsertPage, exportPublishedJson } from "./global-pin-catalog-db.mjs";
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

export const LANG_ORDER = ["es", "fr", "de", "it", "ar", "ja", "ko", "zh"];
export const LANG_NAME = {
  es: "Spanish",
  fr: "French",
  de: "German",
  it: "Italian",
  ar: "Arabic",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};

const WORD_TTS = [
  ["ttsUrl", "tts_url"],
  ["ttsProvider", "tts_provider"],
  ["ttsMaleUrl", "tts_male_url"],
  ["ttsLatam", "tts_latam"],
  ["ttsEs", "tts_es"],
  ["ttsFr", "tts_fr"],
  ["ttsCa", "tts_ca"],
  ["ttsFemaleCn", "tts_female_cn"],
  ["ttsMaleCn", "tts_male_cn"],
  ["ttsFemaleTw", "tts_female_tw"],
  ["ttsMaleTw", "tts_male_tw"],
  ["ttsFemaleHk", "tts_female_hk"],
  ["ttsMaleHk", "tts_male_hk"],
];

const EX_TTS = [
  ["ttsUrl", "tts_url"],
  ["ttsProvider", "tts_provider"],
  ["ttsMaleUrl", "tts_male_url"],
  ["ttsLatam", "tts_latam"],
  ["ttsEs", "tts_es"],
  ["ttsFr", "tts_fr"],
  ["ttsCa", "tts_ca"],
];

export function catalogDbPath(root) {
  return path.join(root, "src", "data", "globalPins", "catalog.sqlite");
}

export function publishedJsonPath(root) {
  return path.join(root, "src", "data", "globalPins", "published.json");
}

export function openCatalogDb(root) {
  const dbPath = catalogDbPath(root);
  mkdirSync(path.dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec("PRAGMA journal_mode=WAL");
  db.exec("PRAGMA busy_timeout=15000");
  db.exec("PRAGMA foreign_keys=ON");
  db.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS pages (
      id TEXT PRIMARY KEY,
      lang TEXT NOT NULL,
      lang_name TEXT,
      title_en TEXT,
      slug TEXT,
      image_path TEXT,
      partner TEXT,
      description TEXT,
      topic_slug TEXT,
      published_at TEXT,
      explanation_en TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS words (
      page_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      english TEXT,
      target TEXT,
      romanization TEXT,
      tts_url TEXT,
      tts_provider TEXT,
      tts_male_url TEXT,
      tts_latam TEXT,
      tts_es TEXT,
      tts_female_cn TEXT,
      tts_male_cn TEXT,
      tts_female_tw TEXT,
      tts_male_tw TEXT,
      tts_female_hk TEXT,
      tts_male_hk TEXT,
      PRIMARY KEY (page_id, idx),
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS examples (
      page_id TEXT NOT NULL,
      idx INTEGER NOT NULL,
      target TEXT,
      english TEXT,
      tts_url TEXT,
      tts_provider TEXT,
      tts_male_url TEXT,
      tts_latam TEXT,
      tts_es TEXT,
      PRIMARY KEY (page_id, idx),
      FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_pages_lang ON pages(lang);
  `);
  ensureColumn(db, "words", "tts_male_url", "TEXT");
  ensureColumn(db, "examples", "tts_male_url", "TEXT");
  ensureColumn(db, "words", "tts_fr", "TEXT");
  ensureColumn(db, "words", "tts_ca", "TEXT");
  ensureColumn(db, "examples", "tts_fr", "TEXT");
  ensureColumn(db, "examples", "tts_ca", "TEXT");
  ensureColumn(db, "pages", "reading_json", "TEXT");
  return db;
}

function ensureColumn(db, table, col, type) {
  const cols = db
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((r) => r.name);
  if (!cols.includes(col)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${col} ${type}`);
  }
}

function lemmaKey(row) {
  return `${String(row?.target || "")}\n${String(row?.english || "")}`;
}

function pickTts(src, pairs) {
  const out = {};
  if (!src) return out;
  for (const [js] of pairs) {
    const v = src[js];
    if (v != null && String(v).trim()) out[js] = v;
  }
  return out;
}

function mergeTts(prev, next, pairs) {
  if (lemmaKey(prev) !== lemmaKey(next)) return { ...next };
  return { ...next, ...pickTts(prev, pairs), ...pickTts(next, pairs) };
}

function wordFromRow(r) {
  const w = {
    english: r.english || "",
    target: r.target || "",
    romanization: r.romanization || "",
  };
  for (const [js, col] of WORD_TTS) {
    if (r[col]) w[js] = r[col];
  }
  return w;
}

function exampleFromRow(r) {
  const e = {
    target: r.target || "",
    english: r.english || "",
  };
  for (const [js, col] of EX_TTS) {
    if (r[col]) e[js] = r[col];
  }
  return e;
}

function pageFromRows(p, words, examples) {
  const page = {
    id: p.id,
    lang: p.lang,
    langName: p.lang_name || "",
    titleEn: p.title_en || "",
    slug: p.slug || "",
    imagePath: p.image_path || "",
    words,
    partner: p.partner || "preply",
    description: p.description || "",
  };
  if (p.topic_slug) page.topicSlug = p.topic_slug;
  if (p.published_at) page.publishedAt = p.published_at;
  if (p.explanation_en) page.explanationEn = p.explanation_en;
  if (p.reading_json) {
    try {
      page.reading = JSON.parse(p.reading_json);
    } catch {
      /* ignore */
    }
  }
  if (examples.length) page.examples = examples;
  return page;
}

export function pageCount(db) {
  return Number(db.prepare("SELECT COUNT(*) AS n FROM pages").get()?.n || 0);
}

export function getPage(db, id) {
  const p = db.prepare("SELECT * FROM pages WHERE id = ?").get(id);
  if (!p) return null;
  const words = db
    .prepare("SELECT * FROM words WHERE page_id = ? ORDER BY idx")
    .all(id)
    .map(wordFromRow);
  const examples = db
    .prepare("SELECT * FROM examples WHERE page_id = ? ORDER BY idx")
    .all(id)
    .map(exampleFromRow);
  return pageFromRows(p, words, examples);
}

export function listPages(db, opts = {}) {
  let sql = "SELECT id FROM pages";
  const args = [];
  const where = [];
  if (opts.lang) {
    where.push("lang = ?");
    args.push(opts.lang);
  }
  if (opts.id) {
    where.push("id = ?");
    args.push(opts.id);
  }
  if (where.length) sql += ` WHERE ${where.join(" AND ")}`;
  sql += " ORDER BY lang, id";
  return db
    .prepare(sql)
    .all(...args)
    .map((r) => getPage(db, r.id));
}

export function getCatalog(db) {
  const site =
    db.prepare("SELECT value FROM meta WHERE key = 'site'").get()?.value ||
    "https://getpronounce.net";
  const version = Number(
    db.prepare("SELECT value FROM meta WHERE key = 'version'").get()?.value ||
      1,
  );
  const pages = listPages(db);
  const langSet = new Set(pages.map((p) => p.lang));
  const languages = LANG_ORDER.filter((c) => langSet.has(c)).map((code) => ({
    code,
    name: LANG_NAME[code] || code,
  }));
  for (const code of langSet) {
    if (!languages.some((l) => l.code === code)) {
      languages.push({ code, name: LANG_NAME[code] || code });
    }
  }
  pages.sort((a, b) => {
    const ia = LANG_ORDER.indexOf(a.lang);
    const ib = LANG_ORDER.indexOf(b.lang);
    if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.id.localeCompare(b.id);
  });
  return {
    version,
    generatedAt: new Date().toISOString(),
    site,
    languages,
    pages,
  };
}

function bindWord(pageId, idx, w) {
  return {
    page_id: pageId,
    idx,
    english: w.english || "",
    target: w.target || "",
    romanization: w.romanization || "",
    tts_url: w.ttsUrl || null,
    tts_provider: w.ttsProvider || null,
    tts_male_url: w.ttsMaleUrl || null,
    tts_latam: w.ttsLatam || null,
    tts_es: w.ttsEs || null,
    tts_fr: w.ttsFr || null,
    tts_ca: w.ttsCa || null,
    tts_female_cn: w.ttsFemaleCn || null,
    tts_male_cn: w.ttsMaleCn || null,
    tts_female_tw: w.ttsFemaleTw || null,
    tts_male_tw: w.ttsMaleTw || null,
    tts_female_hk: w.ttsFemaleHk || null,
    tts_male_hk: w.ttsMaleHk || null,
  };
}

function bindExample(pageId, idx, e) {
  return {
    page_id: pageId,
    idx,
    target: e.target || "",
    english: e.english || "",
    tts_url: e.ttsUrl || null,
    tts_provider: e.ttsProvider || null,
    tts_male_url: e.ttsMaleUrl || null,
    tts_latam: e.ttsLatam || null,
    tts_es: e.ttsEs || null,
    tts_fr: e.ttsFr || null,
    tts_ca: e.ttsCa || null,
  };
}

/**
 * Insert/update one page. Never deletes other pages.
 * TTS on matching lemmas is preserved unless the new row already has that field.
 */
export function upsertPage(db, page, opts = {}) {
  const preserveTts = opts.preserveTts !== false;
  const prev = preserveTts ? getPage(db, page.id) : null;
  const prevWords = prev?.words || [];
  const prevEx = prev?.examples || [];

  const words = (page.words || []).map((w, i) => {
    const byIdx = prevWords[i];
    const byLemma =
      prevWords.find((p) => lemmaKey(p) === lemmaKey(w)) || byIdx;
    return mergeTts(byLemma, w, WORD_TTS);
  });
  // Omit `examples` to keep previous rows (publish chart meta without wiping enrich).
  // Pass `examples: []` only when intentionally clearing.
  const examples =
    page.examples === undefined
      ? prevEx
      : (page.examples || []).map((e, i) => {
          const byIdx = prevEx[i];
          const byLemma =
            prevEx.find((p) => lemmaKey(p) === lemmaKey(e)) || byIdx;
          return mergeTts(byLemma, e, EX_TTS);
        });

  const explanationEn =
    page.explanationEn !== undefined
      ? page.explanationEn
      : prev?.explanationEn || null;

  const readingJson =
    page.reading !== undefined
      ? JSON.stringify(page.reading)
      : prev?.reading
        ? JSON.stringify(prev.reading)
        : null;

  const now = new Date().toISOString();
  db.exec("BEGIN");
  try {
    db.prepare(
      `INSERT INTO pages (
        id, lang, lang_name, title_en, slug, image_path, partner,
        description, topic_slug, published_at, explanation_en, reading_json, updated_at
      ) VALUES (
        @id, @lang, @lang_name, @title_en, @slug, @image_path, @partner,
        @description, @topic_slug, @published_at, @explanation_en, @reading_json, @updated_at
      )
      ON CONFLICT(id) DO UPDATE SET
        lang=excluded.lang,
        lang_name=excluded.lang_name,
        title_en=excluded.title_en,
        slug=excluded.slug,
        image_path=excluded.image_path,
        partner=excluded.partner,
        description=COALESCE(excluded.description, pages.description),
        topic_slug=excluded.topic_slug,
        published_at=COALESCE(excluded.published_at, pages.published_at),
        explanation_en=COALESCE(excluded.explanation_en, pages.explanation_en),
        reading_json=COALESCE(excluded.reading_json, pages.reading_json),
        updated_at=excluded.updated_at`,
    ).run({
      id: page.id,
      lang: page.lang,
      lang_name: page.langName || "",
      title_en: page.titleEn || "",
      slug: page.slug || "",
      image_path: page.imagePath || "",
      partner: page.partner || "preply",
      description: page.description || null,
      topic_slug: page.topicSlug || null,
      published_at: page.publishedAt || null,
      explanation_en: explanationEn,
      reading_json: readingJson,
      updated_at: now,
    });

    db.prepare("DELETE FROM words WHERE page_id = ?").run(page.id);
    db.prepare("DELETE FROM examples WHERE page_id = ?").run(page.id);

    const insW = db.prepare(
      `INSERT INTO words (
        page_id, idx, english, target, romanization,
        tts_url, tts_provider, tts_male_url, tts_latam, tts_es,
        tts_fr, tts_ca,
        tts_female_cn, tts_male_cn, tts_female_tw, tts_male_tw,
        tts_female_hk, tts_male_hk
      ) VALUES (
        @page_id, @idx, @english, @target, @romanization,
        @tts_url, @tts_provider, @tts_male_url, @tts_latam, @tts_es,
        @tts_fr, @tts_ca,
        @tts_female_cn, @tts_male_cn, @tts_female_tw, @tts_male_tw,
        @tts_female_hk, @tts_male_hk
      )`,
    );
    words.forEach((w, i) => insW.run(bindWord(page.id, i, w)));

    const insE = db.prepare(
      `INSERT INTO examples (
        page_id, idx, target, english, tts_url, tts_provider, tts_male_url,
        tts_latam, tts_es, tts_fr, tts_ca
      ) VALUES (
        @page_id, @idx, @target, @english, @tts_url, @tts_provider, @tts_male_url,
        @tts_latam, @tts_es, @tts_fr, @tts_ca
      )`,
    );
    examples.forEach((e, i) => insE.run(bindExample(page.id, i, e)));

    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
}

export function importPublishedJson(db, jsonPath, opts = {}) {
  if (!existsSync(jsonPath)) {
    throw new Error(`missing ${jsonPath}`);
  }
  const catalog = JSON.parse(readFileSync(jsonPath, "utf8"));
  if (catalog?.site) {
    db.prepare(
      "INSERT INTO meta(key,value) VALUES('site', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).run(String(catalog.site));
  }
  if (catalog?.version != null) {
    db.prepare(
      "INSERT INTO meta(key,value) VALUES('version', ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).run(String(catalog.version));
  }
  const pages = catalog.pages || [];
  for (const page of pages) {
    upsertPage(db, page, { preserveTts: !opts.replace });
  }
  return { pages: pages.length, dbPages: pageCount(db) };
}

export function ensureCatalogImported(db, jsonPath) {
  if (pageCount(db) > 0) return { imported: false, pages: pageCount(db) };
  if (!existsSync(jsonPath)) return { imported: false, pages: 0 };
  const r = importPublishedJson(db, jsonPath);
  return { imported: true, pages: r.dbPages };
}

export function exportPublishedJson(db, jsonPath) {
  const catalog = getCatalog(db);
  mkdirSync(path.dirname(jsonPath), { recursive: true });
  const tmp = `${jsonPath}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(catalog, null, 2)}\n`);
  renameSync(tmp, jsonPath);
  return { pages: catalog.pages.length, path: jsonPath };
}

function hasTtsUrl(root, url) {
  if (!url?.trim()) return false;
  if (/^https?:\/\//i.test(url)) return true;
  const rel = String(url).replace(/^\//, "");
  return (
    existsSync(path.join(root, "public", rel)) ||
    existsSync(path.join(root, rel))
  );
}

export function pageNeedsGeneralEnrich(root, page) {
  if (page.lang === "zh") return false;
  if (page.reading) return false;
  if (!(page.examples || []).length || !page.explanationEn) return true;
  const wordNeed = (w) => {
    if (!w.target?.trim()) return false;
    if (page.lang === "es") {
      return (
        !hasTtsUrl(root, w.ttsLatam || w.ttsUrl) || !hasTtsUrl(root, w.ttsEs)
      );
    }
    if (page.lang === "fr") {
      return (
        !hasTtsUrl(root, w.ttsFr || w.ttsUrl) || !hasTtsUrl(root, w.ttsCa)
      );
    }
    if (page.lang === "ko") {
      return !hasTtsUrl(root, w.ttsUrl) || !hasTtsUrl(root, w.ttsMaleUrl);
    }
    return !hasTtsUrl(root, w.ttsUrl);
  };
  const exNeed = (e) => {
    if (!e.target?.trim()) return false;
    if (page.lang === "es") {
      return (
        !hasTtsUrl(root, e.ttsLatam || e.ttsUrl) || !hasTtsUrl(root, e.ttsEs)
      );
    }
    if (page.lang === "fr") {
      return (
        !hasTtsUrl(root, e.ttsFr || e.ttsUrl) || !hasTtsUrl(root, e.ttsCa)
      );
    }
    if (page.lang === "ko") {
      return !hasTtsUrl(root, e.ttsUrl) || !hasTtsUrl(root, e.ttsMaleUrl);
    }
    return !hasTtsUrl(root, e.ttsUrl);
  };
  if ((page.words || []).some(wordNeed)) return true;
  if ((page.examples || []).some(exNeed)) return true;
  return false;
}

export function withCatalogDb(root, fn) {
  const db = openCatalogDb(root);
  try {
    ensureCatalogImported(db, publishedJsonPath(root));
    return fn(db);
  } finally {
    db.close();
  }
}

export function loadGlobalPinCatalog(root) {
  return withCatalogDb(root, (db) => getCatalog(db));
}

export function snapshotCatalogToJson(root) {
  return withCatalogDb(root, (db) =>
    exportPublishedJson(db, publishedJsonPath(root)),
  );
}

export function enrichBacklogCount(root) {
  return withCatalogDb(root, (db) =>
    listPages(db).filter((p) => pageNeedsGeneralEnrich(root, p)).length,
  );
}

export function esPageIds(root) {
  return withCatalogDb(root, (db) =>
    listPages(db, { lang: "es" }).map((p) => p.id),
  );
}

export function catalogStatus(db) {
  const pages = pageCount(db);
  const langs = db
    .prepare("SELECT lang, COUNT(*) AS n FROM pages GROUP BY lang ORDER BY lang")
    .all();
  const zhFull = db
    .prepare(
      `SELECT COUNT(*) AS n FROM pages p
       WHERE p.lang = 'zh'
         AND EXISTS (SELECT 1 FROM words w WHERE w.page_id = p.id)
         AND NOT EXISTS (
           SELECT 1 FROM words w WHERE w.page_id = p.id AND (
             w.tts_female_cn IS NULL OR w.tts_female_cn = '' OR
             w.tts_male_cn IS NULL OR w.tts_male_cn = '' OR
             w.tts_female_tw IS NULL OR w.tts_female_tw = '' OR
             w.tts_male_tw IS NULL OR w.tts_male_tw = '' OR
             w.tts_female_hk IS NULL OR w.tts_female_hk = '' OR
             w.tts_male_hk IS NULL OR w.tts_male_hk = ''
           )
         )`,
    )
    .get()?.n;
  const zhPages = db
    .prepare("SELECT COUNT(*) AS n FROM pages WHERE lang = 'zh'")
    .get()?.n;
  const zhWordsTotal = db
    .prepare(
      `SELECT COUNT(*) AS n FROM words w
       JOIN pages p ON p.id = w.page_id WHERE p.lang = 'zh'`,
    )
    .get()?.n;
  const zhWordsFull = db
    .prepare(
      `SELECT COUNT(*) AS n FROM words w
       JOIN pages p ON p.id = w.page_id
       WHERE p.lang = 'zh'
         AND w.tts_female_cn IS NOT NULL AND w.tts_female_cn != ''
         AND w.tts_male_cn IS NOT NULL AND w.tts_male_cn != ''
         AND w.tts_female_tw IS NOT NULL AND w.tts_female_tw != ''
         AND w.tts_male_tw IS NOT NULL AND w.tts_male_tw != ''
         AND w.tts_female_hk IS NOT NULL AND w.tts_female_hk != ''
         AND w.tts_male_hk IS NOT NULL AND w.tts_male_hk != ''`,
    )
    .get()?.n;
  return {
    pages,
    langs,
    zhFull: Number(zhFull || 0),
    zhPages: Number(zhPages || 0),
    zhWordsFull: Number(zhWordsFull || 0),
    zhWordsTotal: Number(zhWordsTotal || 0),
  };
}
