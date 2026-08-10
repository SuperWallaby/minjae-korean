#!/bin/bash
set -u
cd /Users/minjaekim/Desktop/korean-teacher-mj
LOG="${1:?}"
BATCH=80
CONCURRENCY=2
round=0
while true; do
  round=$((round+1))
  echo ""
  echo "======== round $round batch=$BATCH c=$CONCURRENCY $(date -Iseconds) ========" | tee -a "$LOG"
  # Count before
  before=$(node -e 'try{const l=require("./.tmp/quiz-word-pins/word-pin-ledger.json");console.log(Object.values(l).filter(x=>x.status==="ok").length)}catch{console.log(0)}')
  node --max-old-space-size=3072 scripts/gen-quiz-word-pins.mjs --limit "$BATCH" --seo-only --concurrency "$CONCURRENCY" >>"$LOG" 2>&1
  code=$?
  after=$(node -e 'try{const l=require("./.tmp/quiz-word-pins/word-pin-ledger.json");console.log(Object.values(l).filter(x=>x.status==="ok").length)}catch{console.log(0)}')
  echo "round $round exit=$code ok_before=$before ok_after=$after" | tee -a "$LOG"
  if [ "$after" -le "$before" ]; then
    # No progress — either done or stuck
    grep -q "nothing to generate" <(tail -20 "$LOG") && echo "[loop] done" | tee -a "$LOG" && break
    if [ "$code" -ne 0 ]; then
      echo "[loop] failed with no progress, retry in 5s" | tee -a "$LOG"
      sleep 5
      continue
    fi
    echo "[loop] no progress exit=0 — finished" | tee -a "$LOG"
    break
  fi
  # soft cool-down for memory
  sleep 1
done
echo "[loop] complete $(date -Iseconds) final_ok=$(node -e 'try{const l=require("./.tmp/quiz-word-pins/word-pin-ledger.json");console.log(Object.values(l).filter(x=>x.status==="ok").length)}catch{console.log(0)}')" | tee -a "$LOG"
