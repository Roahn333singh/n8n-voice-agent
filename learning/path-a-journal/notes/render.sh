#!/usr/bin/env bash
# Renders every notes/src/*.svg to notes/*.png (2x, for sharp text) with headless Chrome.
set -euo pipefail
cd "$(dirname "$0")"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

for svg in src/*.svg; do
  name="$(basename "$svg" .svg)"
  width="$(sed -n 's/.*<svg[^>]* width="\([0-9]*\)".*/\1/p' "$svg" | head -1)"
  height="$(sed -n 's/.*<svg[^>]* height="\([0-9]*\)".*/\1/p' "$svg" | head -1)"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 \
    --window-size="$width,$height" --screenshot="$PWD/$name.png" "file://$PWD/$svg" >/dev/null 2>&1
  echo "rendered $name.png (${width}x${height})"
done
