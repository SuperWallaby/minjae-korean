#!/usr/bin/env node
/**
 * Global pin catalog SQLite CLI (pipelines must use this, not raw published.json).
 *
 *   node scripts/global-pin-catalog-db.mjs import|export|status
 *   node scripts/global-pin-catalog-db.mjs zh-progress
 *   node scripts/global-pin-catalog-db.mjs zh-words
 *   node scripts/global-pin-catalog-db.mjs enrich-backlog
 *   node scripts/global-pin-catalog-db.mjs es-ids
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  catalogDbPath,
  catalogStatus,
  enrichBacklogCount,
  ensureCatalogImported,
  esPageIds,
  exportPublishedJson,
  importPublishedJson,
  openCatalogDb,
  publishedJsonPath,
} from "./lib/global-pin-catalog-db.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cmd = process.argv[2] || "status";
const jsonPath = publishedJsonPath(ROOT);

if (cmd === "enrich-backlog") {
  console.log(String(enrichBacklogCount(ROOT)));
  process.exit(0);
}
if (cmd === "es-ids") {
  for (const id of esPageIds(ROOT)) console.log(id);
  process.exit(0);
}

const db = openCatalogDb(ROOT);
try {
  if (cmd === "import") {
    const r = importPublishedJson(db, jsonPath);
    console.log(`imported json pages=${r.pages} db pages=${r.dbPages}`);
    console.log(`db ${catalogDbPath(ROOT)}`);
  } else if (cmd === "export") {
    ensureCatalogImported(db, jsonPath);
    const r = exportPublishedJson(db, jsonPath);
    console.log(`exported pages=${r.pages} → ${r.path}`);
  } else if (cmd === "status") {
    ensureCatalogImported(db, jsonPath);
    const s = catalogStatus(db);
    console.log(`db ${catalogDbPath(ROOT)}`);
    console.log(
      `pages ${s.pages}  zh-full ${s.zhFull}/${s.zhPages}  zh-words ${s.zhWordsFull}/${s.zhWordsTotal}`,
    );
    for (const row of s.langs) console.log(`  ${row.lang}: ${row.n}`);
  } else if (cmd === "zh-progress") {
    ensureCatalogImported(db, jsonPath);
    const s = catalogStatus(db);
    console.log(`${s.zhFull}/${s.zhPages}`);
  } else if (cmd === "zh-words") {
    ensureCatalogImported(db, jsonPath);
    const s = catalogStatus(db);
    console.log(
      JSON.stringify({
        pages: s.zhFull,
        words: s.zhWordsFull,
        wordsTotal: s.zhWordsTotal,
      }),
    );
  } else {
    console.error(
      "usage: import | export | status | zh-progress | zh-words | enrich-backlog | es-ids",
    );
    process.exit(1);
  }
} finally {
  db.close();
}
