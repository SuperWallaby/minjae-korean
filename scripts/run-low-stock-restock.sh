#!/usr/bin/env bash
# Wait for register-wave1 (if running), then generate thin-format restock queue.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/.tmp/vocab-infographic-gen"
IDS="$OUT/ids-low-stock-restock.json"
LOG="$ROOT/logs/low-stock-restock-$(date +%Y%m%d-%H%M%S).log"
mkdir -p "$OUT" "$ROOT/logs"

export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"
export VOCAB_OUT="$OUT"
export VOCAB_AUTO_REVIEW_X=1

echo "pid $$" | tee "$OUT/low-stock-restock.pid"
echo "log $LOG"

# Wait for wave1 batch if still alive
WAVE1_PID="$(pgrep -f 'batch-generate-vocab-infographics.ts --ids-file .*ids-register-wave1' | head -1 || true)"
if [[ -n "${WAVE1_PID}" ]]; then
  echo "waiting for wave1 pid=$WAVE1_PID …"
  while kill -0 "$WAVE1_PID" 2>/dev/null; do
    sleep 30
  done
  echo "wave1 finished"
fi

# Rebuild ids against current disk stock (target 45 per thin format)
npx tsx -e '
import { writeFileSync, mkdirSync, existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { ALL_VOCAB_BUNDLES } from "./src/lib/vocabInfographic/bundle-catalog.ts";
import { DROP_IDS } from "./scripts/lib/vocab-batch-config.mjs";

const OUT = ".tmp/vocab-infographic-gen";
const TARGET = 45;
const ORDER = ["compound_word","grammar_spotlight","pronunciation_grid","cute_cast","hanja_hub","quiz_comment"] as const;
let skipped: Record<string, unknown> = {};
try { skipped = JSON.parse(readFileSync(OUT+"/progress.json","utf8")).skipped || {}; } catch {}
const ready: Record<string, number> = {};
const pendingByFmt: Record<string, string[]> = {};
for (const f of ORDER) { ready[f]=0; pendingByFmt[f]=[]; }
const byId = new Map(ALL_VOCAB_BUNDLES.map(b=>[b.id,b]));
for (const f of readdirSync(OUT).filter(n=>n.endsWith(".png")&&!n.includes("_raw")&&!n.includes("_ill")&&!n.startsWith("_"))) {
  const b = byId.get(f.replace(/\.png$/, ""));
  if (b && (ORDER as readonly string[]).includes(b.format)) ready[b.format]++;
}
for (const b of ALL_VOCAB_BUNDLES) {
  if (!(ORDER as readonly string[]).includes(b.format)) continue;
  if (DROP_IDS.has(b.id) || skipped[b.id]) continue;
  if (existsSync(join(OUT, b.id+".png")) && existsSync(join(OUT, b.id+"_raw.png"))) continue;
  pendingByFmt[b.format as typeof ORDER[number]].push(b.id);
}
const pick: string[] = [];
const plan: Record<string, unknown> = {};
for (const f of ORDER) {
  const gap = Math.max(0, TARGET - (ready[f]||0));
  const take = Math.min(gap, pendingByFmt[f].length);
  plan[f] = { ready: ready[f], gap, pendingAvail: pendingByFmt[f].length, take };
  pick.push(...pendingByFmt[f].slice(0, take));
}
mkdirSync(OUT, { recursive: true });
writeFileSync(OUT+"/ids-low-stock-restock.json", JSON.stringify({ target: TARGET, plan, ids: pick, createdAt: new Date().toISOString() }, null, 2));
console.log(JSON.stringify({ totalIds: pick.length, plan }, null, 2));
'

if [[ ! -s "$IDS" ]]; then
  echo "no ids file" >&2
  exit 1
fi

COUNT="$(npx tsx -e 'const j=require("./.tmp/vocab-infographic-gen/ids-low-stock-restock.json"); console.log((j.ids||[]).length)')"
echo "queue size: $COUNT"
if [[ "$COUNT" -eq 0 ]]; then
  echo "nothing to generate"
  exit 0
fi

exec npx tsx scripts/batch-generate-vocab-infographics.ts \
  --ids-file "$IDS" \
  2>&1 | tee -a "$LOG"
