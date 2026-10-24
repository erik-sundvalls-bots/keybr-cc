#!/usr/bin/env bash
# Builds the static site and force-pushes it as a single commit to the
# gh-pages branch of origin (erik-sundvalls-bots/keybr-cc).
set -euo pipefail
cd "$(dirname "$0")/.."
./pages-cc1/build.sh
SRC="$(git rev-parse --short HEAD)"
REMOTE="$(git remote get-url origin)"
case "$REMOTE" in
  *erik-sundvalls-bots/keybr-cc|*erik-sundvalls-bots/keybr-cc.git) ;;
  *) echo "Refusing to deploy to $REMOTE" >&2; exit 1 ;;
esac
TMP="$(mktemp -d)"
cp -r pages-cc1/dist/. "$TMP/"
cd "$TMP"
git init -q -b gh-pages
git add -A
git -c user.name="erik-sundvalls-bots" \
  -c user.email="erik-sundvalls-bots@users.noreply.github.com" \
  commit -q -m "Deploy static CC1 build from gh-pages-cc1 $SRC"
git push -f "$REMOTE" gh-pages:gh-pages
rm -rf "$TMP"
echo "Deployed. https://erik-sundvalls-bots.github.io/keybr-cc/"
