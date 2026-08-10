#!/bin/bash
# Install / restart global pin enrich daemon (macOS launchd, outside Cursor).
set -euo pipefail

APP_SUPPORT="/Users/minjaekim/Library/Application Support/kaja/global-pin-enrich"
ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
LABEL="com.kaja.global-pin-enrich"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"
UID_N="$(id -u)"
OUT="$ROOT/.tmp/global-lang-en-samples"
mkdir -p "$APP_SUPPORT" "$OUT/logs"

cp "$ROOT/scripts/run-global-pin-enrich-daemon.sh" "$APP_SUPPORT/daemon.sh"
chmod 755 "$APP_SUPPORT/daemon.sh" "$ROOT/scripts/run-global-pin-pipeline.sh"
# Strip sandbox provenance so launchd can exec copies cleanly
xattr -c "$APP_SUPPORT/daemon.sh" 2>/dev/null || true

pkill -f 'global-pin-enrich/daemon' 2>/dev/null || true
pkill -f 'run-global-pin-enrich-daemon' 2>/dev/null || true
pkill -f 'enrich-global-pins\.ts' 2>/dev/null || true
pkill -f 'publish-global-pins\.mjs' 2>/dev/null || true
sleep 1
rm -f "$APP_SUPPORT/run.lock" "$APP_SUPPORT/run.pid" 2>/dev/null || true

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
  <true/>
  <key>KeepAlive</key>
  <true/>
  <key>ThrottleInterval</key>
  <integer>30</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>${OUT}/logs/enrich-daemon-launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${OUT}/logs/enrich-daemon-launchd.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/Users/minjaekim/Library/Python/3.9/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <key>HOME</key>
    <string>/Users/minjaekim</string>
    <key>LIMIT_PER_ROUND</key>
    <string>4</string>
    <key>ROUND_PAUSE_SEC</key>
    <string>8</string>
    <key>IDLE_SLEEP_SEC</key>
    <string>300</string>
    <key>GLOBAL_ENRICH_AUTO_COMMIT</key>
    <string>1</string>
    <key>GLOBAL_ENRICH_AUTO_PUSH</key>
    <string>1</string>
    <key>NODE_BIN</key>
    <string>/Users/minjaekim/.nvm/versions/node/v22.22.1/bin/node</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/${UID_N}" "$PLIST_DST"
launchctl enable "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl kickstart -k "gui/${UID_N}/${LABEL}"

sleep 2
echo "==> ${LABEL} installed (outside Cursor)"
launchctl print "gui/${UID_N}/${LABEL}" 2>&1 | grep -E 'state|runs|pid|path' | head -12
pgrep -fl 'global-pin-enrich|run-global-pin' | head -6 || true
echo ""
echo "Log: ${OUT}/logs/enrich-daemon.log"
echo "Stop:  launchctl bootout gui/${UID_N}/${LABEL}"
echo "Start: launchctl kickstart -k gui/${UID_N}/${LABEL}"
