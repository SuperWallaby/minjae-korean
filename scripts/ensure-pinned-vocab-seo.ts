#!/usr/bin/env npx tsx
/**
 * Ensure every previously Pinterest-pinned vocab chart has a SEO page on catalog.
 *
 * Pipeline:
 *   1) Audit pinned vs published.json
 *   2) R2-upload branded PNG for pinned rows missing imageUrl (no X queue)
 *   3) yarn vocab:publish → published.json
 *   4) Optional Azure copy enrich for pinned pages missing explanation
 *
 *   npx tsx scripts/ensure-pinned-vocab-seo.ts --audit
 *   npx tsx scripts/ensure-pinned-vocab-seo.ts
 *   npx tsx scripts/ensure-pinned-vocab-seo.ts --no-enrich
 *   npx tsx scripts/ensure-pinned-vocab-seo.ts --enrich-limit 20
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  vocabSeoCanonicalUrl,
  vocabSeoPath,
  vocabSeoSiteBaseUrl,
} from "../src/lib/vocabInfographic/seo";
import type { VocabSeoPublishedFile } from "../src/lib/vocabInfographic/seoTypes";
import { loadEnvLocal } from "./lib/env_local.mjs";
import { ensureVocabScheduledImage } from "./vocab-x-schedule-post.ts";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, ".tmp/vocab-infographic-gen");
const PINNED_PATH = path.join(OUT, "pinterest-pinned.json");
const SCHEDULED_PATH = path.join(OUT, "vocab-x-scheduled.json");
const PUBLISHED_PATH = path.join(
  ROOT,
  "src/data/vocabInfographic/published.json",
);
const REPORT_DIR = path.join(OUT, "logs");

type ScheduledEntry = {
  imageUrl?: string;
  imageThumbUrl?: string;
};

function parseArgs(argv: string[]) {
  let auditOnly = false;
  let noEnrich = false;
  let enrichLimit = 0;
  let skipUpload = false;
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === "--audit") auditOnly = true;
    else if (a === "--no-enrich") noEnrich = true;
    else if (a === "--skip-upload") skipUpload = true;
    else if (a === "--enrich-limit" && argv[i + 1]) {
      enrichLimit = Math.max(0, Number(argv[++i]) || 0);
    }
  }
  return { auditOnly, noEnrich, enrichLimit, skipUpload };
}

function loadJson<T>(file: string, fallback: T): T {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

function audit() {
  const pinned = loadJson<Record<string, { link?: string; at?: string }>>(
    PINNED_PATH,
    {},
  );
  const scheduled = loadJson<Record<string, ScheduledEntry>>(SCHEDULED_PATH, {});
  const published = loadJson<VocabSeoPublishedFile>(PUBLISHED_PATH, {
    generatedAt: "",
    pages: [],
  });
  const byId = new Map((published.pages || []).map((p) => [p.bundleId, p]));

  const missingSeo: string[] = [];
  const missingImageUrl: string[] = [];
  const needCopy: string[] = [];
  const withSeo: Array<{
    bundleId: string;
    path: string;
    url: string;
    previousLink: string;
  }> = [];

  for (const bundleId of Object.keys(pinned).sort()) {
    const page = byId.get(bundleId);
    const s = scheduled[bundleId];
    if (!String(s?.imageUrl || "").trim()) missingImageUrl.push(bundleId);
    if (!page) {
      missingSeo.push(bundleId);
      continue;
    }
    if (!page.explanationEn || !(page.examples && page.examples.length >= 2)) {
      needCopy.push(bundleId);
    }
    withSeo.push({
      bundleId,
      path: vocabSeoPath(page.bundleId, page.slug),
      url: vocabSeoCanonicalUrl(
        vocabSeoSiteBaseUrl(),
        page.bundleId,
        page.slug,
      ),
      previousLink: String(pinned[bundleId]?.link || ""),
    });
  }

  return {
    pinnedTotal: Object.keys(pinned).length,
    publishedTotal: byId.size,
    withSeo: withSeo.length,
    missingSeo,
    missingImageUrl,
    needCopy,
    withSeoRows: withSeo,
    generatedAt: published.generatedAt,
  };
}

async function main() {
  loadEnvLocal(ROOT);
  const { auditOnly, noEnrich, enrichLimit, skipUpload } = parseArgs(
    process.argv.slice(2),
  );

  console.log("\n==> ensure-pinned-vocab-seo");
  let a = audit();
  console.log(
    JSON.stringify(
      {
        pinnedTotal: a.pinnedTotal,
        publishedTotal: a.publishedTotal,
        withSeo: a.withSeo,
        missingSeo: a.missingSeo.length,
        missingImageUrl: a.missingImageUrl.length,
        needCopyEnrich: a.needCopy.length,
        missingSeoSample: a.missingSeo.slice(0, 10),
      },
      null,
      2,
    ),
  );

  if (auditOnly) {
    writeReport(a, { phase: "audit" });
    return;
  }

  // 1) R2 for pinned without imageUrl (required for publish)
  const needUpload = a.missingImageUrl.filter((id) =>
    existsSync(path.join(OUT, `${id}.png`)),
  );
  if (!skipUpload && needUpload.length) {
    console.log(`\n==> R2 upload for ${needUpload.length} pinned (no imageUrl)`);
    let upOk = 0;
    let upFail = 0;
    for (const id of needUpload) {
      let done = false;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const r = await ensureVocabScheduledImage({ bundleId: id });
          console.log(
            `  ${r.skipped ? "skip" : "up"} ${id} ${r.imageUrl.slice(0, 72)}…`,
          );
          upOk += 1;
          done = true;
          break;
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error(`  FAIL ${id} (attempt ${attempt}/3):`, msg);
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 1500 * attempt));
          }
        }
      }
      if (!done) upFail += 1;
    }
    console.log(`  uploaded ok=${upOk} fail=${upFail}`);
  } else if (needUpload.length && skipUpload) {
    console.log(`\n==> skip upload (${needUpload.length} still missing imageUrl)`);
  }

  // 2) Publish catalog
  console.log("\n==> yarn vocab:publish");
  execFileSync("yarn", ["vocab:publish"], { cwd: ROOT, stdio: "inherit" });

  a = audit();
  console.log(
    `\n==> after publish: withSeo=${a.withSeo}/${a.pinnedTotal} missingSeo=${a.missingSeo.length} needCopy=${a.needCopy.length}`,
  );

  // 3) Azure copy enrich for pinned pages lacking explanation
  if (!noEnrich && a.needCopy.length) {
    const enrichArgs = [
      "vocab:enrich",
      "--",
      "--copy-only",
      "--pinned-only",
    ];
    if (enrichLimit > 0) {
      enrichArgs.push("--limit", String(enrichLimit));
    }
    console.log(`\n==> yarn ${enrichArgs.join(" ")}`);
    execFileSync("yarn", enrichArgs, { cwd: ROOT, stdio: "inherit" });
    a = audit();
  } else if (noEnrich) {
    console.log("\n==> enrich skipped (--no-enrich)");
  }

  const report = writeReport(a, {
    phase: "done",
    noEnrich,
    enrichLimit,
  });
  console.log(`\nReport: ${report}`);
  console.log(
    `Pinned SEO ready: ${a.withSeo}/${a.pinnedTotal} (missing ${a.missingSeo.length})`,
  );
  if (a.missingSeo.length) {
    console.error(
      "Still missing SEO for:",
      a.missingSeo.slice(0, 20).join(", "),
    );
    process.exitCode = 1;
  } else {
    console.log(
      "All pinned charts have /vocab pages in published.json — deploy then edit Pinterest destinations.",
    );
  }
}

function writeReport(
  a: ReturnType<typeof audit>,
  meta: Record<string, unknown>,
) {
  mkdirSync(REPORT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(REPORT_DIR, `ensure-pinned-seo-${stamp}.json`);
  const payload = {
    at: new Date().toISOString(),
    ...meta,
    pinnedTotal: a.pinnedTotal,
    publishedTotal: a.publishedTotal,
    withSeo: a.withSeo,
    missingSeo: a.missingSeo,
    missingImageUrl: a.missingImageUrl,
    needCopy: a.needCopy,
    /** Destinations for a future Pinterest “edit destination” automation */
    pinDestinations: a.withSeoRows.map((r) => ({
      bundleId: r.bundleId,
      vocabPath: r.path,
      destinationUrl: `${r.url}?utm_source=pinterest&utm_campaign=vocab-pin-edit`,
      previousLink: r.previousLink,
      needsLinkUpdate: !/\/vocab\//.test(r.previousLink || ""),
    })),
  };
  writeFileSync(reportPath, `${JSON.stringify(payload, null, 2)}\n`);
  // stable pointer for next step (pin edit watch)
  writeFileSync(
    path.join(OUT, "pinned-vocab-destinations.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
  );
  return reportPath;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
