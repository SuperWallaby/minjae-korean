#!/usr/bin/env bash
# Prepare next Pinterest batch: SEO pages from scheduled imageUrl, then report
# what still needs deploy before pin-vocab-batch.sh.
#
#   ./scripts/prepare-pin-seo.sh
#   ./scripts/prepare-pin-seo.sh --sample 3   # curl-check N unpinned /vocab URLs after publish
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SAMPLE=0
if [[ "${1:-}" == "--sample" && -n "${2:-}" ]]; then
  SAMPLE="$2"
fi

OUT="$ROOT/.tmp/vocab-infographic-gen"
PINNED="$OUT/pinterest-pinned.json"
SCHEDULED="$OUT/vocab-x-scheduled.json"
PUBLISHED="$ROOT/src/data/vocabInfographic/published.json"
SITE="${PIN_SEO_SITE_ORIGIN:-https://kajakorean.com}"

echo "==> 1/3 yarn vocab:publish"
yarn vocab:publish

echo ""
echo "==> 2/3 coverage report"
node --input-type=module <<'EOF'
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const OUT = join(root, ".tmp/vocab-infographic-gen");
const scheduled = JSON.parse(readFileSync(join(OUT, "vocab-x-scheduled.json"), "utf8"));
const pinned = existsSync(join(OUT, "pinterest-pinned.json"))
  ? JSON.parse(readFileSync(join(OUT, "pinterest-pinned.json"), "utf8"))
  : {};
const published = JSON.parse(
  readFileSync(join(root, "src/data/vocabInfographic/published.json"), "utf8"),
);
const byId = new Map((published.pages || []).map((p) => [p.bundleId, p]));

const unpinned = Object.keys(scheduled).filter((id) => !pinned[id]);
const unpinnedReady = unpinned.filter((id) =>
  existsSync(join(OUT, `${id}.png`)),
);
const pinReadyWithSeo = unpinnedReady.filter((id) => byId.has(id));
const pinReadyNoSeo = unpinnedReady.filter((id) => !byId.has(id));

console.log(
  JSON.stringify(
    {
      publishedPages: byId.size,
      generatedAt: published.generatedAt,
      unpinnedPng: unpinnedReady.length,
      readyToPinAfterDeploy: pinReadyWithSeo.length,
      stillMissingSeo: pinReadyNoSeo.length,
      sampleReady: pinReadyWithSeo.slice(0, 5).map((id) => {
        const p = byId.get(id);
        return {
          id,
          path: `/vocab/${id}/${p.slug}`,
        };
      }),
    },
    null,
    2,
  ),
);
EOF

if (( SAMPLE > 0 )); then
  echo ""
  echo "==> 3/3 live smoke (sample ${SAMPLE}) against ${SITE}"
  node --input-type=module <<EOF
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
const root = process.cwd();
const OUT = join(root, ".tmp/vocab-infographic-gen");
const scheduled = JSON.parse(readFileSync(join(OUT, "vocab-x-scheduled.json"), "utf8"));
const pinned = existsSync(join(OUT, "pinterest-pinned.json"))
  ? JSON.parse(readFileSync(join(OUT, "pinterest-pinned.json"), "utf8"))
  : {};
const published = JSON.parse(
  readFileSync(join(root, "src/data/vocabInfographic/published.json"), "utf8"),
);
const byId = new Map((published.pages || []).map((p) => [p.bundleId, p]));
const site = process.env.PIN_SEO_SITE_ORIGIN || "https://kajakorean.com";
const unpinned = Object.keys(scheduled)
  .filter((id) => !pinned[id] && existsSync(join(OUT, \`\${id}.png\`)) && byId.has(id))
  .slice(0, ${SAMPLE});
let ok = 0;
for (const id of unpinned) {
  const p = byId.get(id);
  const url = \`\${site}/vocab/\${encodeURIComponent(id)}/\${encodeURIComponent(p.slug)}\`;
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow", signal: AbortSignal.timeout(20000) });
    console.log(res.status, url);
    if (res.ok) ok += 1;
  } catch (e) {
    console.log("ERR", url, e.message || e);
  }
}
console.log(\`live ok \${ok}/\${unpinned.length}\`);
if (ok < unpinned.length) {
  console.log("→ Deploy published.json (commit) and re-run sample before pin-vocab-batch.sh");
  process.exitCode = 2;
} else {
  console.log("→ Live SEO green — safe to ./scripts/pin-vocab-batch.sh N");
}
EOF
else
  echo ""
  echo "==> 3/3 live smoke skipped (pass --sample N to curl-check)"
  echo "Next:"
  echo "  1. Commit + deploy src/data/vocabInfographic/published.json"
  echo "  2. ./scripts/prepare-pin-seo.sh --sample 5   # expect 200s"
  echo "  3. ./scripts/pin-vocab-batch.sh 25"
fi
