#!/usr/bin/env bash
# Safer, slower render: 2 browser tabs and Remotion's own headless browser.
# Use it if scripts/render.sh stops with "The browser crashed".
# Arguments: output name, optional props JSON, resolution scale (1 / 2 / 0.5).
set -euo pipefail
cd "$(dirname "$0")/.."

for required in node npm ffmpeg python3; do
  if ! command -v "$required" >/dev/null 2>&1; then
    printf 'Missing dependency: %s. On a Mac with Homebrew, run: brew install node ffmpeg python\n' "$required" >&2
    exit 1
  fi
done
if [ ! -x node_modules/.bin/remotion ]; then
  printf 'Install project dependencies first: npm ci\n' >&2
  exit 1
fi

NAME="${1:-aurelia-free-demo-3d}"
PROPS="${2:-}"
SCALE="${3:-1}"
case "$NAME" in
  ''|*[!a-zA-Z0-9_-]*) printf 'Output name must contain only letters, digits, _ or -.\n' >&2; exit 1 ;;
esac
case "$SCALE" in
  1) RESOLUTION=1080p; WORKERS=2 ;;
  2) RESOLUTION=2160p; WORKERS=1 ;;
  0.5) RESOLUTION=540p; WORKERS=2 ;;
  *) printf 'Resolution scale must be 1 (1080p), 2 (4K), or 0.5 (preview).\n' >&2; exit 1 ;;
esac

RAW="out/.${NAME}-${RESOLUTION}-raw.mp4"
FINAL="out/${NAME}-${RESOLUTION}.mp4"
THUMBNAIL="out/${NAME}-${RESOLUTION}-thumbnail.png"
mkdir -p out

BROWSER="${REMOTION_BROWSER_EXECUTABLE:-}"
COMMON=(--scale="$SCALE")
if [ -n "$BROWSER" ]; then COMMON+=(--browser-executable="$BROWSER"); fi
if [ -n "$PROPS" ]; then COMMON+=(--props="$PROPS"); fi

printf '\nRendering %s at %s...\n' "$NAME" "$RESOLUTION"
npx --no-install remotion render Explainer "$RAW" "${COMMON[@]}" --concurrency="$WORKERS" --timeout=120000 --log=info

printf '\nMastering the audio...\n'
STATS=$(ffmpeg -hide_banner -i "$RAW" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
get() { printf '%s' "$STATS" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -hide_banner -loglevel error -y -i "$RAW" -c:v copy \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$FINAL"
rm -f "$RAW"

printf '\nCreating the thumbnail...\n'
npx --no-install remotion still Explainer "$THUMBNAIL" --frame=4290 "${COMMON[@]}" --log=info
printf '\nFinished!\nVideo: %s/%s\nThumbnail: %s/%s\n' "$PWD" "$FINAL" "$PWD" "$THUMBNAIL"
