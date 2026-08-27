#!/usr/bin/env bash
# After SoVITS slots are ready: backfill ES dual-accent TTS → push catalog → deploy + promote.
#
#   bash scripts/post-getpronounce-ready.sh              # wait GPU, enrich, deploy
#   bash scripts/post-getpronounce-ready.sh --skip-wait  # enrich+deploy now
#   bash scripts/post-getpronounce-ready.sh --enrich-only
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LOG="$ROOT/.tmp/post-getpronounce-ready.log"
mkdir -p "$(dirname "$LOG")"

SKIP_WAIT=0
ENRICH_ONLY=0
SKIP_DEPLOY=0
for arg in "$@"; do
  case "$arg" in
    --skip-wait) SKIP_WAIT=1 ;;
    --enrich-only) ENRICH_ONLY=1 ;;
    --skip-deploy) SKIP_DEPLOY=1 ;;
  esac
done

log() {
  echo "$(date -Iseconds) $*" | tee -a "$LOG"
}

slot_ready() {
  local slot="$1"
  ssh -o BatchMode=yes -o ConnectTimeout=15 lab-worker \
    "test -f /home/user/v100/gpt-sovits/SoVITS_weights_v2ProPlus/getpronounce_${slot}.pth \
      && test -f /home/user/v100/gpt-sovits/GPT_weights_v2ProPlus/getpronounce_${slot}-latest.ckpt" \
    2>/dev/null
}

wait_for_gpu_slots() {
  local slots=(cn-female cn-male es-latam-female es-latam-male es-es-female es-es-male)
  log "waiting for SoVITS slots: ${slots[*]}"
  while true; do
    local missing=()
    for slot in "${slots[@]}"; do
      slot_ready "$slot" || missing+=("$slot")
    done
    if ((${#missing[@]} == 0)); then
      log "all SoVITS slots ready"
      return 0
    fi
    # Retry LatAm female if male finished but female still missing
    if slot_ready es-latam-male && ! slot_ready es-latam-female; then
      if ! pgrep -f "train-zh-voice-slot.sh es-latam-female" >/dev/null 2>&1; then
        log "retry es-latam-female on GPU1"
        ssh -o BatchMode=yes lab-worker "nohup bash -c '
          export VOICE_ROOT=/home/user/v100/gpt-sovits SKIP_ASR=1 CUDA_VISIBLE_DEVICES=1 BATCH_S2=1 BATCH_GPT=2 MASTER_PORT=29531
          cd /home/user/v100/gpt-sovits
          rm -f logs/getpronounce_es-latam-female/2-name2text-0.txt logs/getpronounce_es-latam-female/2-name2text.txt
          ASR_LANG=en EXP_NAME=getpronounce_es-latam-female bash /home/user/korean-teacher-mj/scripts/train-zh-voice-slot.sh es-latam-female
        ' >> /home/user/v100/gpt-sovits/logs/es-latam-female-retry.log 2>&1 &" || true
      fi
    fi
    log "missing (${#missing[@]}): ${missing[*]}"
    sleep 120
  done
}

enrich_spanish_dual() {
  log "ES dual-accent enrich (Edge TTS → R2 + published.json)"
  local ids
  ids="$(node -e "
    const p=require('./src/data/globalPins/published.json');
    console.log((p.pages||[]).filter(x=>x.lang==='es').map(x=>x.id).join('\n'));
  ")"
  local n=0 ok=0 fail=0
  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    n=$((n + 1))
    log "enrich [$n] $id"
    if yarn global:enrich -- --id "$id" --tts-only --force >>"$LOG" 2>&1; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1))
      log "WARN enrich failed $id"
    fi
  done <<< "$ids"
  log "enrich done ok=$ok fail=$fail"
}

push_catalog() {
  log "auto-push global catalog"
  node scripts/auto-push-global-catalog.mjs 2>&1 | tee -a "$LOG"
}

deploy_and_promote() {
  log "deploy getpronounce.net + promote to production"
  bash scripts/deploy-getpronounce.sh --promote 2>&1 | tee -a "$LOG"
}

log "=== post-getpronounce-ready start ==="

if [[ "$SKIP_WAIT" != "1" ]]; then
  wait_for_gpu_slots
fi

enrich_spanish_dual

if [[ "$ENRICH_ONLY" == "1" ]]; then
  log "enrich-only — done"
  exit 0
fi

push_catalog

if [[ "$SKIP_DEPLOY" != "1" ]]; then
  deploy_and_promote
fi

log "=== post-getpronounce-ready DONE ==="
