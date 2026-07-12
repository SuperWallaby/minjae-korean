#!/usr/bin/env bash
# Resilient vocab Pinterest batch — resumes until COUNT new pins succeed.
#
#   ./scripts/pin-vocab-batch.sh 25
#   COUNT=25 ./scripts/pin-vocab-batch.sh
#
# Per-pin retries live in pin-vocab-infographics.mjs.
# This wrapper restarts the batch if the Node process dies mid-run.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="$ROOT/.tmp/vocab-infographic-gen"
PINNED="$OUT/pinterest-pinned.json"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"

COUNT="${COUNT:-${1:-25}}"
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  shift || true
fi
MAX_ROUNDS="${MAX_ROUNDS:-40}"
ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-15}"
CHROME_DEBUG_URL="${CHROME_WORK_DEBUG_URL:-http://127.0.0.1:9222}"
AVK="${ROOT}/../projects/neo-project/auto-video-korean"

pinned_count() {
  node -e "
    const fs=require('fs');
    const p=process.argv[1];
    if(!fs.existsSync(p)){console.log(0);process.exit(0)}
    try{console.log(Object.keys(JSON.parse(fs.readFileSync(p,'utf8'))).length)}
    catch{console.log(0)}
  " "$PINNED"
}

ensure_chrome() {
  if curl -sf "${CHROME_DEBUG_URL}/json/version" >/dev/null; then
    return 0
  fi
  echo "→ starting work Chrome (debug ${CHROME_DEBUG_URL})"
  if [[ -x "${AVK}/scripts/launch-chrome-work-profile.sh" ]]; then
    "${AVK}/scripts/launch-chrome-work-profile.sh" "about:blank" >/dev/null 2>&1 &
  fi
  for _ in $(seq 1 25); do
    if curl -sf "${CHROME_DEBUG_URL}/json/version" >/dev/null; then
      return 0
    fi
    sleep 1
  done
  echo "work Chrome is not running on ${CHROME_DEBUG_URL}" >&2
  return 1
}

START_PINNED="$(pinned_count)"
TARGET=$((START_PINNED + COUNT))
LOG="${LOG_DIR}/pin-vocab-batch-$(date +%Y%m%d-%H%M%S).log"

echo "==> Vocab pin batch: need +${COUNT} pins (start=${START_PINNED} target=${TARGET})"
echo "    log=${LOG}"

ensure_chrome

round=0
while (( round < MAX_ROUNDS )); do
  round=$((round + 1))
  now="$(pinned_count)"
  need=$((TARGET - now))
  if (( need <= 0 )); then
    echo "done: reached +${COUNT} (pinned=${now})"
    exit 0
  fi

  echo ""
  echo "── round ${round}/${MAX_ROUNDS}: need ${need} more (pinned=${now}) ──" | tee -a "$LOG"
  ensure_chrome || {
    echo "chrome down; pause ${ROUND_PAUSE_SEC}s" | tee -a "$LOG"
    sleep "$ROUND_PAUSE_SEC"
    continue
  }

  set +e
  node "$ROOT/scripts/pin-vocab-infographics.mjs" --count "$need" "$@" >>"$LOG" 2>&1
  rc=$?
  set -e

  after="$(pinned_count)"
  gained=$((after - now))
  echo "   round exit=${rc} gained=${gained} pinned=${after}" | tee -a "$LOG"

  if (( after >= TARGET )); then
    echo "done: reached +${COUNT} (pinned=${after})"
    exit 0
  fi

  if (( gained <= 0 )); then
    echo "   no progress; pause ${ROUND_PAUSE_SEC}s then retry…" | tee -a "$LOG"
  else
    echo "   partial progress; continuing…" | tee -a "$LOG"
  fi
  sleep "$ROUND_PAUSE_SEC"
done

echo "gave up after ${MAX_ROUNDS} rounds (pinned=$(pinned_count), target=${TARGET})" >&2
exit 1
