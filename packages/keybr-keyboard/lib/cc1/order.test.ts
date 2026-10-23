import { test } from "node:test";
import { deepEqual, equal, isFalse, isTrue } from "rich-assert";
import {
  CC1_LETTER_ORDER,
  CC1_PROGRESSION,
  CC1_STARTING_LETTERS,
  isCc1StartingLetter,
  orderCc1Letters,
} from "./order.ts";

test("covers each english letter once", () => {
  equal(CC1_LETTER_ORDER.length, 26);
  deepEqual([...CC1_LETTER_ORDER].sort(), [..."abcdefghijklmnopqrstuvwxyz"]);
});

test("keeps each finger and direction together", () => {
  let cursor = 0;
  for (const group of CC1_PROGRESSION) {
    equal(
      CC1_LETTER_ORDER.slice(cursor, cursor + group.letters.length),
      group.letters,
    );
    cursor += group.letters.length;
  }
  equal(cursor, CC1_LETTER_ORDER.length);
});

test("starts with every index and upper thumb letter", () => {
  equal(CC1_STARTING_LETTERS.length, 12);
  equal(CC1_LETTER_ORDER.slice(0, 12), CC1_STARTING_LETTERS);
  deepEqual([...CC1_STARTING_LETTERS].sort(), [..."eratmvckpfhd"].sort());
  for (const group of CC1_PROGRESSION) {
    equal(
      group.stage === 1,
      group.finger === "index" || group.finger === "thumb1",
    );
  }
  isTrue(isCc1StartingLetter({ codePoint: /* "k" */ 0x006b }));
  isFalse(isCc1StartingLetter({ codePoint: /* "o" */ 0x006f }));
  isFalse(isCc1StartingLetter({ codePoint: /* SPACE */ 0x0020 }));
});

test("adds the middle, ring, then middle thumb fingers", () => {
  equal(CC1_LETTER_ORDER, "etracdvpkfmhoniljusywbgzqx");
});

test("orders known letters by the hand and appends the rest by frequency", () => {
  const letters = [
    { codePoint: /* "z" */ 0x007a, f: 0.9 },
    { codePoint: /* "e" */ 0x0065, f: 0.01 },
    { codePoint: /* "?" */ 0x003f, f: 0.2 },
    { codePoint: /* "a" */ 0x0061, f: 0.5 },
    { codePoint: /* "!" */ 0x0021, f: 0.8 },
    { codePoint: /* "s" */ 0x0073, f: 0.4 },
  ];

  deepEqual(
    orderCc1Letters(letters).map(({ codePoint }) =>
      String.fromCodePoint(codePoint),
    ),
    ["e", "a", "s", "z", "!", "?"],
  );
});

test("does not reorder letters that are outside the progression", () => {
  const letters = [
    { codePoint: /* "é" */ 0x00e9, f: 0.2 },
    { codePoint: /* "à" */ 0x00e0, f: 0.4 },
  ];

  deepEqual(
    orderCc1Letters(letters).map(({ codePoint }) => codePoint),
    [0x00e0, 0x00e9],
  );
});
