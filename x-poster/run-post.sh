#!/usr/bin/env bash
# One X post per invocation (cron runs 3× daily).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/x-poster/worker-runtime.env" ]]; then
  set -a
  # shellcheck source=/dev/null
  . "$ROOT/x-poster/worker-runtime.env"
  set +a
fi

if [[ -f "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1 || true
fi

export CAPYBARA_RENDER_SERVICE_URL="${CAPYBARA_RENDER_SERVICE_URL:-http://127.0.0.1:8766}"

exec npx tsx scripts/post-grammar-x.ts --count 1
