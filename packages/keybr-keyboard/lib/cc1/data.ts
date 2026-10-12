// Device positions and the default CC1 English layout are adapted from
// tangent-cc-lib (https://github.com/andy23512/tangent-cc-lib),
// MIT License, Copyright (c) 2026 Tangent Chang.
// That data also drives https://github.com/andy23512/keybr-cc-extension.
//
// Each half is nine 5-way switches. A slot list of length 90 is the device
// position-code order: left hand, then right hand; within a hand the switches
// are thumb 3, thumb 2, thumb 1, index, middle, ring, pinky, middle-lower,
// ring-lower. Left directions are center, east, north, west, south. Right
// directions are center, west, north, east, south (east and west are stored
// mirrored, but the names below are absolute: north is away from the body).

export type Cc1Hand = "left" | "right";

export type Cc1Finger =
  | "thumb3"
  | "thumb2"
  | "thumb1"
  | "index"
  | "middle"
  | "ring"
  | "pinky"
  | "middle2"
  | "ring2";

export type Cc1Direction = "c" | "e" | "n" | "w" | "s";

export type Cc1Slot = {
  readonly hand: Cc1Hand;
  readonly finger: Cc1Finger;
  readonly direction: Cc1Direction;
};

const FINGERS: readonly Cc1Finger[] = [
  "thumb3",
  "thumb2",
  "thumb1",
  "index",
  "middle",
  "ring",
  "pinky",
  "middle2",
  "ring2",
];

const LEFT_DIRECTIONS: readonly Cc1Direction[] = ["c", "e", "n", "w", "s"];
const RIGHT_DIRECTIONS: readonly Cc1Direction[] = ["c", "w", "n", "e", "s"];

function slots(hand: Cc1Hand, directions: readonly Cc1Direction[]): Cc1Slot[] {
  return FINGERS.flatMap((finger) =>
    directions.map((direction) => ({ hand, finger, direction })),
  );
}

export const CC1_SLOTS: readonly Cc1Slot[] = [
  ...slots("left", LEFT_DIRECTIONS),
  ...slots("right", RIGHT_DIRECTIONS),
];

/** Primary (A1) layer action codes, one per {@link CC1_SLOTS} entry. */
export const CC1_A1: readonly number[] = [
  // Left thumb 3, thumb 2, thumb 1.
  600, 47, 45, 515, 297, 601, 119, 562, 103, 122, 602, 107, 118, 109, 99,
  // Left index, middle, ring.
  603, 114, 298, 32, 101, 604, 105, 127, 46, 111, 605, 39, 512, 44, 117,
  // Left pinky, middle-lower, ring-lower.
  552, 513, 514, 550, 540, 607, 335, 338, 336, 337, 608, 565, 568, 566, 567,
  // Right thumb 3, thumb 2, thumb 1.
  609, 563, 63, 519, 297, 610, 98, 120, 536, 113, 611, 102, 112, 104, 100,
  // Right index, middle, ring.
  612, 97, 296, 544, 116, 613, 108, 299, 106, 110, 614, 121, 516, 59, 115,
  // Right pinky, middle-lower, ring-lower.
  553, 517, 518, 551, 542, 616, 336, 338, 335, 337, 617, 566, 568, 565, 567,
];

/**
 * Numeric (A2) layer action codes. Digits live here, on the same switch
 * direction as an A1 letter, and are drawn as a corner label rather than as
 * their own key.
 */
export const CC1_A2: readonly number[] = [
  0, 92, 45, 515, 297, 0, 119, 562, 91, 93, 0, 55, 56, 57, 48, 0, 49, 298, 51,
  50, 0, 52, 127, 54, 53, 0, 96, 512, 61, 124, 0, 513, 514, 550, 540, 0, 569,
  572, 570, 571, 0, 565, 568, 566, 567, 0, 563, 63, 519, 297, 0, 98, 120, 91,
  93, 0, 55, 56, 57, 48, 0, 49, 296, 51, 50, 0, 52, 299, 54, 53, 0, 61, 516, 59,
  115, 0, 517, 518, 551, 542, 0, 570, 572, 569, 571, 0, 566, 568, 565, 567,
];
