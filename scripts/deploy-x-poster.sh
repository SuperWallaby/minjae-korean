#!/usr/bin/env bash
# Sync repo to lab-worker and install X poster cron (3× daily KST).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${X_POSTER_SSH:-lab-worker}"
REMOTE_DIR="${X_POSTER_REMOTE_DIR:-/home/user/korean-teacher-mj}"
CRON_MARK="# korean-teacher-mj-x-poster"

echo "→ Syncing to ${REMOTE}:${REMOTE_DIR}"
rsync -az \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .tmp \
  --exclude .vercel \
  --exclude x-poster/worker-runtime.env \
  "${ROOT}/" "${REMOTE}:${REMOTE_DIR}/"

if [[ -f "${ROOT}/x-poster/worker-runtime.env" ]]; then
  echo "→ Copying x-poster/worker-runtime.env (secrets)"
  scp -o BatchMode=yes "${ROOT}/x-poster/worker-runtime.env" \
    "${REMOTE}:${REMOTE_DIR}/x-poster/worker-runtime.env"
  ssh -o BatchMode=yes "${REMOTE}" "chmod 600 ${REMOTE_DIR}/x-poster/worker-runtime.env"
fi

echo "→ Installing deps + cron on ${REMOTE}"
ssh -o BatchMode=yes "${REMOTE}" bash -s <<EOF
set -euo pipefail
cd ${REMOTE_DIR}
chmod +x x-poster/run-post.sh

export NVM_DIR="\$HOME/.nvm"
if [[ -f "\$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "\$NVM_DIR/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1
fi

yarn install --frozen-lockfile 2>/dev/null || yarn install

mkdir -p x-poster
touch x-poster/post.log

CRON_LINE="0 9,15,21 * * * ${REMOTE_DIR}/x-poster/run-post.sh >> ${REMOTE_DIR}/x-poster/post.log 2>&1"
( crontab -l 2>/dev/null | grep -v "${CRON_MARK}" || true
  echo "\${CRON_LINE} ${CRON_MARK}"
) | crontab -

echo "Installed crontab:"
crontab -l | grep "${CRON_MARK}" || true

if [[ ! -f x-poster/worker-runtime.env ]]; then
  echo ""
  echo "⚠ Create x-poster/worker-runtime.env from worker-runtime.env.example (X + MongoDB keys)"
fi
EOF

echo "✓ X poster deployed. Test: ssh ${REMOTE} 'cd ${REMOTE_DIR} && npx tsx scripts/post-grammar-x.ts --dry-run'"
