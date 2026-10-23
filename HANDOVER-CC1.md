# Handover: CharaChorder One (CC1) in keybr

This fork adds an opt-in CharaChorder One layout and a hand-based guided-lesson order. The work is on branch `cursor/cc1-layout-dac1` (base `master`). It is meant to be offered later as a focused PR to `aradzie/keybr.com`. Do not open that upstream PR from this branch until the visual check below is done.

## Design and why

keybr's keyboard model is one `KeyId` per physical position, with up to four characters (none / shift / alt / shift+alt) and a geometry of rectangles (`x`, `y`, `w`, `h`, finger/hand/row zones). CC1 is two clusters of nine five-way switches (north, south, east, west, down). A layer system would be a broad refactor, so this change does not add one.

Smallest fit that still teaches the device:

- New layout `Layout.EN_CC1` (`id` `en-cc1`, `xid` `0xb2`, family `cc1`, language English, `emulate: true`). Family `cc1` keeps stats separate from QWERTY. `xid` `0xb2` was free in `packages/keybr-keyboard/lib/layout-id.md`; never reuse or change it once shipped.
- New geometry `Geometry.CC1` (`id` `cc1`). Only this layout lists it. `Geometry.ALL` includes it so the settings enum can persist the choice. `Layout.custom()` filters it out, so custom layouts still offer the previous geometries.
- Primary (A1) letters and punctuation are placed on US key codes at the switch direction that produces them. The device sends US codes; forward emulation maps `event.code` through the US character dict, so practice works even when the OS layout is not US.
- Pinky-inward is `ShiftLeft` / `ShiftRight`, so capital letters highlight the opposite-hand shift the way other layouts do.
- Second-layer digits (A2) are corner labels only. They are not in the character dict, so the numbers lesson will not highlight them. A `KeyId` cannot mean both "e" and "4".
- `?` has its own A1 switch (right thumb 3 north, action 63 = shifted slash). It is drawn, but it is not the shift companion of `/`, so guided lessons do not highlight Shift+/ for `?`. `getCombo('?')` is null.
- Duplicate key codes (second space, second escape, second arrows, second mouse cluster) are label-only keys (`Cc1SlotN`). The pointer hits the canonical key (left space, left arrows).
- Switch centers are chord hubs `600`–`617`, labeled `01`–`18`, not letters. Index hubs are homing keys.
- Guided lessons use a fixed finger/direction order only when `keyboard.layout === Layout.EN_CC1`. The existing `lesson.guided.keyboardOrder` setting is left untouched and is ignored for CC1.

Letter order (`packages/keybr-keyboard/lib/cc1/order.ts`), changed 2026-10-23 at Erik's request (he uses the device): start with the index and upper thumb (thumb 1) switches, E R A T M V C K P F H D plus Space.

| Stage | Finger | Direction | Letters |
| --- | --- | --- | --- |
| 1 | index | south, inward | e t, r a |
| 1 | thumb 1 | south, north, inward, outward | c d, v p, k f, m h |
| 2 | middle | south, inward, outward | o n, i l, j |
| 3 | ring | south, inward | u s, y |
| 4 | thumb 2 | inward, outward, south, north | w b, g, z q, x |

Full string: `etracdvpkfmhoniljusywbgzqx`. Stage 1 (`CC1_STARTING_LETTERS`, 12 letters) is unlocked together on the first lesson: in `GuidedLesson.update()` the minimal alphabet size is the number of model letters for which `isCc1StartingLetter()` is true, instead of the usual 6. That keeps keybr's own model (a minimum alphabet, then one letter at a time once all included keys reach target speed) and only changes the size of the minimum for this layout. Order inside stage 1 only decides which key is focused first (`e`). After stage 1, one finger at a time (middle, ring, thumb 2: most English text first), one direction at a time on both hands (left then right), directions with more common letters first. Space is on both index switches (left west, right east) and is in every keybr lesson; `getCombo(" ")` is the `Space` key, so the picture highlights it. Unknown letters (punctuation, accents) are appended by frequency. Pinkies have no letters.

The previous order was `etraoniljcdvpkfmhzqxwbgusy` with a 6-letter start (`etraon`).

Geometry (user units, full-size 1×1 keys because the SVG font is designed for `keySize` 40): plus layout with step `1.12`, switch pitch `3.35`, origin `1.7`, hand gap `1.6`. Directions are absolute (north is away from the body), not mirrored. `VirtualKeyboard` omits the usual `16rem` height only for `Geometry.CC1`, so the picture keeps its aspect ratio instead of shrinking to a short strip. Practice, settings preview, replay, help, and heatmaps all go through that component.

