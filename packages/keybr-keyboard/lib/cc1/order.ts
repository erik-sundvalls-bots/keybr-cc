/**
 * Letter introduction order for the default CharaChorder One English layout.
 *
 * Guided lessons normally unlock letters by language frequency. On CC1 that
 * scatters each new letter across both hands. This order instead adds letters
 * in motor groups: whole fingers first, then one finger and one joystick
 * direction at a time.
 *
 * Stage 1, the starting set, is every letter on the index and upper thumb
 * (thumb 1) switches of both hands: e r a t (index), c v k m (left thumb 1)
 * and d p f h (right thumb 1). Space is on the index switches too (left west,
 * right east) and is part of every lesson anyway. These twelve letters are
 * unlocked together on the first lesson (see {@link isCc1StartingLetter}), so
 * their order inside the stage only decides which key is focused first.
 *
 * After that, one finger at a time, the remaining letter fingers ordered by
 * how much English text they carry:
 * 2. Middle: o n, i l, j.
 * 3. Ring: u s, y.
 * 4. Thumb 2, the middle thumb switch: w b, g, z q, x.
 *
 * Inside a finger one direction is added at a time, on both hands, so the
 * two hands practice the same motion before a new motion is added. Within a
 * direction the left hand comes first. Directions follow the letters they
 * carry, most common first, so the rare z, q and x come last. Inward is
 * toward the center of the device (east on the left hand, west on the right).
 *
 * The pinky has no letters on this layout. It holds shift (inward), the num
 * layer (outward), alt, and the function layer (the down press). Switch
 * centers on the other fingers are chord markers (01–18), not letters.
 *
 * Characters that are not in this list, such as punctuation carried by the
 * phonetic model, are appended in ordinary frequency order.
 */
export const CC1_PROGRESSION: readonly {
  readonly stage: 1 | 2 | 3 | 4;
  readonly finger: "index" | "middle" | "thumb1" | "thumb2" | "ring";
  readonly direction: "south" | "north" | "inward" | "outward";
  readonly letters: string;
}[] = [
  { stage: 1, finger: "index", direction: "south", letters: "et" },
  { stage: 1, finger: "index", direction: "inward", letters: "ra" },
  { stage: 1, finger: "thumb1", direction: "south", letters: "cd" },
  { stage: 1, finger: "thumb1", direction: "north", letters: "vp" },
  { stage: 1, finger: "thumb1", direction: "inward", letters: "kf" },
  { stage: 1, finger: "thumb1", direction: "outward", letters: "mh" },
  { stage: 2, finger: "middle", direction: "south", letters: "on" },
  { stage: 2, finger: "middle", direction: "inward", letters: "il" },
  { stage: 2, finger: "middle", direction: "outward", letters: "j" },
  { stage: 3, finger: "ring", direction: "south", letters: "us" },
  { stage: 3, finger: "ring", direction: "inward", letters: "y" },
  { stage: 4, finger: "thumb2", direction: "inward", letters: "wb" },
  { stage: 4, finger: "thumb2", direction: "outward", letters: "g" },
  { stage: 4, finger: "thumb2", direction: "south", letters: "zq" },
  { stage: 4, finger: "thumb2", direction: "north", letters: "x" },
];

export const CC1_LETTER_ORDER: string = CC1_PROGRESSION.map(
  (group) => group.letters,
).join("");

/** The letters unlocked together on the first CC1 lesson. */
export const CC1_STARTING_LETTERS: string = CC1_PROGRESSION.filter(
  (group) => group.stage === 1,
)
  .map((group) => group.letters)
  .join("");

const STARTING = new Set<number>(
  [...CC1_STARTING_LETTERS].map((letter) => letter.charCodeAt(0)),
);

/**
 * Whether a letter belongs to the CC1 starting set (index and upper thumb).
 * Guided lessons unlock all of these at once instead of the usual six.
 */
export function isCc1StartingLetter({
  codePoint,
}: {
  readonly codePoint: number;
}): boolean {
  return STARTING.has(codePoint);
}

const RANK = new Map<number, number>(
  [...CC1_LETTER_ORDER].map((letter, index) => [letter.charCodeAt(0), index]),
);

export function orderCc1Letters<T extends { codePoint: number; f: number }>(
  letters: Iterable<T>,
): T[] {
  const known: T[] = [];
  const rest: T[] = [];
  for (const letter of letters) {
    if (RANK.has(letter.codePoint)) {
      known.push(letter);
    } else {
      rest.push(letter);
    }
  }
  known.sort((a, b) => RANK.get(a.codePoint)! - RANK.get(b.codePoint)!);
  rest.sort((a, b) => b.f - a.f || a.codePoint - b.codePoint);
  return [...known, ...rest];
}
