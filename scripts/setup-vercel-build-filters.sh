#!/usr/bin/env bash
# Wire Vercel Ignored Build Step so one GitHub push does not rebuild every site.
#
#   bash scripts/setup-vercel-build-filters.sh
#   bash scripts/setup-vercel-build-filters.sh --dry-run
#
# After running once, only the site whose paths changed will build on push.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

SCOPE="${VERCEL_SCOPE:-managertrbox-7710s-projects}"
DRY=0
[[ "${1:-}" == "--dry-run" ]] && DRY=1

apply_ignore() {
  local project="$1"
  local cmd="node scripts/vercel-should-build.mjs ${project}"
  echo "→ ${project}: ${cmd}"
  if [[ "$DRY" == "1" ]]; then
    return 0
  fi
  npx vercel api "/v9/projects/${project}" -X PATCH \
    --scope "$SCOPE" \
    --field "commandForIgnoringBuildStep=${cmd}" \
    >/dev/null
  echo "  applied"
}

echo "Vercel ignored build step (scope=${SCOPE})"
apply_ignore "minjae-korean"
apply_ignore "getpronounce"

# eigopin is CLI-only today; skip unless Git-linked later.
if npx vercel api "/v9/projects/eigopin" --scope "$SCOPE" 2>/dev/null \
  | rg -q '"type"[[:space:]]*:[[:space:]]*"github"'; then
  apply_ignore "eigopin"
else
  echo "→ eigopin: skip (no GitHub link — use scripts/deploy-eigopin.sh)"
fi

echo "Done. Test locally:"
echo "  node scripts/vercel-should-build.mjs minjae-korean; echo exit=\$?"
echo "  node scripts/vercel-should-build.mjs getpronounce; echo exit=\$?"
