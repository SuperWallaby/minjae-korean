/**
 * Upload expression-format PNGs that lack scheduled imageUrl (for SEO publish).
 *
 *   npx tsx scripts/upload-expr-seo-images.ts
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ALL_VOCAB_BUNDLES } from "../src/lib/vocabInfographic/bundle-catalog.ts";
import { registerVocabXForReview } from "./vocab-x-schedule-post.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, ".tmp/vocab-infographic-gen");
const SCHEDULED = path.join(OUT, "vocab-x-scheduled.json");
const EXPR = new Set([
  "phrase_stack",
  "concept_rows",
  "topik_upgrade",
  "similar_split",
]);

async function main() {
  const { loadEnvLocal } = await import("./lib/env_local.mjs");
  loadEnvLocal(ROOT);

  const scheduled = JSON.parse(fs.readFileSync(SCHEDULED, "utf8")) as Record<
    string,
    { imageUrl?: string }
  >;
  const need = ALL_VOCAB_BUNDLES.filter(
    (b) =>
      EXPR.has(b.format) &&
      fs.existsSync(path.join(OUT, `${b.id}.png`)) &&
      !scheduled[b.id]?.imageUrl,
  );

  console.log(`need upload: ${need.length}`);
  let ok = 0;
  let fail = 0;
  for (const b of need) {
    process.stdout.write(`→ ${b.id} ... `);
    try {
      const r = await registerVocabXForReview({
        bundleId: b.id,
        skipIfRegistered: false,
      });
      if (r.skipped) {
        console.log(`skip ${(r as { reason?: string }).reason}`);
      } else {
        console.log(`ok`);
        ok += 1;
      }
    } catch (e) {
      console.log(`FAIL ${e instanceof Error ? e.message : e}`);
      fail += 1;
    }
  }
  console.log(JSON.stringify({ ok, fail, remainingAttempted: need.length }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
