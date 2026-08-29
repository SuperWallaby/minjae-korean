#!/usr/bin/env bash
# Install daily EigoChart release (TTS + eigopin deploy + 6 Pinterest pins).
set -euo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
APP_SUPPORT="$HOME/Library/Application Support/kaja/ja-en-daily"
LABEL="com.eigopin.daily-release"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"
UID_N="$(id -u)"
NODE="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node"

mkdir -p "$APP_SUPPORT/logs"
cp "$ROOT/scripts/run-ja-en-daily.sh" "$APP_SUPPORT/daemon.sh"
chmod 755 "$APP_SUPPORT/daemon.sh"
xattr -c "$APP_SUPPORT/daemon.sh" 2>/dev/null || true

cat >"$PLIST_DST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>${APP_SUPPORT}/daemon.sh</string>
  </array>
  <key>WorkingDirectory</key>
  <string>${APP_SUPPORT}</string>
  <key>RunAtLoad</key>
  <false/>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>50</integer>
  </dict>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>${APP_SUPPORT}/logs/launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${APP_SUPPORT}/logs/launchd.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <key>HOME</key>
    <string>/Users/minjaekim</string>
    <key>NODE_BIN</key>
    <string>${NODE}</string>
    <key>JA_EN_ROOT</key>
    <string>${ROOT}</string>
    <key>JA_EN_APP_SUPPORT</key>
    <string>${APP_SUPPORT}</string>
    <key>JA_EN_DAILY_LIMIT</key>
    <string>6</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/${UID_N}" "$PLIST_DST"
launchctl enable "gui/${UID_N}/${LABEL}" 2>/dev/null || true

echo "==> ${LABEL} installed (wake 09:50, jitter 0–20m → ~10:00 ±10m; not on login)"
launchctl print "gui/${UID_N}/${LABEL}" 2>&1 | grep -E 'state|runs|path' | head -12
echo "Log: ${APP_SUPPORT}/logs/daily.latest"
echo "Run now:  JA_EN_SKIP_START_JITTER=1 launchctl kickstart -k gui/${UID_N}/${LABEL}"
echo "Stop:     launchctl bootout gui/${UID_N}/${LABEL}"
