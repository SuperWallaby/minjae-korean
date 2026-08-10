#!/usr/bin/env bash
# Keep-alive launcher: restart TTS loop if it dies (macOS, no setsid).
set -uo pipefail
ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"
LOOP_LOCK="$OUT/pinned-vocab-tts-loop.lock"
CONSOLE="$LOG_DIR/keepalive-console.log"

if [[ -f "$LOOP_LOCK" ]]; then
  pid="$(cat "$LOOP_LOCK" 2>/dev/null || true)"
  if [[ -n "${pid:-}" ]] && kill -0 "$pid" 2>/dev/null; then
    echo "$(date -Iseconds) loop alive pid=$pid" >>"$CONSOLE"
    exit 0
  fi
fi

if pgrep -f 'run-pinned-vocab-tts-loop\.sh' >/dev/null 2>&1; then
  echo "$(date -Iseconds) loop process found" >>"$CONSOLE"
  exit 0
fi

echo "$(date -Iseconds) starting TTS loop" >>"$CONSOLE"
rm -f "$OUT/pinned-vocab-tts.lock" "$LOOP_LOCK"
cd "$ROOT" || exit 1
export LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-3}"
export MAX_ROUNDS="${MAX_ROUNDS:-200}"
export ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-5}"
export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

nohup /bin/bash "$ROOT/scripts/run-pinned-vocab-tts-loop.sh" >>"$CONSOLE" 2>&1 &
echo "$(date -Iseconds) spawned pid=$!" >>"$CONSOLE"
exit 0
