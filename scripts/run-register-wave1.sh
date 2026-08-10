#!/usr/bin/env bash
# Pre-generate vocab pins for actual Pinterest registration (main OUT dir).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/.tmp/vocab-infographic-gen"
IDS="$OUT/ids-register-wave1.json"
LOG="$ROOT/logs/register-wave1-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$OUT" "$ROOT/logs"
export VOCAB_OUT="$OUT"
# Register for X review only — do not auto-queue tweets.
export VOCAB_AUTO_REVIEW_X=1
echo "pid $$" | tee "$OUT/register-wave1.pid"
echo "log $LOG"
echo "ids $IDS"
exec npx tsx scripts/batch-generate-vocab-infographics.ts \
  --ids-file "$IDS" \
  2>&1 | tee -a "$LOG"
