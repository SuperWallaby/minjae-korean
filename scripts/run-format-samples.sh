#!/usr/bin/env bash
# Generate one pin per vocab format (capybara always-on).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/.tmp/vocab-format-samples"
LOG="$ROOT/logs/format-samples-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$OUT" "$ROOT/logs"
export VOCAB_OUT="$OUT"
echo "pid $$" | tee "$OUT/batch.pid"
echo "log $LOG"
exec npx tsx scripts/batch-generate-vocab-infographics.ts \
  --ids-file "$OUT/ids.json" \
  --catalog-order \
  2>&1 | tee -a "$LOG"
