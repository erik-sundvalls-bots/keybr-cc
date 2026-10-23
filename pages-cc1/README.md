# Static GitHub Pages build (CharaChorder One)

This branch (`gh-pages-cc1`) holds only the GitHub Pages setup for the fork
<https://github.com/erik-sundvalls-bots/keybr.com>. It is built on top of the
upstream-bound feature branch `cursor/cc1-layout-dac1` (PR #1 in the fork) and
is **not** meant to go upstream.

Live site: <https://erik-sundvalls-bots.github.io/keybr.com/>

keybr.com is licensed under the GNU AGPL-3.0 (see `LICENSE`). The deployed
site links back to this source and ships `LICENSE.txt`.

## What the static build does

- Builds only the webpack `browser` config, with `KEYBR_PUBLIC_PATH=/keybr.com/assets/`.
- `make-html.js` writes `index.html` (and the same `404.html`, so deep links
  such as `/keybr.com/profile` work) instead of the server-rendered HTML shell.
  It sets an anonymous user and `__KEYBR_STATIC__` with the router basename,
  the source link and first-visit defaults (CharaChorder One layout).
- Settings live in `localStorage` and results in IndexedDB, as for any
  anonymous keybr user. Nothing is sent to a server.
- The profile page has **Import data** next to **Download data** so results
  can be moved between browsers or restored (`importdata.ts`). Only results
  newer than the latest local one are added (reset statistics first to
  restore a whole history).

Not available in the static build: sign-in/accounts, settings and results
sync, public profiles, high scores, multiplayer, premium/ads, custom
translations served by the server.

## Source changes on this branch (Pages only)

- `webpack.config.js`: `publicPath` from `KEYBR_PUBLIC_PATH`.
- `keybr-pages-shared/lib/static.ts`: `getStaticSite()` reads `__KEYBR_STATIC__`.
- `keybr-pages-browser`: router basename, creating the root element, ad-free
  layout, and a Source (AGPL-3.0) link instead of Sign-In, High Scores and
  Multiplayer, all only when `__KEYBR_STATIC__` is set.
- `keybr-settings-loader`: first-visit defaults from `__KEYBR_STATIC__`.
- `page-profile`: Import data.

Without `__KEYBR_STATIC__` everything behaves as upstream.

## Redeploy after changes on the feature branch

```sh
git checkout gh-pages-cc1
git merge cursor/cc1-layout-dac1      # bring in the new feature work
npm ci
./pages-cc1/deploy.sh                 # builds and pushes to the gh-pages branch
```

GitHub Pages serves the `gh-pages` branch (root). A GitHub Actions workflow is
not used because the token on the build box has no `workflow` scope.
