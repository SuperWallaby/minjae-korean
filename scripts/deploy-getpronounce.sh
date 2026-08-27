#!/usr/bin/env bash
# Deploy GetPronounce (getpronounce.net) without leaving the Kaja Vercel link stuck.
# Auto: GitHub main → Vercel project getpronounce (see docs/design/getpronounce.md).
# Catalog pipeline also POSTs .tmp/getpronounce-deploy-hook after auto-push.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

DO_PROMOTE="${PRONOUNCE_VERCEL_PROMOTE:-1}"
VERCEL_ARGS=()
for arg in "$@"; do
  if [[ "$arg" == "--promote" ]]; then
    DO_PROMOTE=1
  elif [[ "$arg" == "--no-promote" ]]; then
    DO_PROMOTE=0
  else
    VERCEL_ARGS+=("$arg")
  fi
done

KAJA_JSON="$ROOT/.vercel/project.json"
BACKUP="$ROOT/.vercel/project.json.minjae-korean.bak"
PRONOUNCE_JSON="$ROOT/.vercel/project.json.getpronounce"

mkdir -p "$ROOT/.vercel"
if [[ -f "$KAJA_JSON" ]]; then
  cp "$KAJA_JSON" "$BACKUP"
fi

if [[ ! -f "$PRONOUNCE_JSON" ]]; then
  echo "missing $PRONOUNCE_JSON — create getpronounce Vercel project first"
  exit 1
fi

restore_kaja() {
  if [[ -f "$BACKUP" ]]; then
    cp "$BACKUP" "$KAJA_JSON"
  fi
}
trap restore_kaja EXIT

cp "$PRONOUNCE_JSON" "$KAJA_JSON"
export NEXT_PUBLIC_SITE_MODE="${NEXT_PUBLIC_SITE_MODE:-pronounce}"
export NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN="${NEXT_PUBLIC_PRONOUNCE_SITE_ORIGIN:-https://getpronounce.net}"
echo "Deploy getpronounce.net → Vercel project getpronounce"
echo "After deploy: Vercel → Domains → getpronounce.net + www (DNS CNAME)"

DEPLOY_LOG="$(mktemp)"
set +e
if ((${#VERCEL_ARGS[@]})); then
  npx vercel deploy --prod --yes --scope managertrbox-7710s-projects --local-config vercel.getpronounce.json "${VERCEL_ARGS[@]}" 2>&1 | tee "$DEPLOY_LOG"
else
  npx vercel deploy --prod --yes --scope managertrbox-7710s-projects --local-config vercel.getpronounce.json 2>&1 | tee "$DEPLOY_LOG"
fi
deploy_rc=${PIPESTATUS[0]}
set -e

if [[ "$deploy_rc" -ne 0 ]]; then
  echo "vercel deploy failed (exit $deploy_rc)" >&2
  exit "$deploy_rc"
fi

# Emergency backup may pin production to an older deployment — promote the build we just uploaded.
if [[ "$DO_PROMOTE" == "1" ]]; then
  DEPLOY_URL="$(grep -oE 'https://[^[:space:]]+\.vercel\.app' "$DEPLOY_LOG" | tail -1)"
  if [[ -z "$DEPLOY_URL" ]]; then
    DEPLOY_URL="$(npx vercel ls getpronounce --scope managertrbox-7710s-projects 2>/dev/null | awk '/Ready/ {print $2; exit}')"
  fi
  if [[ -n "$DEPLOY_URL" ]]; then
    echo "Promote → production: $DEPLOY_URL"
    npx vercel promote "$DEPLOY_URL" --yes --scope managertrbox-7710s-projects --timeout 5m
    mkdir -p "$ROOT/.tmp"
    printf '%s\n' "$DEPLOY_URL" >"$ROOT/.tmp/getpronounce-production-deployment.url"
    echo "Pinned production deployment for catalog auto-push re-promote"
  else
    echo "WARN: could not detect deployment URL for vercel promote — promote manually in Vercel dashboard" >&2
  fi
fi
rm -f "$DEPLOY_LOG"