Device map and switch arrangement are transcribed from the MIT library [tangent-cc-lib](https://github.com/andy23512/tangent-cc-lib) (Copyright (c) 2026 Tangent Chang). Attribution is in `packages/keybr-keyboard/lib/cc1/data.ts`. The official `CCEnglish.png` image returned HTTP 500 when it was fetched, so positions were taken from that data, not from the image.

## Files and packages

`@keybr/keyboard`:

- `packages/keybr-keyboard/lib/cc1/data.ts` — A1/A2 action codes and slot order.
- `packages/keybr-keyboard/lib/cc1/build.ts` — `CC1_GEOMETRY` and `CC1_CHARACTERS`.
- `packages/keybr-keyboard/lib/cc1/order.ts` — `orderCc1Letters` and `CC1_LETTER_ORDER`.
- `packages/keybr-keyboard/lib/cc1/order.test.ts`
- `packages/keybr-keyboard/lib/cc1/layout.test.ts`
- `packages/keybr-keyboard/lib/geometry.ts` — `Geometry.CC1`, last in `Geometry.ALL`.
- `packages/keybr-keyboard/lib/layout.ts` — `Layout.EN_CC1`; `custom()` excludes CC1.
- `packages/keybr-keyboard/lib/load.ts` — registers the layout and geometry.
- `packages/keybr-keyboard/lib/index.ts` — exports `order.ts`.
- `packages/keybr-keyboard/lib/layout-id.md` — regenerated xid report (`0xb2` allocated).

`@keybr/keyboard-ui`:

- `packages/keybr-keyboard-ui/lib/VirtualKeyboard.tsx` — no fixed height when geometry is CC1.

`@keybr/lesson`:

- `packages/keybr-lesson/lib/guided.ts` — CC1 early return in `#getLetters()`.
- `packages/keybr-lesson/lib/guided.test.ts` — FakePhoneticModel letters a–j unlock as `eaijcd` whether or not `keyboardOrder` is set.

Docs:

- `docs/charachorder.md` — user-facing picture, emulation, digit/`?` limits, letter order.
- `docs/custom_keyboard.md` — short pointer at the end.

No new dependencies. `package-lock.json` was rewritten by `npm install` and reverted; do not commit it.

## What is done

- Opt-in layout, geometry, character map, and switch picture.
- Hand-based guided order, with unit tests for grouping, the first six letters, and unknown-letter fallback.
- Regression checks: US layout still has `KeyA` at the ANSI pinky position; custom layouts do not offer CC1; `EN_US` family is still `qwerty`.
- `npm run compile` succeeded (lage, 70 packages, 0 failed).
- `npm run build` (production webpack) succeeded.
- `env DATABASE_CLIENT=sqlite npm test` succeeded on Node v24.21.0 (lage, 58 test tasks, 0 failed). Targeted tests that had already passed on the older Node: `lib/cc1/**/*.test.ts`, `guided.test.ts`, keyboard `layout.test.ts` / `load.test.ts` / `settings.test.ts`, and `packages/keybr-keyboard-io` `parse-keymap.test.ts`. ESLint on the touched TypeScript files passed (husky ran prettier + eslint on the implementation commit).

Last implementation commit before this handover: `43dac8f9` (`Add an opt-in CharaChorder One layout and hand-based lesson order.`).

## What is unfinished or untested

Browser check on `http://localhost:3000/` (Node 24, `.env` from `.env.example`, sqlite) after this handover was first written:

- Default practice is still United States / staggered QWERTY.
- Settings → Layout → **CharaChorder One** shows two clusters of plus-shaped switches, thumb crosses, pinky modifiers (`Shift`, `Num`, `Fn`, `Swap`), and hub labels `01`–`18`.
- Practice with that layout generated words starting `era rent note…` (the `etraon` subset). The next-key circle sat on left-hand `e` (index, south), which matches the map.
- Switching the layout back to **United States** restored the normal QWERTY picture.
- At about 390px wide the CC1 picture stayed inside the viewport; the page scrolls vertically.

Not exercised: typing through several letters to watch the circle move, the numbers lesson, heatmap, typing-test replay, help, and a saved result landing in family `cc1` instead of `qwerty`. Corner digits and hub numbers are visible on the picture; nobody checked whether they confuse the numbers lesson. Long labels (`Shift`, `Enter`, `Space`, `Right`) were readable in the screenshots and were not measured for clipping.

`npm test` on Node v22.14.0 and v22.22.2 failed in `@keybr/color` `lib/convert-xyz.test.ts` (`rgb / oklch`, expected green `4.304625232653958e-15`, actual `5.028833252596066e-15`). That package was not modified. Node v24.21.0 passes it. This environment's default `node` is v22.14.0 at `/exec-daemon/node`; v24.21.0 is installed with nvm at `~/.nvm/versions/node/v24.21.0`. The repo's recent `e9c11fea` bump targets Node 26, and workspace engines want `^22.22.2 || ^24.15.0 || >=26`.

## Box session 2026-10-12

Continued on Erik's box (no cloud agent). Node v24.21.0 via nvm, `.env` from `.env.example` with `DATABASE_CLIENT=sqlite`.

- `npm install`, `npm run compile`, `npm run build-dev` succeeded. Note: `@keybr/server` tests fail with HTTP 500 (missing `root/public/assets/manifest.json`) unless a build has run first; that is an existing repo requirement, not CC1.
- `env DATABASE_CLIENT=sqlite npm test` passes in full after the build.
- New tests (commit `b2f474de`):
  - `guided.test.ts`: once the first CC1 letters are confident, the next letters are added in CC1 order (`eaijcd` → `f` → `h` → `b` → `g` for the a–j fake model).
  - `numbers.test.ts`: numbers lesson with CC1 includes all ten digits and generates digit text; `getCombo` is null for every digit (no key highlight, as documented).
  - `keybr-result-io` `binary.test.ts`: a CC1 result round-trips through the binary format with layout `en-cc1` / family `cc1`.
  - `keybr-result` `group.test.ts`: grouping by layout family keeps CC1 results apart from QWERTY results.
- No production code changes were needed.
- Dev server ran with `npm start` and answered HTTP 200 on `http://localhost:3000/`.

Still not checked by hand in a browser: watching the circle move while typing, heatmap, typing-test replay, help view.

## Box session 2026-10-23: index + upper thumb start

- Erik asked to start with E R A T M V C K P F H D plus Space. Checked against `data.ts`: e r (left index south/east), t a (right index south/west), c v k m (left thumb 1 south/north/east/west), d p f h (right thumb 1 south/north/west/east). All twelve are index or thumb 1, no mismatch. Space is left index west and right index east.
- New order and stage-1 unlock as described in the design section. `order.test.ts` checks the starting set and full string; `layout.test.ts` still checks every group against the device geometry; `guided.test.ts` checks the fake-model unlock (`eacdfh`, then `i j b g`) and a real English model lesson (12 letters, focus `e`, text only from those letters plus space, Space highlighted).
- Sample pseudo-word text from the real English model with an empty word list: `deep meeth her teethe feet ave are kvet veer methe pet ete ahead are feet tree reach`. With natural words on (default) and the real word list, the app mixes in dictionary words built from these letters.
- `docs/charachorder.md` updated.

## Next steps, in order

1. Use Node 24 or 26 (`export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`).
2. `npm run compile` if `.types/` is missing, then `npm run build` or `npm run build-dev`.
3. `cp .env.example .env` if needed. `npm start`. Open `http://localhost:3000/`.
4. With CharaChorder One selected, type the first few lesson letters and confirm the circle moves. The first guided subset is the twelve letters `etracdvpkfmh`.
5. Open the numbers lesson and the heatmap / typing-test replay / help views and confirm CC1 still renders.
6. Finish one lesson and confirm the stored result family is `cc1`, not `qwerty`.
7. If the picture needs a tweak, edit only `packages/keybr-keyboard/lib/cc1/build.ts` (positions) or `VirtualKeyboard.tsx` (frame height). Re-run the CC1 and guided tests.
8. Open the draft PR once the fork account can create issues. The previous attempt failed with GitHub `must be a collaborator`. Put screenshots in the body with `<img alt="CC1 practice" src="/opt/cursor/artifacts/screenshots/cc1-practice.webp" />`. Local copies from the check above are `cc1-settings.webp`, `cc1-practice.webp`, `us-practice.webp`, and `cc1-mobile.webp` under `/opt/cursor/artifacts/screenshots/`.

Useful commands:

```shell
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm run compile
npm run build
env DATABASE_CLIENT=sqlite npm test
cd packages/keybr-keyboard && npx tstest --test 'lib/cc1/**/*.test.ts'
cd packages/keybr-lesson && npx tstest --import=@keybr/test-env-bundler --test lib/guided.test.ts
npm start
```

## Upstream risks and open questions

- One position per key code cannot represent A2 digits or the dedicated `?` switch as typeable lesson targets. Say that explicitly in the upstream PR. A layer model would be a separate change.
- `Geometry.ALL` grew by one entry. Custom layouts filter it out, and existing layout xids/families/geometries are unchanged. Confirm upstream is comfortable with a new settings enum value (`keyboard.geometry` = `cc1`) that only `en-cc1` accepts.
- `0xb2` must stay unique against whatever layouts land on `aradzie/keybr.com` master before the PR. Re-read `layout-id.md` on latest master.
- Guided order ignores `keyboardOrder` for this layout only. Upstream may want the setting to still apply, or a settings note. Current behavior is documented in `docs/charachorder.md`.
- Hub labels `01`–`18` and corner digits may confuse the numbers lesson. Consider hiding non-letter labels in the practice picture if the screenshot looks noisy.
- Duplicate space/arrows highlight only the canonical key. A CC1 user pressing the other space still produces the character via emulation, but the circle is on the left index west space.
- MIT attribution for the transcribed map must stay in `data.ts`.
- Do not commit `.env` or `package-lock.json` noise. `.env*` is gitignored.
