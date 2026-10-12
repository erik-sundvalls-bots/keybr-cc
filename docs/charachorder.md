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

Fingers, strongest and most independent first:

1. Index
2. Middle
3. Thumb 1 (nearest the index)
4. Thumb 2
5. Ring

Directions, easiest first: south, north, inward, outward. South and north are a pull or a push along the finger. Inward is toward the center of the device and outward is toward the pinky. Both hands take a direction together, left hand then right, before the next direction starts.

The first six letters are `e t r a o n` (index south, index inward, middle south). `s` is on the ring, so it waits until the ring is introduced. The pinky has no letters on this layout. Punctuation that the phonetic model still includes is appended after the alphabet, in frequency order.

The “keyboard order” lesson option does not apply while this layout is selected. Turning it on for any other layout behaves as before.
