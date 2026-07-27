#!/usr/bin/env bash
# Expression SEO wave: generate → R2/schedule → publish → enrich.
# Safe to re-run; skips already-generated IDs.
set -uo pipefail
cd "$(dirname "$0")/.."
OUT=".tmp/vocab-infographic-gen"
IDS_FILE="$OUT/expr-wave-ids.json"
mkdir -p "$OUT"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$OUT/expr-wave-pipeline.log"; }

if [[ ! -f "$IDS_FILE" ]]; then
  log "missing $IDS_FILE — regenerate via EXPR_WAVE_BUNDLES export"
  exit 1
fi

remaining() {
  npx tsx -e "
    import { existsSync, readFileSync } from 'node:fs';
    const ids = (JSON.parse(readFileSync('$IDS_FILE','utf8')).ids as string[]);
    const OUT = '$OUT';
    const n = ids.filter((id) => !(existsSync(OUT+'/'+id+'_raw.png') && existsSync(OUT+'/'+id+'.png'))).length;
    console.log(n);
  "
}

log "pipeline start — $(remaining) images remaining"

while [[ "$(remaining)" != "0" ]]; do
  log "launching expr-wave batch ($(remaining) left)"
  VOCAB_AUTO_REVIEW_X=1 caffeinate -i npx tsx scripts/batch-generate-vocab-infographics.ts \
    --ids-file "$IDS_FILE" 2>&1 | tee -a "$OUT/expr-wave-batch.log" || true
  left="$(remaining)"
  log "batch exited — $left remaining"
  [[ "$left" == "0" ]] && break
  log "restart in 30s"
  sleep 30
done

log "upload / schedule missing expression imageUrls"
npx tsx scripts/upload-expr-seo-images.ts 2>&1 | tee -a "$OUT/expr-wave-pipeline.log"

log "publish SEO pages"
yarn vocab:publish 2>&1 | tee -a "$OUT/expr-wave-pipeline.log"

log "enrich expression pages"
npx tsx scripts/enrich-expr-seo-pages.ts 2>&1 | tee -a "$OUT/expr-wave-pipeline.log"

log "pipeline complete — commit published.json when ready"
