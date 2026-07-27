/**
 * Enrich only expression-format vocab SEO pages.
 *
 *   npx tsx scripts/enrich-expr-seo-pages.ts
 *   npx tsx scripts/enrich-expr-seo-pages.ts --limit 10
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLISHED = path.join(ROOT, "src/data/vocabInfographic/published.json");
const EXPR = new Set([
  "phrase_stack",
  "concept_rows",
  "topik_upgrade",
  "similar_split",
]);

const limitIdx = process.argv.indexOf("--limit");
const limit =
  limitIdx >= 0 && process.argv[limitIdx + 1]
    ? Math.max(0, Number(process.argv[limitIdx + 1]) || 0)
    : 0;

const file = JSON.parse(readFileSync(PUBLISHED, "utf8")) as {
  pages: Array<{
    bundleId: string;
    format: string;
    explanationEn?: string;
    examples?: unknown[];
    words: Array<{ hangul?: string; ttsUrl?: string }>;
  }>;
};

let ids = file.pages
  .filter((p) => EXPR.has(p.format))
  .filter(
    (p) =>
      !p.explanationEn ||
      !p.examples?.length ||
      p.words.some((w) => w.hangul && !w.ttsUrl),
  )
  .map((p) => p.bundleId);

if (limit > 0) ids = ids.slice(0, limit);

console.log(`[enrich-expr] ${ids.length} pages`);
let ok = 0;
let fail = 0;
for (let i = 0; i < ids.length; i += 1) {
  const id = ids[i]!;
  console.log(`\n===== [${i + 1}/${ids.length}] ${id} =====`);
  const r = spawnSync(
    "npx",
    ["tsx", "scripts/enrich-vocab-seo-pages.ts", "--id", id],
    { cwd: ROOT, stdio: "inherit", env: process.env },
  );
  if (r.status === 0) ok += 1;
  else fail += 1;
}
console.log(JSON.stringify({ ok, fail, total: ids.length }));
process.exit(fail ? 1 : 0);
