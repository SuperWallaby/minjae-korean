#!/usr/bin/env bash
# Daily EigoSound: gen 8 → publish → enrich TTS → deploy → live check → Pinterest (board English).
# Copied into Application Support so launchd is not blocked by Desktop TCC.
set -uo pipefail

ROOT="${SOUND_ROOT:-/Users/minjaekim/Desktop/korean-teacher-mj}"
APP_SUPPORT="${SOUND_APP_SUPPORT:-$HOME/Library/Application Support/kaja/sound-daily}"
LIMIT="${SOUND_DAILY_LIMIT:-8}"
NODE="${NODE_BIN:-/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node}"
BOARD="${PINTEREST_SOUND_BOARD_NAME:-English}"
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

# launchd wakes at 10:20; sleep 0–20m → ~10:30 ±10m
JITTER_MAX="${SOUND_START_JITTER_MAX_SEC:-1200}"
if [[ "${SOUND_SKIP_START_JITTER:-}" != "1" && "${JITTER_MAX}" =~ ^[0-9]+$ && "$JITTER_MAX" -gt 0 ]]; then
  delay=$((RANDOM % (JITTER_MAX + 1)))
  log "start jitter ${delay}s (window ~10:20–10:40)"
  sleep "$delay"
fi

cd "$ROOT" || exit 1
if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

log "==> sound daily limit=$LIMIT board=$BOARD cwd=$ROOT"

log "==> gen $LIMIT EN→EN warehouse pins"
set +e
npx tsx "$ROOT/scripts/generate-en-en-samples.ts" --limit "$LIMIT" >>"$LOG" 2>&1
gen_rc=$?
set -e
log "gen exit=$gen_rc"
if [[ "$gen_rc" -ne 0 ]]; then
  log "WARN gen had failures — continuing with whatever exists"
fi

log "==> publish catalog (new-only, limit=$LIMIT)"
set +e
"$NODE" "$ROOT/scripts/publish-sound-pins.mjs" --new-only --limit "$LIMIT" >>"$LOG" 2>&1
pub_rc=$?
set -e
log "publish exit=$pub_rc"
if [[ "$pub_rc" -ne 0 ]]; then
  exit "$pub_rc"
fi

log "==> enrich IPA + female/male TTS"
set +e
npx tsx "$ROOT/scripts/enrich-sound-pins.ts" --limit "$LIMIT" >>"$LOG" 2>&1
en_rc=$?
set -e
log "enrich exit=$en_rc"
if [[ "$en_rc" -ne 0 ]]; then
  exit "$en_rc"
fi

log "==> deploy eigopin (sound.eigopin.com)"
set +e
bash "$ROOT/scripts/deploy-eigopin.sh" >>"$LOG" 2>&1
dep_rc=$?
set -e
log "deploy exit=$dep_rc"
if [[ "$dep_rc" -ne 0 ]]; then
  exit "$dep_rc"
fi

log "==> verify live /sound-of/{slug}"
set +e
"$NODE" "$ROOT/scripts/verify-sound-live.mjs" >>"$LOG" 2>&1
ver_rc=$?
set -e
log "verify exit=$ver_rc"
if [[ "$ver_rc" -ne 0 ]]; then
  log "WARN some pages not live yet — pin will wait/skip"
fi

log "==> pinterest board=$BOARD (catch-up + up to $LIMIT)"
set +e
"$NODE" "$ROOT/scripts/pin-sound-samples.mjs" --catch-up --count "$LIMIT" --board "$BOARD" >>"$LOG" 2>&1
pin_rc=$?
set -e
log "pin exit=$pin_rc"
if [[ "$pin_rc" -ne 0 ]]; then
  log "pin had failures — retry: yarn sound:pin:catchup --board English"
fi

exit "$pin_rc"
