#!/usr/bin/env bash
# Long-lived daemon (launchd): keep global pin catalog enriched without Cursor.
# Pattern matches pin-site-only-edit: call Node directly — do NOT nest bash scripts
# under Desktop (macOS TCC/provenance → "Operation not permitted" from launchd).
#
#   bash scripts/install-global-pin-enrich-daemon.sh
set -uo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
OUT="$ROOT/.tmp/global-lang-en-samples"
APP_SUPPORT="/Users/minjaekim/Library/Application Support/kaja/global-pin-enrich"
# Prefer Application Support logs — launchd often cannot write Desktop/.tmp (TCC → exit 78).
LOG_DIR="$APP_SUPPORT/logs"
mkdir -p "$LOG_DIR" "$APP_SUPPORT" "$OUT/logs"

export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-40}"
export ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-8}"
export IDLE_SLEEP_SEC="${IDLE_SLEEP_SEC:-300}"
export GLOBAL_ENRICH_AUTO_COMMIT="${GLOBAL_ENRICH_AUTO_COMMIT:-1}"
export GLOBAL_ENRICH_AUTO_PUSH="${GLOBAL_ENRICH_AUTO_PUSH:-1}"
# TTS backlog catch-up: skip full PNG republish (1119+ webp) before enrich.
export GLOBAL_ENRICH_SKIP_PUBLISH="${GLOBAL_ENRICH_SKIP_PUBLISH:-1}"

NODE="${NODE_BIN:-/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node}"
NPX="$(dirname "$NODE")/npx"
DAEMON_LOG="$LOG_DIR/enrich-daemon.log"
PIDFILE="$APP_SUPPORT/run.pid"
LOCK="$APP_SUPPORT/run.lock"

if [[ -f "$LOCK" ]]; then
  old="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    echo "already running pid=$old" | tee -a "$DAEMON_LOG"
    exit 0
  fi
  rm -f "$LOCK" "$PIDFILE"
fi
echo $$ >"$PIDFILE"
echo $$ >"$LOCK"
trap 'rm -f "$LOCK" "$PIDFILE"' EXIT

cd "$ROOT" || exit 1

log() {
  echo "$(date -Iseconds) $*" | tee -a "$DAEMON_LOG"
}

need_count() {
  "$NODE" "$ROOT/scripts/global-pin-catalog-db.mjs" enrich-backlog
}

run_pipeline_round() {
  local limit="$1"
  local stamp round_log
  stamp="$(date +%Y%m%d-%H%M%S)"
  round_log="$LOG_DIR/pipeline-$stamp.log"
  # launchd often cannot rewrite Desktop symlinks (TCC) — never abort the round for that.
  ln -sfn "$round_log" "$LOG_DIR/pipeline.latest" 2>/dev/null || true

  {
    if [[ "${GLOBAL_ENRICH_SKIP_PUBLISH:-0}" == "1" ]]; then
      echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> publish skipped (GLOBAL_ENRICH_SKIP_PUBLISH=1)"
    else
      echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> publish"
      set +e
      /usr/bin/caffeinate -dims "$NODE" "$ROOT/scripts/publish-global-pins.mjs"
      local pub_rc=$?
      set -e
      echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] publish exit=$pub_rc"
    fi

    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> enrich --limit $limit --tts-only"
    set +e
    /usr/bin/caffeinate -dims "$NPX" tsx "$ROOT/scripts/enrich-global-pins.ts" --limit "$limit" --tts-only
    local en_rc=$?
    set -e
    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] enrich exit=$en_rc"

    if [[ "${GLOBAL_ENRICH_AUTO_COMMIT:-1}" == "1" ]]; then
      # launchd cannot `git` Desktop (TCC). R2 catalog is live; CLI deploy is opt-in.
      echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> auto-push CDN catalog + ISR warm"
      set +e
      /usr/bin/caffeinate -dims "$NODE" "$ROOT/scripts/auto-push-global-catalog.mjs"
      local push_rc=$?
      set -e
      echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] auto-push exit=$push_rc"
    fi
    return "${en_rc:-0}"
  } >>"$round_log" 2>&1
}

log "daemon start PID=$$ LIMIT=${LIMIT_PER_ROUND} IDLE=${IDLE_SLEEP_SEC}s autoCommit=${GLOBAL_ENRICH_AUTO_COMMIT}"

while true; do
  set +e
  run_pipeline_round "$LIMIT_PER_ROUND"
  rc=$?
  set -e
  need="$(need_count || echo 0)"
  log "pipeline exit=${rc} backlog=${need} (see pipeline.latest)"

  if [[ "${need}" == "0" ]] || [[ -z "${need}" ]]; then
    log "backlog empty — idle ${IDLE_SLEEP_SEC}s"
    sleep "$IDLE_SLEEP_SEC"
    continue
  fi
  sleep "$ROUND_PAUSE_SEC"
done
