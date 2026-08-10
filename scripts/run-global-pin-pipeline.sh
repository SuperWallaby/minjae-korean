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

log "==> global pin pipeline enrich ${LIMIT_ARGS[*]:-}"
set +e
npx tsx scripts/enrich-global-pins.ts "${LIMIT_ARGS[@]}" >>"$LOG" 2>&1
en_rc=$?
set -e
log "enrich exit=$en_rc"
tail -20 "$LOG" || true

# Deploy via git when catalog/audio changed (CI). Off with GLOBAL_ENRICH_AUTO_COMMIT=0
if [[ "${GLOBAL_ENRICH_AUTO_COMMIT:-1}" == "1" ]]; then
  cd "$ROOT"
  changed="$(git status --porcelain -- src/data/globalPins/published.json public/global 2>/dev/null || true)"
  if [[ -n "$changed" ]]; then
    log "auto-commit catalog (+media if local)"
    git add src/data/globalPins/published.json public/global 2>/dev/null || true
    if git diff --cached --quiet; then
      log "nothing staged"
    else
      git commit -m "$(cat <<'EOF'
chore(global): auto-publish pin catalog and enrich audio.

EOF
)" || true
      if [[ "${GLOBAL_ENRICH_AUTO_PUSH:-1}" == "1" ]]; then
        git push origin HEAD 2>&1 | tee -a "$LOG" || log "push failed (will retry next round)"
      fi
    fi
  else
    log "no git changes"
  fi
fi

if [[ "$en_rc" -ne 0 ]]; then
  exit "$en_rc"
fi
exit 0
