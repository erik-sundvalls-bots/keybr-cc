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

Letter order (`packages/keybr-keyboard/lib/cc1/order.ts`), strongest fingers and easiest directions first, left hand then right inside a direction:

| Step | Finger | Direction | Letters |
| --- | --- | --- | --- |
| 1 | index | south | e t |
| 2 | index | inward (left east / right west) | r a |
| 3 | middle | south | o n |
| 4 | middle | inward | i l |
| 5 | middle | outward | j |
| 6 | thumb 1 | south, north, inward, outward | c d, v p, k f, m h |
| 7 | thumb 2 | south, north, inward, outward | z q, x, w b, g |
| 8 | ring | south, inward | u s, y |

Full string: `etraoniljcdvpkfmhzqxwbgusy`. The first six unlocked letters are `etraon`. Unknown letters (punctuation, accents) are appended by frequency. Pinkies have no letters. Rationale: index and middle carry the most common letters and the shortest reach; south and inward are the directions a new CC1 user hits first; thumbs come before the weaker ring; each new group is one finger plus one joystick direction so the lesson adds a motor pattern, not a scattered frequency pick.

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

Browser verification of the CC1 picture was started and not finished. A dev server was left running at `http://localhost:3000/` (`npm start` / `root/index.js`, `.env` copied from `.env.example`, sqlite). No screenshot was saved, and the practice flow (select CharaChorder One, confirm the next-key circle, type a few letters, switch back to US) was not signed off. Treat the visual as unverified.

Not covered by an automated test:

- The SVG actually looks like two switch clusters at practice width and at a narrow viewport.
- Long labels (`Shift`, `Enter`, `Space`, `Right`) do not clip.
- Corner A2 digits do not collide with the primary letter.
- Hub labels `01`–`18` are not mistaken for the numbers lesson.
- Heatmap, typing-test replay, and help pages render CC1 through `VirtualKeyboard`.
- A full lesson session persists results under family `cc1` and does not merge them into QWERTY.

`npm test` on Node v22.14.0 and v22.22.2 failed in `@keybr/color` `lib/convert-xyz.test.ts` (`rgb / oklch`, expected green `4.304625232653958e-15`, actual `5.028833252596066e-15`). That package was not modified. Node v24.21.0 passes it. This environment's default `node` is v22.14.0 at `/exec-daemon/node`; v24.21.0 is installed with nvm at `~/.nvm/versions/node/v24.21.0`. The repo's recent `e9c11fea` bump targets Node 26, and workspace engines want `^22.22.2 || ^24.15.0 || >=26`.

## Next steps, in order

1. Use Node 24 or 26 (`export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"`).
2. `npm run compile` if `.types/` is missing, then `npm run build` or `npm run build-dev`.
3. `cp .env.example .env` if needed. `npm start`. Open `http://localhost:3000/`.
4. Dismiss the first-visit tour. Settings → Keyboard → Layout → **CharaChorder One** → Done.
5. Confirm two clusters of plus-shaped switches, readable letters, and a circle on the next lesson letter. Type the first few letters and confirm the circle moves. The first guided subset is `etraon`.
6. Switch the layout back to US and confirm the staggered QWERTY keyboard and frequency order (`a` first) are unchanged.
7. Check a ~390px viewport for overflow.
8. If the picture is wrong, edit only `packages/keybr-keyboard/lib/cc1/build.ts` (positions) or `VirtualKeyboard.tsx` (frame height). Re-run the CC1 and guided tests.
9. Add screenshots to the draft PR body. Paths the PR tool will upload: `<img alt="CC1 practice" src="/opt/cursor/artifacts/screenshots/cc1-practice.png" />`.

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
