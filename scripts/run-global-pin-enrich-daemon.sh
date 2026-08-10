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
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR" "$APP_SUPPORT"

export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-4}"
export ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-8}"
export IDLE_SLEEP_SEC="${IDLE_SLEEP_SEC:-300}"
export GLOBAL_ENRICH_AUTO_COMMIT="${GLOBAL_ENRICH_AUTO_COMMIT:-1}"
export GLOBAL_ENRICH_AUTO_PUSH="${GLOBAL_ENRICH_AUTO_PUSH:-1}"

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
  "$NODE" --input-type=module <<'EOF' 2>/dev/null
import { readFileSync, existsSync } from "fs";
import { join } from "path";
const ROOT = process.cwd();
const pub = JSON.parse(
  readFileSync(join(ROOT, "src/data/globalPins/published.json"), "utf8"),
);
function hasTts(url) {
  if (!url?.trim()) return false;
  if (/^https?:\/\//i.test(url)) return true;
  const rel = String(url).replace(/^\//, "");
  return (
    existsSync(join(ROOT, "public", rel)) || existsSync(join(ROOT, rel))
  );
}
function need(p) {
  if (!(p.examples || []).length || !p.explanationEn) return true;
  if ((p.words || []).some((w) => w.target?.trim() && !hasTts(w.ttsUrl)))
    return true;
  if ((p.examples || []).some((e) => e.target?.trim() && !hasTts(e.ttsUrl)))
    return true;
  return false;
}
console.log((pub.pages || []).filter(need).length);
EOF
}

run_pipeline_round() {
  local limit="$1"
  local stamp round_log
  stamp="$(date +%Y%m%d-%H%M%S)"
  round_log="$LOG_DIR/pipeline-$stamp.log"
  ln -sfn "$round_log" "$LOG_DIR/pipeline.latest"

  {
    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> publish"
    set +e
    /usr/bin/caffeinate -dims "$NODE" "$ROOT/scripts/publish-global-pins.mjs"
    local pub_rc=$?
    set -e
    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] publish exit=$pub_rc"

    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] ==> enrich --limit $limit"
    set +e
    /usr/bin/caffeinate -dims "$NPX" tsx "$ROOT/scripts/enrich-global-pins.ts" --limit "$limit"
    local en_rc=$?
    set -e
    echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] enrich exit=$en_rc"

    if [[ "${GLOBAL_ENRICH_AUTO_COMMIT:-1}" == "1" ]]; then
      local changed
      changed="$(git -C "$ROOT" status --porcelain -- src/data/globalPins/published.json public/global 2>/dev/null || true)"
      if [[ -n "$changed" ]]; then
        echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] auto-commit catalog (+media)"
        git -C "$ROOT" add src/data/globalPins/published.json public/global 2>/dev/null || true
        if ! git -C "$ROOT" diff --cached --quiet 2>/dev/null; then
          git -C "$ROOT" commit -m "$(cat <<'EOF'
chore(global): auto-publish pin catalog and enrich audio.

EOF
)" || true
          if [[ "${GLOBAL_ENRICH_AUTO_PUSH:-1}" == "1" ]]; then
            git -C "$ROOT" push origin HEAD 2>&1 || echo "push failed (retry next round)"
          fi
        else
          echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] nothing staged"
        fi
      else
        echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] no git changes"
      fi
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
