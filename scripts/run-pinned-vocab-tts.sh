#!/usr/bin/env bash
# Incremental SEO TTS for Pinterest-pinned /vocab pages.
# Examples → SoVITS on lab-worker (V100) via SSH; short/long words → Edge.
#
#   ./scripts/run-pinned-vocab-tts.sh
#   ./scripts/run-pinned-vocab-tts.sh --limit 5
#   FORCE_UNLOCK=1 ./scripts/run-pinned-vocab-tts.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"

LOCK="$OUT/pinned-vocab-tts.lock"
LOG="$LOG_DIR/pinned-vocab-tts-$(date +%Y%m%d-%H%M%S).log"
LATEST="$LOG_DIR/pinned-vocab-tts.latest"

if [[ -f "$LOCK" ]]; then
  old_pid="$(cat "$LOCK" 2>/dev/null || true)"
  if [[ -n "${old_pid:-}" ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "already running pid=$old_pid (lock=$LOCK)" >&2
    exit 0
  fi
  if [[ "${FORCE_UNLOCK:-}" == "1" ]]; then
    rm -f "$LOCK"
  else
    echo "stale lock $LOCK (pid=$old_pid) — re-run with FORCE_UNLOCK=1" >&2
    exit 1
  fi
fi

echo $$ >"$LOCK"
trap 'rm -f "$LOCK"' EXIT

ln -sfn "$LOG" "$LATEST"
echo "==> pinned vocab TTS $(date -Iseconds)" | tee -a "$LOG"
echo "    log=$LOG" | tee -a "$LOG"
echo "    SSH host: ${VOCAB_TTS_SSH:-lab-worker}" | tee -a "$LOG"

# Preflight GPU host (SoVITS examples)
if ! ssh -o ConnectTimeout=12 -o BatchMode=yes "${VOCAB_TTS_SSH:-lab-worker}" \
  'test -x ~/v100/gpt-sovits/conda-env/bin/python && test -f ~/v100/auto-video-korean/scripts/generate_korean_quiz_tts.py' \
  >>"$LOG" 2>&1; then
  echo "!! lab-worker SoVITS path check failed — abort" | tee -a "$LOG" >&2
  exit 2
fi

# yarn vocab:enrich -- --tts-only --pinned-only [extra args]
export NODE_OPTIONS="${NODE_OPTIONS:-}"
set +e
yarn vocab:enrich -- --tts-only --pinned-only "$@" >>"$LOG" 2>&1
rc=$?
set -e

echo "" | tee -a "$LOG"
echo "==> done exit=${rc} $(date -Iseconds)" | tee -a "$LOG"
exit "$rc"
