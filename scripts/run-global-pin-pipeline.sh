#!/usr/bin/env bash
# One-shot global pin pipeline:
#   1) publish generated pin images into catalog (if any new in .tmp)
#   2) enrich backlog (examples + Edge TTS)
#   3) optional auto commit+push for CI deploy
#
#   bash scripts/run-global-pin-pipeline.sh
#   bash scripts/run-global-pin-pipeline.sh --limit 3
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"

NODE="${NODE_BIN:-/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node}"
LIMIT_ARGS=("$@")
OUT="$ROOT/.tmp/global-lang-en-samples"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$LOG_DIR/pipeline-$STAMP.log"
ln -sfn "$LOG" "$LOG_DIR/pipeline.latest"

log() { echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] $*" | tee -a "$LOG"; }

log "==> global pin pipeline publish"
set +e
"$NODE" scripts/publish-global-pins.mjs >>"$LOG" 2>&1
pub_rc=$?
set -e
log "publish exit=$pub_rc"

log "==> global pin web images"
set +e
"$NODE" scripts/optimize-global-pin-web-images.mjs >>"$LOG" 2>&1
opt_rc=$?
set -e
log "optimize-images exit=$opt_rc"

log "==> upload global pin webp to R2"
set +e
"$NODE" scripts/upload-global-pins-r2.mjs >>"$LOG" 2>&1
up_rc=$?
set -e
log "upload-pins exit=$up_rc"

log "==> global pin pipeline enrich ${LIMIT_ARGS[*]:-}"
set +e
npx tsx scripts/enrich-global-pins.ts "${LIMIT_ARGS[@]}" >>"$LOG" 2>&1
en_rc=$?
set -e
log "enrich exit=$en_rc"
tail -20 "$LOG" || true

# Deploy via GitHub API (launchd cannot git Desktop repos). Off with GLOBAL_ENRICH_AUTO_COMMIT=0
if [[ "${GLOBAL_ENRICH_AUTO_COMMIT:-1}" == "1" ]]; then
  log "auto-push catalog (gh api)"
  set +e
  "$NODE" scripts/auto-push-global-catalog.mjs >>"$LOG" 2>&1
  push_rc=$?
  set -e
  log "auto-push exit=$push_rc"
fi

if [[ "$en_rc" -ne 0 ]]; then
  exit "$en_rc"
fi
exit 0
