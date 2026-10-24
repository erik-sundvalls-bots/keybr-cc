#!/usr/bin/env bash
# Builds the static GitHub Pages version of keybr with CharaChorder One
# defaults into pages-cc1/dist. See pages-cc1/README.md.
set -euo pipefail
cd "$(dirname "$0")/.."

BASE="${PAGES_BASE:-/keybr-cc}"
OUT="${PAGES_OUT:-pages-cc1/dist}"
SOURCE_URL="${PAGES_SOURCE_URL:-https://github.com/erik-sundvalls-bots/keybr-cc/tree/gh-pages-cc1}"

env NODE_ENV=production KEYBR_PUBLIC_PATH="$BASE/assets/" \
  npx webpack --config-name browser

rm -rf "$OUT"
mkdir -p "$OUT"
cp -r root/public/assets "$OUT/assets"
# GitHub Pages compresses on its own and source maps are not needed.
find "$OUT/assets" \( -name '*.gz' -o -name '*.br' -o -name '*.map' \) -delete
cp root/public/favicon.ico root/public/robots.txt "$OUT/"
cp LICENSE "$OUT/LICENSE.txt"
node pages-cc1/make-html.js "$OUT" "$BASE" "$SOURCE_URL" \
  "$(git rev-parse HEAD 2>/dev/null || echo unknown)"
# Deep links such as /keybr-cc/profile are served by the SPA via 404.html.
cp "$OUT/index.html" "$OUT/404.html"
touch "$OUT/.nojekyll"
echo "Built $OUT for base $BASE"
