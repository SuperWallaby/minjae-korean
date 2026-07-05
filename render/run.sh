#!/usr/bin/env bash
# Start capybara render sidecar (V100 worker or local).
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -f "$HOME/.nvm/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "$HOME/.nvm/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1 || true
fi

export CAPYBARA_RENDER_PORT="${CAPYBARA_RENDER_PORT:-8766}"
export CAPYBARA_RENDER_HOST="${CAPYBARA_RENDER_HOST:-0.0.0.0}"

exec npx tsx render/server.ts
