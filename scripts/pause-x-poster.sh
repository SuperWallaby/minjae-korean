#!/usr/bin/env bash
# Pause capybara X auto-posting: remove lab-worker cron + PAUSED flag.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${X_POSTER_SSH:-lab-worker}"
REMOTE_DIR="${X_POSTER_REMOTE_DIR:-/home/user/korean-teacher-mj}"
CRON_MARK="# korean-teacher-mj-x-poster"

date -Iseconds > "${ROOT}/x-poster/PAUSED"

echo "→ Removing cron on ${REMOTE}"
ssh -o BatchMode=yes "${REMOTE}" bash -s <<EOF
set -euo pipefail
( crontab -l 2>/dev/null | grep -v "${CRON_MARK}" || true ) | crontab -
touch ${REMOTE_DIR}/x-poster/PAUSED
echo "[x-poster] paused \$(date -Iseconds)" >> ${REMOTE_DIR}/x-poster/post.log
echo "Remaining crontab lines with x-poster:"
crontab -l 2>/dev/null | grep -i x-poster || echo "(none)"
EOF

echo "✓ X poster paused. Resume: bash scripts/resume-x-poster.sh"
