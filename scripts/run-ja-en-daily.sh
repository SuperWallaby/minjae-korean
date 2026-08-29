#!/usr/bin/env bash
# Daily EigoChart release: TTS → eigopin.com deploy → live 200 → Pinterest (6).
# Copied to Application Support so launchd is not blocked by Desktop TCC.
set -uo pipefail

ROOT="${JA_EN_ROOT:-/Users/minjaekim/Desktop/korean-teacher-mj}"
APP_SUPPORT="${JA_EN_APP_SUPPORT:-$HOME/Library/Application Support/kaja/ja-en-daily}"
LIMIT="${JA_EN_DAILY_LIMIT:-6}"
NODE="${NODE_BIN:-/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node}"
export HOME="${HOME:-/Users/minjaekim}"
export PATH="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin"

LOG_DIR="$APP_SUPPORT/logs"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$LOG_DIR/daily-$STAMP.log"
ln -sfn "$LOG" "$LOG_DIR/daily.latest"
LOCK="$APP_SUPPORT/run.lock"

log() { echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] $*" | tee -a "$LOG"; }

if [[ -f "$LOCK" ]]; then
  old="$(cat "$LOCK" 2>/dev/null || true)"
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    log "already running pid=$old"
    exit 0
  fi
  rm -f "$LOCK"
fi
echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT

# launchd wakes at 09:50; sleep 0–20m so effective start is ~10:00 ±10m (less bot-like).
JITTER_MAX="${JA_EN_START_JITTER_MAX_SEC:-1200}"
if [[ "${JA_EN_SKIP_START_JITTER:-}" != "1" && "${JITTER_MAX}" =~ ^[0-9]+$ && "$JITTER_MAX" -gt 0 ]]; then
  delay=$((RANDOM % (JITTER_MAX + 1)))
  log "start jitter ${delay}s (window ~09:50–10:10)"
  sleep "$delay"
fi

cd "$ROOT" || exit 1
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

log "==> ja-en daily limit=$LIMIT cwd=$ROOT"

log "sync topic vectors"
npx tsx "$ROOT/scripts/sync-ja-en-topic-index.mjs" >>"$LOG" 2>&1 || log "WARN topic sync failed"

sel="$("$NODE" "$ROOT/scripts/select-ja-en-daily.mjs" --limit "$LIMIT" 2>>"$LOG")" || {
  log "select failed"
  exit 1
}
log "select $sel"
ids="$("$NODE" -e "const j=JSON.parse(process.argv[1]); process.stdout.write((j.ids||[]).join(','))" "$sel")"
catch_n="$("$NODE" -e "const j=JSON.parse(process.argv[1]); process.stdout.write(String((j.catchUpIds||[]).length))" "$sel")"
if [[ -z "$ids" ]]; then
  log "nothing to release"
  exit 0
fi
if [[ "${catch_n:-0}" != "0" ]]; then
  log "catch-up first: ${catch_n} published-but-not-pinned (never skip)"
fi
log "ids=$ids"

log "==> publish catalog"
set +e
"$NODE" "$ROOT/scripts/publish-ja-en-pins.mjs" --ids "$ids" >>"$LOG" 2>&1
pub_rc=$?
set -e
log "publish exit=$pub_rc"
if [[ "$pub_rc" -ne 0 ]]; then
  exit "$pub_rc"
fi

log "==> enrich copy + Edge TTS (words = Edge)"
set +e
npx tsx "$ROOT/scripts/enrich-ja-en-pins.ts" --ids "$ids" >>"$LOG" 2>&1
en_rc=$?
set -e
log "enrich exit=$en_rc"
if [[ "$en_rc" -ne 0 ]]; then
  exit "$en_rc"
fi

log "==> deploy eigopin.com"
set +e
bash "$ROOT/scripts/deploy-eigopin.sh" >>"$LOG" 2>&1
dep_rc=$?
set -e
log "deploy exit=$dep_rc"
if [[ "$dep_rc" -ne 0 ]]; then
  exit "$dep_rc"
fi

log "==> verify live /pin/{id}"
set +e
"$NODE" "$ROOT/scripts/verify-ja-en-live.mjs" --ids "$ids" >>"$LOG" 2>&1
ver_rc=$?
set -e
log "verify exit=$ver_rc"
if [[ "$ver_rc" -ne 0 ]]; then
  exit "$ver_rc"
fi

log "==> chrome CDP"
set +e
bash "$ROOT/scripts/launch-chrome-pinterest-eigopin.sh" >>"$LOG" 2>&1
ch_rc=$?
set -e
log "chrome exit=$ch_rc"
if [[ "$ch_rc" -ne 0 ]]; then
  log "Pinterest Chrome :9226 not ready — pins NOT abandoned; run later: yarn ja:pin:catchup"
  exit "$ch_rc"
fi

log "==> pinterest (catch-up + new, ids=$ids)"
set +e
"$NODE" "$ROOT/scripts/pin-ja-en-samples.mjs" --ids "$ids" >>"$LOG" 2>&1
pin_rc=$?
set -e
log "pin exit=$pin_rc"
if [[ "$pin_rc" -ne 0 ]]; then
  log "pin had failures — remaining stay unpinned; retry: yarn ja:pin:catchup"
fi

# Sitemap/home index only Pinterest-public pins — redeploy so SEO matches what went live.
if [[ "$pin_rc" -eq 0 ]] || grep -q '"ok":true' "$LOG" 2>/dev/null; then
  log "==> deploy eigopin.com (SEO sync after Pinterest)"
  set +e
  bash "$ROOT/scripts/deploy-eigopin.sh" >>"$LOG" 2>&1
  seo_rc=$?
  set -e
  log "seo-deploy exit=$seo_rc"
fi

exit "$pin_rc"
