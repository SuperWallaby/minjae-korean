#!/usr/bin/env bash
# Wait for expr-wave PNGs (restarting gen if needed), then upload → publish → enrich.
set -uo pipefail
cd "$(dirname "$0")/.."
OUT=".tmp/vocab-infographic-gen"
IDS_FILE="$OUT/expr-wave-ids.json"
LOG="$OUT/expr-wave-post.log"
mkdir -p "$OUT"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$LOG"; }

remaining() {
  npx tsx -e '
    import { existsSync, readFileSync } from "node:fs";
    const ids = JSON.parse(readFileSync(process.argv[1], "utf8")).ids as string[];
    const out = process.argv[2];
    const n = ids.filter(
      (id) => !(existsSync(`${out}/${id}_raw.png`) && existsSync(`${out}/${id}.png`)),
    ).length;
    console.log(n);
  ' "$IDS_FILE" "$OUT"
}

log "post-watcher waiting for gen…"
while true; do
  left="$(remaining)"
  log "wave images remaining: $left"
  if [[ "$left" == "0" ]]; then
    break
  fi
  if ! pgrep -f "batch-generate-vocab-infographics.ts --ids-file" >/dev/null; then
    log "gen not running — restarting"
    caffeinate -i npx tsx scripts/batch-generate-vocab-infographics.ts \
      --ids-file "$IDS_FILE" >>"$OUT/expr-wave-batch.log" 2>&1 &
  fi
  sleep 120
done

log "all images ready — upload"
npx tsx scripts/upload-expr-seo-images.ts 2>&1 | tee -a "$LOG"
log "publish"
yarn vocab:publish 2>&1 | tee -a "$LOG"
log "enrich"
npx tsx scripts/enrich-expr-seo-pages.ts 2>&1 | tee -a "$LOG"
log "POST PIPELINE DONE"
touch "$OUT/expr-wave-post.done"
