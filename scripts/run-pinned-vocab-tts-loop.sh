#!/usr/bin/env bash
# Keep filling pinned /vocab SEO TTS until backlog is empty.
# Survives SSH flaps / process death — restarts every round.
#
#   ./scripts/run-pinned-vocab-tts-loop.sh
#   MAX_ROUNDS=5 ./scripts/run-pinned-vocab-tts-loop.sh
#
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

OUT="$ROOT/.tmp/vocab-infographic-gen"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"

LOOP_LOCK="$OUT/pinned-vocab-tts-loop.lock"
LOG="$LOG_DIR/pinned-vocab-tts-loop-$(date +%Y%m%d-%H%M%S).log"
LATEST="$LOG_DIR/pinned-vocab-tts-loop.latest"
MAX_ROUNDS="${MAX_ROUNDS:-80}"
ROUND_PAUSE_SEC="${ROUND_PAUSE_SEC:-8}"
LIMIT_PER_ROUND="${LIMIT_PER_ROUND:-8}"

if [[ -f "$LOOP_LOCK" ]]; then
  old="$(cat "$LOOP_LOCK" 2>/dev/null || true)"
  if [[ -n "${old:-}" ]] && kill -0 "$old" 2>/dev/null; then
    echo "loop already running pid=$old" >&2
    exit 0
  fi
fi
echo $$ >"$LOOP_LOCK"
trap 'rm -f "$LOOP_LOCK"' EXIT
ln -sfn "$LOG" "$LATEST"

need_count() {
  node --input-type=module <<'EOF'
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
const n = (pub.pages || []).filter((p) => set.has(p.bundleId) && needTts(p)).length;
console.log(n);
EOF
}

echo "==> TTS loop start $(date -Iseconds) maxRounds=${MAX_ROUNDS} limit/round=${LIMIT_PER_ROUND}" | tee -a "$LOG"

round=0
while (( round < MAX_ROUNDS )); do
  round=$((round + 1))
  need="$(need_count || echo 0)"
  echo "" | tee -a "$LOG"
  echo "── round ${round}/${MAX_ROUNDS} needTts=${need} $(date -Iseconds) ──" | tee -a "$LOG"
  if [[ "${need}" == "0" ]]; then
    echo "backlog empty — done" | tee -a "$LOG"
    exit 0
  fi

  FORCE_UNLOCK=1 bash "$ROOT/scripts/run-pinned-vocab-tts.sh" --limit "$LIMIT_PER_ROUND" >>"$LOG" 2>&1
  rc=$?
  after="$(need_count || echo '?')"
  echo "   round exit=${rc} needTts after=${after}" | tee -a "$LOG"

  if [[ "${after}" == "0" ]]; then
    echo "backlog empty — done" | tee -a "$LOG"
    exit 0
  fi
  sleep "$ROUND_PAUSE_SEC"
done

echo "gave up after ${MAX_ROUNDS} rounds (needTts=$(need_count || echo '?'))" | tee -a "$LOG" >&2
exit 1
