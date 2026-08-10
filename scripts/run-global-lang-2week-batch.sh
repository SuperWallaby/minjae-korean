#!/usr/bin/env bash
# Generate 2-week global lang pin buffer (14 topics × 6 langs = 84).
# Then auto-publish + enrich (examples/TTS) so pages go live without manual steps.
# Skips pins that already exist. Safe to re-run.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/.tmp/global-lang-en-samples"
mkdir -p "$OUT/logs"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$OUT/logs/wave-2week-$STAMP.log"
ln -sfn "$LOG" "$OUT/logs/wave-2week.latest"
echo "log=$LOG"
cd "$ROOT"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
set +e
caffeinate -i npx tsx scripts/generate-global-lang-en-samples.ts --all "$@" 2>&1 | tee -a "$LOG"
gen_rc=${PIPESTATUS[0]}
set -e
echo "generate exit=$gen_rc" | tee -a "$LOG"
# Always try to publish whatever is ready + enrich backlog for SEO/audio
bash "$ROOT/scripts/run-global-pin-pipeline.sh" 2>&1 | tee -a "$LOG"
exit "$gen_rc"
