/**
 * Letter introduction order for the default CharaChorder One English layout.
 *
 * Guided lessons normally unlock letters by language frequency. On CC1 that
 * scatters each new letter across both hands. This order instead adds letters
 * in motor groups: one finger, then one joystick direction, and only then the
 * next direction or finger.
 *
 * Fingers, strongest and most independent first:
 * 1. Index. South and inward are e, t, r, a, so the first six letters with
 *    the middle finger (o, n) are already a usable alphabet.
 * 2. Middle.
 * 3. Thumb 1, the thumb switch nearest the index.
 * 4. Thumb 2.
 * 5. Ring. "s" waits until the ring is taught. That is deliberate: frequency
 *    would have introduced it immediately, which splits the ring from the
 *    rest of its letters.
 *
 * Directions, easiest first. South and north are a pull or a push along the
 * finger. Inward and outward are lateral. Inward is toward the center of the
 * device (east on the left hand, west on the right). Within a direction the
 * left hand comes before the right, so the two hands practice the same motion
 * before a new motion is added.
 *
 * The pinky has no letters on this layout. It holds shift (inward), the num
 * layer (outward), alt, and the function layer (the down press). Switch
 * centers on the other fingers are chord markers (01–18), not letters.
 *
 * Characters that are not in this list, such as punctuation carried by the
 * phonetic model, are appended in ordinary frequency order.
 */
export const CC1_PROGRESSION: readonly {
  readonly finger: "index" | "middle" | "thumb1" | "thumb2" | "ring";
  readonly direction: "south" | "north" | "inward" | "outward";
  readonly letters: string;
}[] = [
  { finger: "index", direction: "south", letters: "et" },
  { finger: "index", direction: "inward", letters: "ra" },
  { finger: "middle", direction: "south", letters: "on" },
  { finger: "middle", direction: "inward", letters: "il" },
  { finger: "middle", direction: "outward", letters: "j" },
  { finger: "thumb1", direction: "south", letters: "cd" },
  { finger: "thumb1", direction: "north", letters: "vp" },
  { finger: "thumb1", direction: "inward", letters: "kf" },
  { finger: "thumb1", direction: "outward", letters: "mh" },
  { finger: "thumb2", direction: "south", letters: "zq" },
  { finger: "thumb2", direction: "north", letters: "x" },
  { finger: "thumb2", direction: "inward", letters: "wb" },
  { finger: "thumb2", direction: "outward", letters: "g" },
  { finger: "ring", direction: "south", letters: "us" },
  { finger: "ring", direction: "inward", letters: "y" },
];

export const CC1_LETTER_ORDER: string = CC1_PROGRESSION.map(
  (group) => group.letters,
).join("");

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
