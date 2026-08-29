#!/usr/bin/env bash
# Install daily EigoSound release (gen 8 + publish + TTS + deploy + Pinterest English board).
set -euo pipefail

ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
APP_SUPPORT="$HOME/Library/Application Support/kaja/sound-daily"
LABEL="com.eigopin.sound-daily"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"
UID_N="$(id -u)"
NODE="/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node"

mkdir -p "$APP_SUPPORT/logs"
cp "$ROOT/scripts/run-sound-daily.sh" "$APP_SUPPORT/daemon.sh"
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
    <integer>10</integer>
    <key>Minute</key>
    <integer>20</integer>
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
    <key>SOUND_ROOT</key>
    <string>${ROOT}</string>
    <key>SOUND_APP_SUPPORT</key>
    <string>${APP_SUPPORT}</string>
    <key>SOUND_DAILY_LIMIT</key>
    <string>8</string>
    <key>PINTEREST_SOUND_BOARD_NAME</key>
    <string>English</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/${UID_N}" "$PLIST_DST"
launchctl enable "gui/${UID_N}/${LABEL}" 2>/dev/null || true

echo "==> ${LABEL} installed (wake 10:20, jitter 0–20m → ~10:30 ±10m; not on login)"
launchctl print "gui/${UID_N}/${LABEL}" 2>&1 | grep -E 'state|runs|path' | head -12
echo "Log: ${APP_SUPPORT}/logs/daily.latest"
echo "Run now:  SOUND_SKIP_START_JITTER=1 launchctl kickstart -k gui/${UID_N}/${LABEL}"
echo "Stop:     launchctl bootout gui/${UID_N}/${LABEL}"
