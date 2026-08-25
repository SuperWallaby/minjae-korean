#!/usr/bin/env bash
# Deploy Eigopin (eigopin.com) without leaving the Kaja Vercel link stuck.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

KAJA_JSON="$ROOT/.vercel/project.json"
BACKUP="$ROOT/.vercel/project.json.minjae-korean.bak"
EIGOPIN_JSON="$ROOT/.vercel/project.json.eigopin"

mkdir -p "$ROOT/.vercel"
if [[ -f "$KAJA_JSON" ]]; then
  cp "$KAJA_JSON" "$BACKUP"
fi

cat >"$EIGOPIN_JSON" <<'EOF'
{"projectId":"prj_SAbRgg2e1d2KA3nk3TXJBq9mNd2i","orgId":"team_aw0w4UfF1eqmr2c5QtvO8sAY","projectName":"eigopin"}
EOF

restore_kaja() {
  if [[ -f "$BACKUP" ]]; then
    cp "$BACKUP" "$KAJA_JSON"
  fi
}
trap restore_kaja EXIT

cp "$EIGOPIN_JSON" "$KAJA_JSON"
# Force ja-only build scope (skip ~5k Kaja SEO pages). vercel.eigopin.json also sets this.
export NEXT_PUBLIC_SITE_MODE="${NEXT_PUBLIC_SITE_MODE:-eigopin}"
export NEXT_PUBLIC_JA_SITE_ORIGIN="${NEXT_PUBLIC_JA_SITE_ORIGIN:-https://eigopin.com}"
npx vercel deploy --prod --yes --scope managertrbox-7710s-projects --local-config vercel.eigopin.json
