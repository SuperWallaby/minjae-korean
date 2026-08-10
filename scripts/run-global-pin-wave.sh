#!/usr/bin/env bash
# Generate a small global-lang buffer, publish catalog, then pin on Account B (:9224).
# Safe to re-run — skips already-generated / already-pinned ids.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/.tmp/global-lang-en-samples"
LOG_DIR="$OUT/logs"
mkdir -p "$LOG_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
LOG="$LOG_DIR/pin-wave-$STAMP.log"
ln -sfn "$LOG" "$LOG_DIR/pin-wave.latest"
AVK="${ROOT}/../projects/neo-project/auto-video-korean"
GEN_LIMIT="${GEN_LIMIT:-18}"
PIN_COUNT="${PIN_COUNT:-3}"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"

echo "log=$LOG" | tee "$LOG"
echo "genLimit=$GEN_LIMIT pinCount=$PIN_COUNT" | tee -a "$LOG"

# Ensure multilingual Chrome
if [[ -x "$AVK/scripts/launch-chrome-pinterest-multilingual.sh" ]]; then
  bash "$AVK/scripts/launch-chrome-pinterest-multilingual.sh" "https://www.pinterest.com/" >>"$LOG" 2>&1 || true
fi
for _ in $(seq 1 30); do
  curl -sf http://127.0.0.1:9224/json/version >/dev/null && break
  sleep 1
done
if ! curl -sf http://127.0.0.1:9224/json/version >/dev/null; then
  echo "multilingual Chrome :9224 not ready" | tee -a "$LOG" >&2
  exit 1
fi

unpinned_count() {
  node -e '
    const fs=require("fs"); const path=require("path");
    const OUT=process.argv[1];
    const pinned=fs.existsSync(path.join(OUT,"pinterest-pinned.json"))
      ? JSON.parse(fs.readFileSync(path.join(OUT,"pinterest-pinned.json"),"utf8")) : {};
    let n=0;
    for (const f of fs.readdirSync(OUT)) {
      if (!f.endsWith(".json") || f.includes("pinned") || f.includes("progress")) continue;
      const meta=JSON.parse(fs.readFileSync(path.join(OUT,f),"utf8"));
      const id=meta?.id; if (!id || pinned[id]) continue;
      if (fs.existsSync(path.join(OUT, id+".png"))) n++;
    }
    console.log(n);
  ' "$OUT"
}

NEED_BEFORE="$(unpinned_count)"
echo "unpinned ready before gen: $NEED_BEFORE" | tee -a "$LOG"

if (( NEED_BEFORE < PIN_COUNT )); then
  echo "==> generate up to $GEN_LIMIT new global pins" | tee -a "$LOG"
  caffeinate -i npx tsx scripts/generate-global-lang-en-samples.ts --limit "$GEN_LIMIT" >>"$LOG" 2>&1
fi

echo "==> publish global pin catalog" | tee -a "$LOG"
node scripts/publish-global-pins.mjs >>"$LOG" 2>&1 || true

NEED_AFTER="$(unpinned_count)"
echo "unpinned ready after gen: $NEED_AFTER" | tee -a "$LOG"
if (( NEED_AFTER <= 0 )); then
  echo "nothing to pin" | tee -a "$LOG"
  exit 0
fi

PIN_N="$PIN_COUNT"
if (( NEED_AFTER < PIN_N )); then PIN_N="$NEED_AFTER"; fi

echo "==> pin $PIN_N global pins on :9224" | tee -a "$LOG"
caffeinate -i node scripts/pin-global-lang-samples.mjs --count "$PIN_N" >>"$LOG" 2>&1
echo "done global pin wave" | tee -a "$LOG"
