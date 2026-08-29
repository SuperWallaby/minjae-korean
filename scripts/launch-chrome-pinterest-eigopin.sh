#!/usr/bin/env bash
# Launch Eigopin / EigoChart Pinterest Chrome (CDP :9226).
# Fresh isolated profile — do NOT seed from Plantweb (:9222) or multilingual (:9224).
# Login yourself; automation only uses this profile after you are signed in.
set -euo pipefail

PROFILE_DIR="${CHROME_PINTEREST_EIGOPIN_PROFILE_DIR:-$HOME/chrome-pinterest-eigopin}"
DEBUG_PORT="${CHROME_PINTEREST_EIGOPIN_DEBUG_PORT:-9226}"
START_URL="${1:-https://www.pinterest.com/login/}"

mkdir -p "$PROFILE_DIR"

if curl -sf --max-time 2 "http://127.0.0.1:${DEBUG_PORT}/json/version" >/dev/null; then
  if pgrep -fl "user-data-dir=${PROFILE_DIR}" | grep -q "remote-debugging-port=${DEBUG_PORT}"; then
    echo "Already up: http://127.0.0.1:${DEBUG_PORT}  profile=$PROFILE_DIR"
    exit 0
  fi
fi

if pgrep -fl "user-data-dir=${PROFILE_DIR}" >/dev/null 2>&1; then
  echo "Stopping existing Eigopin Chrome for ${PROFILE_DIR}…"
  pkill -f "user-data-dir=${PROFILE_DIR}" 2>/dev/null || true
  sleep 2
  pkill -9 -f "user-data-dir=${PROFILE_DIR}" 2>/dev/null || true
  sleep 1
fi
lsof -nP -iTCP:${DEBUG_PORT} -sTCP:LISTEN -t 2>/dev/null | xargs -I{} kill {} 2>/dev/null || true
sleep 1

rm -f "$PROFILE_DIR/SingletonLock" "$PROFILE_DIR/SingletonCookie" "$PROFILE_DIR/SingletonSocket" \
  "$PROFILE_DIR/Default/SingletonLock" "$PROFILE_DIR/Default/SingletonCookie" "$PROFILE_DIR/Default/SingletonSocket" 2>/dev/null || true

open -na "Google Chrome" --args \
  --user-data-dir="$PROFILE_DIR" \
  --remote-debugging-port="$DEBUG_PORT" \
  --no-first-run \
  --no-default-browser-check \
  --new-window \
  "$START_URL"

for _ in $(seq 1 60); do
  if curl -sf --max-time 2 "http://127.0.0.1:${DEBUG_PORT}/json/version" >/dev/null; then
    echo "Ready (Eigopin Pinterest): http://127.0.0.1:${DEBUG_PORT}"
    echo "  profile=$PROFILE_DIR"
    echo "  Log in here yourself. :9222 Plantweb / :9224 multilingual / :9225 anicloset stay untouched."
    exit 0
  fi
  sleep 0.5
done

echo "Chrome debug not ready on :${DEBUG_PORT}" >&2
exit 1
