#!/usr/bin/env bash
# Sync korean-teacher-mj to V100 lab-worker and start capybara render service.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${CAPYBARA_RENDER_SSH:-lab-worker}"
REMOTE_DIR="${CAPYBARA_RENDER_REMOTE_DIR:-/home/user/korean-teacher-mj}"
SERVICE_NAME="capybara-render.service"

echo "→ Syncing to ${REMOTE}:${REMOTE_DIR}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .next \
  --exclude .git \
  --exclude .tmp \
  --exclude .vercel \
  "${ROOT}/" "${REMOTE}:${REMOTE_DIR}/"

echo "→ Installing deps + systemd user service on ${REMOTE}"
ssh -o BatchMode=yes "${REMOTE}" bash -s <<EOF
set -euo pipefail
cd ${REMOTE_DIR}

export NVM_DIR="\$HOME/.nvm"
if [[ -f "\$NVM_DIR/nvm.sh" ]]; then
  # shellcheck source=/dev/null
  . "\$NVM_DIR/nvm.sh"
  nvm use 20 >/dev/null 2>&1 || nvm use 22 >/dev/null 2>&1
fi

corepack enable 2>/dev/null || true
if command -v yarn >/dev/null 2>&1; then
  yarn install --frozen-lockfile 2>/dev/null || yarn install
else
  npm install
fi

mkdir -p "\$HOME/.config/systemd/user"
cat > "\$HOME/.config/systemd/user/${SERVICE_NAME}" <<UNIT
[Unit]
Description=Capybara grammar comparison render (Sharp)
After=network.target

[Service]
Type=simple
WorkingDirectory=${REMOTE_DIR}
Environment=CAPYBARA_RENDER_PORT=8766
Environment=CAPYBARA_RENDER_HOST=0.0.0.0
ExecStart=/bin/bash ${REMOTE_DIR}/render/run.sh
Restart=on-failure
RestartSec=3

[Install]
WantedBy=default.target
UNIT

systemctl --user daemon-reload
systemctl --user enable ${SERVICE_NAME}
systemctl --user restart ${SERVICE_NAME}
sleep 2
curl -sS http://127.0.0.1:8766/health
echo
systemctl --user status ${SERVICE_NAME} --no-pager | head -12
EOF

echo "✓ Deployed. Tunnel from laptop:"
echo "  ssh -L 8766:10.10.10.14:8766 lab-master"
echo "  CAPYBARA_RENDER_SERVICE_URL=http://127.0.0.1:8766"
