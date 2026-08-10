#!/bin/bash
# Keep multilingual top10×6 generation alive until 60 done (or progress says so).
set -euo pipefail
ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
OUT="$ROOT/.tmp/vocab-multilingual-top10"
LOG="$OUT/batch.stdout.log"
mkdir -p "$OUT"
cd "$ROOT"

done_count() {
  python3 - <<'PY'
import json
from pathlib import Path
p=Path("/Users/minjaekim/Desktop/korean-teacher-mj/.tmp/vocab-multilingual-top10/progress.json")
if not p.exists():
  print(0); raise SystemExit
d=json.loads(p.read_text())
print(len(d.get("done") or {}))
PY
}

TARGET=60
PASS=0
while true; do
  N=$(done_count)
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] watchdog pass=$PASS done=$N/$TARGET" | tee -a "$LOG"
  if [ "$N" -ge "$TARGET" ]; then
    echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] watchdog complete" | tee -a "$LOG"
    break
  fi
  PASS=$((PASS+1))
  caffeinate -i npx tsx scripts/generate-multilingual-vocab-samples.ts --top 10 --limit 60 >>"$LOG" 2>&1 || true
  echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] generator exited; restarting in 5s" | tee -a "$LOG"
  sleep 5
done
