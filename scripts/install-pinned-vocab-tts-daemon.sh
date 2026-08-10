#!/bin/bash
# Install / restart Cursor-independent SEO TTS daemon (macOS launchd).
set -euo pipefail

APP_SUPPORT="/Users/minjaekim/Library/Application Support/kaja/pinned-vocab-tts"
ROOT="/Users/minjaekim/Desktop/korean-teacher-mj"
LABEL="com.kaja.pinned-vocab-tts-daemon"
PLIST_DST="$HOME/Library/LaunchAgents/${LABEL}.plist"
UID_N="$(id -u)"
OUT="$ROOT/.tmp/vocab-infographic-gen"
mkdir -p "$APP_SUPPORT" "$OUT/logs"

# Ensure daemon script exists (copy from project if we keep a mirror)
if [[ -f "$ROOT/scripts/run-pinned-vocab-tts-daemon-launchd.sh" ]]; then
  cp "$ROOT/scripts/run-pinned-vocab-tts-daemon-launchd.sh" "$APP_SUPPORT/daemon.sh"
fi
chmod 755 "$APP_SUPPORT/daemon.sh"

# Kill Cursor-owned jobs
pkill -f 'run-pinned-vocab-tts' 2>/dev/null || true
pkill -f 'enrich-vocab-seo-pages\.ts' 2>/dev/null || true
sleep 1
rm -f "$OUT/pinned-vocab-tts.lock" "$OUT/pinned-vocab-tts-loop.lock" 2>/dev/null || true

for old in com.kaja.pinned-vocab-tts-keepalive com.kaja.pinned-vocab-tts; do
  launchctl bootout "gui/${UID_N}/${old}" 2>/dev/null || true
  rm -f "$HOME/Library/LaunchAgents/${old}.plist" 2>/dev/null || true
done

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
  <integer>20</integer>
  <key>ProcessType</key>
  <string>Background</string>
  <key>StandardOutPath</key>
  <string>${OUT}/logs/tts-daemon-launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${OUT}/logs/tts-daemon-launchd.err.log</string>
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/Users/minjaekim/.nvm/versions/node/v22.22.1/bin:/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin</string>
    <key>HOME</key>
    <string>/Users/minjaekim</string>
    <key>LIMIT_PER_ROUND</key>
    <string>12</string>
    <key>ROUND_PAUSE_SEC</key>
    <string>2</string>
    <key>IDLE_SLEEP_SEC</key>
    <string>300</string>
    <key>VOCAB_TTS_SSH</key>
    <string>lab-worker</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/${UID_N}" "$PLIST_DST"
launchctl enable "gui/${UID_N}/${LABEL}" 2>/dev/null || true
launchctl kickstart -k "gui/${UID_N}/${LABEL}"

sleep 3
echo "==> ${LABEL} installed (outside Cursor / Desktop-exec)"
launchctl print "gui/${UID_N}/${LABEL}" 2>&1 | grep -E '^\s+(state|runs|pid|last exit|path) ' | head -12
pgrep -fl 'pinned-vocab-tts/daemon|enrich-vocab-seo' | head -8 || true
echo ""
echo "Status log: ${OUT}/logs/tts-daemon.log"
echo "Stop:  launchctl bootout gui/${UID_N}/${LABEL}"
echo "Start: launchctl kickstart -k gui/${UID_N}/${LABEL}"
