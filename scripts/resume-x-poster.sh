#!/usr/bin/env bash
# Resume capybara X auto-posting: reinstall lab-worker cron + remove PAUSED flag.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
rm -f "${ROOT}/x-poster/PAUSED"
exec bash "${ROOT}/scripts/deploy-x-poster.sh"
