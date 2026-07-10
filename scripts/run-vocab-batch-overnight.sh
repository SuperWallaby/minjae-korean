#!/usr/bin/env bash
set -uo pipefail
cd "$(dirname "$0")/.."
OUT=".tmp/vocab-infographic-gen"
mkdir -p "$OUT"

log() { echo "[$(date -Iseconds)] $*" | tee -a "$OUT/supervisor.log"; }

log "supervisor started"

while true; do
  log "launching batch"
  VOCAB_AUTO_QUEUE_X=1 npx tsx scripts/batch-generate-vocab-infographics.ts 2>&1 | tee -a "$OUT/batch-console.log" || true

  REMAINING=$(npx tsx -e "
    import { existsSync, readFileSync } from 'node:fs';
    import { ALL_VOCAB_BUNDLES } from './src/lib/vocabInfographic/bundle-catalog.ts';
    import { DROP_IDS } from './scripts/lib/vocab-batch-config.mjs';
    const OUT = '.tmp/vocab-infographic-gen';
    let skipped = {};
    try { skipped = JSON.parse(readFileSync(OUT + '/progress.json','utf8')).skipped || {}; } catch {}
    const n = ALL_VOCAB_BUNDLES.filter((b) => {
      if (DROP_IDS.has(b.id)) return false;
      if (skipped[b.id]) return false;
      return !(existsSync(OUT + '/' + b.id + '_raw.png') && existsSync(OUT + '/' + b.id + '.png'));
    }).length;
    console.log(n);
  ")

  log "batch exited — $REMAINING remaining"

  if [ "$REMAINING" = "0" ]; then
    log "all done"
    break
  fi

  log "restart in 30s"
  sleep 30
done
