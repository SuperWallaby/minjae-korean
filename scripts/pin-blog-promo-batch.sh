#!/usr/bin/env bash
# Generate (and optionally pin) tall blog/news promo images.
#
#   ./scripts/pin-blog-promo-batch.sh 3          # generate up to 3 unfinished blog pins
#   ./scripts/pin-blog-promo-batch.sh 3 --news  # news from public API
#   ./scripts/pin-blog-promo-batch.sh 1 --slug is-korean-hard-to-learn
#
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

LIMIT="${1:-5}"
shift || true

EXTRA=()
MODE_BLOG=1
MODE_NEWS=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --news) MODE_NEWS=1; MODE_BLOG=0; shift ;;
    --blog) MODE_BLOG=1; shift ;;
    --both) MODE_BLOG=1; MODE_NEWS=1; shift ;;
    --slug) EXTRA+=(--slug "$2"); shift 2 ;;
    --force) EXTRA+=(--force); shift ;;
    --upload-r2) EXTRA+=(--upload-r2); shift ;;
    --dry-run) EXTRA+=(--dry-run); shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

ARGS=(--limit "$LIMIT")
if [[ "$MODE_BLOG" -eq 1 ]]; then ARGS+=(--blog); fi
if [[ "$MODE_NEWS" -eq 1 ]]; then ARGS+=(--news); fi
ARGS+=("${EXTRA[@]}")

echo "==> gen-content-promo-pins ${ARGS[*]}"
node scripts/gen-content-promo-pins.mjs "${ARGS[@]}"
