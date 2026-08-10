#!/bin/bash
# Cursor-independent TTS daemon (lives outside Desktop — launchd TCC safe).
# Project data still reads: ~/Desktop/korean-teacher-mj
set -uo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
APP_SUPPORT="/Users/minjaekim/Library/Application Support/kaja/pinned-vocab-tts"
OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR" "$APP_SUPPORT"

export HOME="/Users/minjaekim"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export NODE="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node"
export LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-12}"
export ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-2}"
export IDLE_SLEEP_SEC="${IDLE_SLEEP_SEC:-300}"
export VOCAB_TTS_SSH="${VOCAB_TTS_SSH:-lab-worker}"

DAEMON_LOG="$LOG_DIR/tts-daemon.log"
PIDFILE="$APP_SUPPORT/daemon.pid"
echo $$ >"$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT

log() { echo "$(date -Iseconds) $*" | tee -a "$DAEMON_LOG"; }

need_count() {
  cd "$ROOT" || return 1
  "$NODE" --input-type=module <<'EOF'
import { readFileSync, existsSync } from "fs";
import { join } from "path";
const ROOT = process.cwd();
const pub = JSON.parse(readFileSync(join(ROOT, "src/data/vocabInfographic/published.json"), "utf8"));
const pinnedPath = join(ROOT, ".tmp/vocab-infographic-gen/pinterest-pinned.json");
const pinned = existsSync(pinnedPath) ? JSON.parse(readFileSync(pinnedPath, "utf8")) : {};
const set = new Set(Object.keys(pinned));
function needTts(p) {
  if (!p.examples?.length) return true;
  if (p.examples.some((ex) => ex.korean && !ex.ttsUrl)) return true;
  if (p.words.some((w) => w.hangul?.trim() && !w.ttsUrl)) return true;
  return false;
}
console.log((pub.pages || []).filter((p) => set.has(p.bundleId) && needTts(p)).length);
EOF
}

run_enrich() {
  cd "$ROOT" || return 1
  # Run tsx via node (file is read from Desktop — OK for launchd; never exec a Desktop .sh)
  rm -f "$OUT/pinned-vocab-tts.lock" 2>/dev/null || true
  "$NODE" --require "$ROOT/node_modules/tsx/dist/preflight.cjs" \
    --import "file://$ROOT/node_modules/tsx/dist/loader.mjs" \
    "$ROOT/scripts/enrich-vocab-seo-pages.ts" \
    --tts-only --pinned-only --limit "$LIMIT_PER_ROUND"
}

log "daemon start PID=$$ LIMIT=${LIMIT_PER_ROUND} (launchd / outside Cursor)"

while true; do
  need="$(need_count 2>/dev/null || echo 0)"
  if [[ "${need}" == "0" ]] || [[ -z "${need}" ]]; then
    log "backlog empty — idle ${IDLE_SLEEP_SEC}s"
    sleep "$IDLE_SLEEP_SEC"
    continue
  fi
  ROUND_LOG="$LOG_DIR/tts-daemon-round-$(date +%Y%m%d-%H%M%S).log"
  log "work needTts=${need} limit=${LIMIT_PER_ROUND} → ${ROUND_LOG}"
  set +e
  run_enrich >>"$ROUND_LOG" 2>&1
  rc=$?
  set -e
  after="$(need_count 2>/dev/null || echo '?')"
  log "round exit=${rc} needTts after=${after}"
  sleep "$ROUND_PAUSE_SEC"
done
