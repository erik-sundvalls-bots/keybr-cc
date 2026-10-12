import { test } from "node:test";
import { deepEqual, equal } from "rich-assert";
import { CC1_LETTER_ORDER, CC1_PROGRESSION, orderCc1Letters } from "./order.ts";

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

test("starts with the index and middle home directions", () => {
  equal(CC1_LETTER_ORDER.slice(0, 6), "etraon");
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
    ["e", "a", "z", "s", "!", "?"],
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
