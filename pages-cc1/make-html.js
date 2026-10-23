// Writes index.html for the static GitHub Pages build from the webpack
// manifest. It replaces the server-rendered HTML shell of keybr.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [out, base, sourceUrl, commit] = process.argv.slice(2);
const manifest = JSON.parse(
  readFileSync(join(out, "assets", "manifest.json"), "utf8"),
);
const { css: stylesheets, js: scripts } = manifest.entrypoints.browser.assets;

const esc = (s) =>
  String(s)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
const json = (v) =>
  JSON.stringify(v)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");

const pageData = {
  base: `https://erik-sundvalls-bots.github.io${base}`,
  locale: "en",
  user: null,
  publicUser: { id: null, name: "Anonymous", imageUrl: null },
  settings: null,
};
const staticSite = {
  basename: base,
  sourceUrl,
  commit,
  // First-visit defaults: the CharaChorder One layout.
  defaultSettings: {
    "keyboard.language": "en",
    "keyboard.layout": "en-cc1",
    "keyboard.geometry": "cc1",
  },
};

const html = `<!DOCTYPE html>
<!--
  keybr.com fork with CharaChorder One support.
  Based on keybr.com by its authors, https://github.com/aradzie/keybr.com
  Licensed under the GNU Affero General Public License v3.0 (AGPL-3.0),
  see ${base}/LICENSE.txt. Source code: ${sourceUrl} (commit ${commit}).
-->
<html lang="en" dir="ltr" data-color="system" data-font="open-sans">
<head>
<meta charset="UTF-8">
<title>keybr CharaChorder One (static fork build)</title>
${stylesheets.map((href) => `<link rel="stylesheet" href="${esc(href)}">`).join("\n")}
<link rel="icon" href="${base}/favicon.ico">
<link rel="license" href="${base}/LICENSE.txt">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<script>
// The keybr server sets the theme attributes from the "prefs" cookie;
// the static build does the same here before the styles apply.
(function () {
  try {
    var m = document.cookie.match(/(?:^|;\\s*)prefs=([^;]*)/);
    if (m) {
      var p = JSON.parse(decodeURIComponent(m[1]));
      var ok = /^[a-z0-9-]+$/;
      if (ok.test(p.color)) document.documentElement.setAttribute("data-color", p.color);
      if (ok.test(p.font)) document.documentElement.setAttribute("data-font", p.font);
    }
  } catch (e) {}
})();
</script>
<script>var __PAGE_DATA__ = ${json(pageData)};
var __KEYBR_STATIC__ = ${json(staticSite)};</script>
${scripts.map((src) => `<script src="${esc(src)}" defer></script>`).join("\n")}
</head>
<body>
<noscript>JavaScript is required. Source code: <a href="${esc(sourceUrl)}">${esc(sourceUrl)}</a> (AGPL-3.0).</noscript>
</body>
</html>
`;
writeFileSync(join(out, "index.html"), html);
