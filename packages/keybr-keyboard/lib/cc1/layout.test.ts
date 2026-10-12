import { test } from "node:test";
import { equal, isFalse, isTrue } from "rich-assert";
import { Geometry } from "../geometry.ts";
import { type KeyShape } from "../keyshape.ts";
import { Language } from "../language.ts";
import { Layout } from "../layout.ts";
import { loadKeyboard } from "../load.ts";
import { CC1_A1, CC1_A2, CC1_SLOTS } from "./data.ts";
import { CC1_PROGRESSION } from "./order.ts";

test("position tables stay aligned with the device slot order", () => {
  equal(CC1_SLOTS.length, 90);
  equal(CC1_A1.length, 90);
  equal(CC1_A2.length, 90);
  equal(CC1_SLOTS[19]!.hand, "left");
  equal(CC1_SLOTS[19]!.finger, "index");
  equal(CC1_SLOTS[19]!.direction, "s");
  equal(CC1_A1[19], /* e */ 101);
  equal(CC1_SLOTS[61]!.hand, "right");
  equal(CC1_SLOTS[61]!.finger, "index");
  equal(CC1_SLOTS[61]!.direction, "w");
  equal(CC1_A1[61], /* a */ 97);
});

test("is an opt-in english layout with its own family and geometry", () => {
  equal(Layout.EN_CC1.id, "en-cc1");
  equal(Layout.EN_CC1.xid, 0xb2);
  equal(Layout.EN_CC1.family, "cc1");
  equal(Layout.EN_CC1.language, Language.EN);
  equal(Layout.EN_US.family, "qwerty");
  isFalse(Layout.EN_US.geometries.has(Geometry.CC1));
  isTrue(Layout.EN_CC1.geometries.has(Geometry.CC1));
  equal(Layout.EN_CC1.geometries.size, 1);
  isFalse(Layout.custom(Language.EN).geometries.has(Geometry.CC1));
  equal(Layout.custom(Language.EN).geometries.size, Geometry.ALL.size - 1);
});

test("leaves the united states geometry where it was", () => {
  const keyboard = loadKeyboard(Layout.EN_US, Geometry.ANSI_101);
  const keyA = keyboard.getShape("KeyA");
  equal(keyA?.x, 1.75);
  equal(keyA?.y, 2);
  equal(keyA?.finger, "pinky");
  equal(keyA?.hand, "left");
});

test("places every letter on the switch the default layout uses", () => {
  const keyboard = loadKeyboard(Layout.EN_CC1);
  const shapes = new Map<string, KeyShape>();
  for (const shape of keyboard.shapes.values()) {
    if (
      shape.a != null &&
      typeof shape.a === "number" &&
      shape.a >= 0x61 &&
      shape.a <= 0x7a
    ) {
      shapes.set(String.fromCodePoint(shape.a), shape);
    }
  }
  equal(shapes.size, 26);

  for (const group of CC1_PROGRESSION) {
    for (const letter of group.letters) {
      const shape = shapes.get(letter);
      isTrue(shape != null);
      const hub = keyboard.getShape(hubId(shape!.hand, group.finger))!;
      equal(shape!.finger, fingerZone(group.finger, shape!.hand));
      equal(directionOf(hub, shape!), group.direction);
      const distance = Math.hypot(shape!.x - hub.x, shape!.y - hub.y);
      isTrue(distance > 0.9 && distance < 1.4);
    }
  }
});

test("puts shift on the inward pinky and does not stack keys", () => {
  const keyboard = loadKeyboard(Layout.EN_CC1);
  const shiftLeft = keyboard.getShape("ShiftLeft")!;
  const shiftRight = keyboard.getShape("ShiftRight")!;
  const leftPinky = keyboard.getShape("Cc1FnLeft")!;
  const rightPinky = keyboard.getShape("Cc1FnRight")!;
  equal(shiftLeft.finger, "pinky");
  equal(shiftLeft.hand, "left");
  isTrue(shiftLeft.x > leftPinky.x);
  equal(shiftRight.finger, "pinky");
  equal(shiftRight.hand, "right");
  isTrue(shiftRight.x < rightPinky.x);

  const boxes = [...keyboard.shapes.values()];
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      isFalse(overlaps(boxes[i]!, boxes[j]!));
    }
  }
});

test("types a letter from the key code the device sends", () => {
  const keyboard = loadKeyboard(Layout.EN_CC1);
  const combo = keyboard.getCombo(/* LATIN SMALL LETTER A */ 0x0061);
  equal(combo?.id, "KeyA");
  equal(keyboard.getShape("KeyA")?.hand, "right");
  equal(keyboard.getCombo(/* LATIN CAPITAL LETTER A */ 0x0041)?.id, "KeyA");
  equal(keyboard.getCombo(/* QUESTION MARK */ 0x003f), null);
  isTrue(keyboard.getCodePoints().has(/* LATIN SMALL LETTER E */ 0x0065));
  isFalse(keyboard.getCodePoints().has(/* DIGIT FOUR */ 0x0034));
});

function fingerZone(
  finger: "index" | "middle" | "thumb1" | "thumb2" | "ring",
  hand: string | null,
): string {
  switch (finger) {
    case "index":
      return hand === "left" ? "leftIndex" : "rightIndex";
    case "middle":
      return "middle";
    case "ring":
      return "ring";
    default:
      return "thumb";
  }
}

function hubId(hand: string | null, finger: string): string {
  const side = hand === "left" ? "Left" : "Right";
  const name = finger.charAt(0).toUpperCase() + finger.slice(1);
  return `Cc1${side}${name}Hub`;
}

function directionOf(hub: KeyShape, shape: KeyShape): string {
  const dx = shape.x - hub.x;
  const dy = shape.y - hub.y;
  const cardinal =
    Math.abs(dy) > Math.abs(dx)
      ? dy > 0
        ? "south"
        : "north"
      : dx > 0
        ? "east"
        : "west";
  if (cardinal === "south" || cardinal === "north") {
    return cardinal;
  }
  const inward = hub.hand === "left" ? "east" : "west";
  return cardinal === inward ? "inward" : "outward";
}

function overlaps(a: KeyShape, b: KeyShape): boolean {
  const pad = 0.02;
  return (
    a.x + pad < b.x + b.w &&
    a.x + a.w > b.x + pad &&
    a.y + pad < b.y + b.h &&
    a.y + a.h > b.y + pad
  );
}
