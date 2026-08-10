#!/usr/bin/env bash
# Long-lived daemon: fill pinned SEO TTS forever (idle when backlog empty).
# Owned by launchd — NOT Cursor. Safe to close IDE.
#
# Manual:
#   /bin/bash /Users/minjaekim/Desktop/korean-teacher-mj/scripts/run-pinned-vocab-tts-daemon.sh
#
set -uo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"

export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"
export LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-12}"
export ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-2}"
export IDLE_SLEEP_SEC="${IDLE_SLEEP_SEC:-300}"
export FORCE_UNLOCK=1

DAEMON_LOG="$LOG_DIR/tts-daemon.log"
PIDFILE="$OUT/pinned-vocab-tts-daemon.pid"
echo $$ >"$PIDFILE"
trap 'rm -f "$PIDFILE"' EXIT

cd "$ROOT" || exit 1

log() {
  echo "$(date -Iseconds) $*" | tee -a "$DAEMON_LOG"
}

need_count() {
  /Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node --input-type=module <<'EOF' 2>/dev/null
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

log "daemon start PID=$$ LIMIT=${LIMIT_PER_ROUND}"

while true; do
  need="$(need_count || echo 0)"
  if [[ "${need}" == "0" ]] || [[ -z "${need}" ]]; then
    log "backlog empty — idle ${IDLE_SLEEP_SEC}s"
    sleep "$IDLE_SLEEP_SEC"
    continue
  fi

  log "work needTts=${need} limit=${LIMIT_PER_ROUND}"
  # Clear inner locks from dead Cursor-owned jobs
  rm -f "$OUT/pinned-vocab-tts.lock" "$OUT/pinned-vocab-tts-loop.lock" 2>/dev/null || true

  ROUND_LOG="$LOG_DIR/tts-daemon-round-$(date +%Y%m%d-%H%M%S).log"
  /bin/bash "$ROOT/scripts/run-pinned-vocab-tts.sh" --limit "$LIMIT_PER_ROUND" >>"$ROUND_LOG" 2>&1
  rc=$?
  after="$(need_count || echo '?')"
  log "round exit=${rc} needTts after=${after} log=${ROUND_LOG}"

  sleep "$ROUND_PAUSE_SEC"
done
