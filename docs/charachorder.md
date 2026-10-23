# CharaChorder One

Selecting **CharaChorder One** in the layout list switches the practice keyboard to the default CC English map ([device guide](https://docs.charachorder.com/CharaChorder%20One.html), [layout notes](https://docs.charachorder.com/Layout.html)). Every other layout, including its geometry, family, and saved results, is left as it was. Results for this layout are stored in their own `cc1` family, so they are not merged with QWERTY.

The device sends US key codes. Leave **Emulate layout** enabled (the default while this layout is selected), or set the operating system layout to US. Either way the character keybr sees is the character printed on the switch.

## What the picture shows

Each switch is drawn as a plus: north, east, south, west, and a center. North is away from the body. The two halves are mirrored, pinkies on the outside and thumbs toward the middle, in the same arrangement as the overlay from [keybr-cc-extension](https://github.com/andy23512/keybr-cc-extension). Switch positions and the default action codes are adapted from [tangent-cc-lib](https://github.com/andy23512/tangent-cc-lib) (MIT, Copyright (c) 2026 Tangent Chang).

The center of a letter switch is the chord marker (`01`–`18`), not a character. The pinky center is the function layer. Shift is the inward pinky (east on the left, west on the right). The num layer is the outward pinky. The next character is highlighted by the existing key pointer, including the opposite pinky when the character needs shift.

Digits live on the num layer, on the same direction as an A1 letter. They are printed in the corner of that key. They are not separate keys, and the numbers lesson does not point at them.

`?` has its own switch (right thumb 3, north) and is drawn there. It is not part of the generated alphabet: keybr can only attach `?` to the `/` key as its shift pair, and that would highlight the wrong switch.

## Letter order

Guided lessons for this layout unlock letters by finger and direction instead of by language frequency. The order is fixed in `packages/keybr-keyboard/lib/cc1/order.ts`.

The first lesson starts with every letter on the index and upper thumb (thumb 1) switches of both hands, twelve letters at once:

| Hand | Index | Upper thumb |
| --- | --- | --- |
| Left | e (south), r (inward) | c (south), v (north), k (inward), m (outward) |
| Right | t (south), a (inward) | d (south), p (north), f (inward), h (outward) |

Space is on the index switches too (left west, right east) and is in every lesson. Other layouts start with the six most frequent letters; this layout starts with this whole finger group instead, so the user learns two complete fingers per hand before anything else. The first focused key is `e`.

After that, keybr's usual rule applies: a new letter is added once the current ones reach the target speed. New letters come one finger at a time, ordered by how much English text the finger carries:

1. Middle: `o n` (south), `i l` (inward), `j` (outward)
2. Ring: `u s` (south), `y` (inward)
3. Thumb 2, the middle thumb switch: `w b` (inward), `g` (outward), `z q` (south), `x` (north)

Inside a finger, both hands take a direction together, left hand then right, before the next direction starts. Directions follow the letters they carry, most common first, so the rare `z q x` come last. Inward is toward the center of the device and outward is toward the pinky.

Full order: `etracdvpkfmh` then `oniljusywbgzqx`. The pinky has no letters on this layout. Punctuation that the phonetic model still includes is appended after the alphabet, in frequency order.

The “keyboard order” lesson option does not apply while this layout is selected. Turning it on for any other layout behaves as before.
