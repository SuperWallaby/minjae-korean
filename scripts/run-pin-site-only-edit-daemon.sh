#!/bin/bash
# Mirror of Application Support daemon (for install.sh refresh).
# Rewrite pin destinations: ~25% Preply/italki direct, rest → kajakorean.com /vocab.
set -euo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
APP_SUPPORT="/Users/minjaekim/Library/Application Support/kaja/pin-site-only-edit"
OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
NODE="${NODE_BIN:-/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node}"
SCRIPT="$ROOT/scripts/edit-pinned-vocab-destinations.mjs"
LOCK="$APP_SUPPORT/run.lock"
PIDFILE="$APP_SUPPORT/run.pid"
AFFILIATE_RATE="${PINTEREST_AFFILIATE_RATE:-0.25}"

mkdir -p "$APP_SUPPORT" "$LOG_DIR"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:$PATH"
export HOME="${HOME:-/Users/minjaekim}"
export CHROME_WORK_DEBUG_URL="${CHROME_WORK_DEBUG_URL:-http://127.0.0.1:9222}"

log() {
  local line="[$(date '+%Y-%m-%dT%H:%M:%S%z')] $*"
  echo "$line" | tee -a "$LOG_DIR/pin-site-only-daemon.log"
}

if [[ -f "$LOCK" ]]; then
  oldpid="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [[ -n "${oldpid:-}" ]] && kill -0 "$oldpid" 2>/dev/null; then
    log "already running pid=$oldpid — exit"
    exit 0
  fi
  rm -f "$LOCK" "$PIDFILE"
fi
echo $$ >"$PIDFILE"
echo $$ >"$LOCK"
trap 'rm -f "$LOCK" "$PIDFILE"' EXIT

if ! curl -sf --max-time 5 "${CHROME_WORK_DEBUG_URL}/json/version" >/dev/null; then
  log "Chrome :9222 down — try plantweb launcher"
  if [[ -x "/Users/minjaekim/Library/Application Support/kaja/launch-chrome-pinterest-plantweb.sh" ]]; then
    bash "/Users/minjaekim/Library/Application Support/kaja/launch-chrome-pinterest-plantweb.sh" || true
    sleep 4
  fi
fi
if ! curl -sf --max-time 5 "${CHROME_WORK_DEBUG_URL}/json/version" >/dev/null; then
  log "ABORT: Chrome ${CHROME_WORK_DEBUG_URL} still down"
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
ROUND_LOG="$LOG_DIR/pin-site-only-edit-${STAMP}.log"
ln -sfn "$ROUND_LOG" "$LOG_DIR/pin-site-only-edit.latest"
log "start round aff-rate=${AFFILIATE_RATE} → $ROUND_LOG node=$NODE"

cd "$ROOT"
set +e
/usr/bin/caffeinate -dims \
  "$NODE" "$SCRIPT" \
  --affiliate-rate "$AFFILIATE_RATE" \
  --only-with-id \
  --skip-index \
  --delay "${PIN_EDIT_DELAY_SEC:-5}" \
  >>"$ROUND_LOG" 2>&1
rc=$?
set -e

log "round exit code=$rc log=$ROUND_LOG"
tail -30 "$ROUND_LOG" >>"$LOG_DIR/pin-site-only-daemon.log" 2>/dev/null || true

if [[ "$rc" -eq 0 ]]; then
  # Remaining affiliates are intentional (~25%); only retry if errors left work.
  left="$(
    "$NODE" -e '
const fs=require("fs");
const p=JSON.parse(fs.readFileSync("'"$OUT"'/pinterest-pinned.json","utf8"));
let n=0,site=0,total=0;
for (const v of Object.values(p)) {
  const l=String(v.link||"");
  if (!l) continue;
  total++;
  if (/preply|italki\.com\/en\/affshare/i.test(l)) n++;
  else if (/kajakorean\.com\/vocab\//i.test(l)) site++;
}
process.stdout.write(String(n)+"/"+total+" aff, site="+site);
' 2>/dev/null || echo "unknown"
  )"
  log "ledger destinations: $left"
  log "mix pass complete (affiliateRate=${AFFILIATE_RATE})"
  exit 0
fi
exit "$rc"
