import {
  type CharacterDict,
  type GeometryDict,
  type LabelShape,
  type ZoneId,
} from "../types.ts";
import {
  CC1_A1,
  CC1_A2,
  CC1_SLOTS,
  type Cc1Direction,
  type Cc1Finger,
  type Cc1Hand,
} from "./data.ts";

const ORIGIN = 1.7;
const PITCH = 3.35;
const STEP = 1.12;
const HAND_GAP = 1.6;

const COLUMN: Record<Cc1Finger, number> = {
  pinky: 0,
  ring: 1,
  ring2: 1,
  middle: 2,
  middle2: 2,
  index: 3,
  thumb1: 3.7,
  thumb2: 3.45,
  thumb3: 3.2,
};

const ROW: Record<Cc1Finger, number> = {
  pinky: 0.5,
  ring: 0,
  ring2: 1,
  middle: 0,
  middle2: 1,
  index: 0.5,
  thumb1: 2.05,
  thumb2: 3.05,
  thumb3: 4.05,
};

const DIRECTION_OFFSET: Record<Cc1Direction, readonly [number, number]> = {
  c: [0, 0],
  n: [0, -STEP],
  e: [STEP, 0],
  s: [0, STEP],
  w: [-STEP, 0],
};

/**
 * US key id for an unshifted ASCII action code. The device sends these key
 * codes, so with a US OS layout (or with layout emulation on) the character
 * is the action code itself.
 */
const PUNCT_KEY: Record<number, string> = {
  0x27: "Quote",
  0x2c: "Comma",
  0x2d: "Minus",
  0x2e: "Period",
  0x2f: "Slash",
  0x3b: "Semicolon",
  0x3d: "Equal",
  0x5b: "BracketLeft",
  0x5c: "Backslash",
  0x5d: "BracketRight",
  0x60: "Backquote",
};

/** Shifted companion produced by holding the pinky shift with that key. */
const PUNCT_SHIFT: Record<number, number> = {
  0x27: 0x22,
  0x2c: 0x3c,
  0x2d: 0x5f,
  0x2e: 0x3e,
  0x2f: 0x3f,
  0x3b: 0x3a,
  0x3d: 0x2b,
  0x5b: 0x7b,
  0x5c: 0x7c,
  0x5d: 0x7d,
  0x60: 0x7e,
};

/**
 * Action codes that already include shift, so the device types the shifted
 * character from that switch alone. "?" is the one of these on the A1 layer.
 */
const SHIFTED_CHAR: Record<number, string> = {
  33: "!",
  34: '"',
  35: "#",
  36: "$",
  37: "%",
  38: "&",
  40: "(",
  41: ")",
  42: "*",
  43: "+",
  58: ":",
  60: "<",
  62: ">",
  63: "?",
  64: "@",
  94: "^",
  95: "_",
  123: "{",
  124: "|",
  125: "}",
  126: "~",
};

const NAMED_KEY: Record<
  number,
  { readonly keyId: string; readonly label: string }
> = {
  32: { keyId: "Space", label: "Space" },
  544: { keyId: "Space", label: "Space" },
  296: { keyId: "Enter", label: "Enter" },
  298: { keyId: "Backspace", label: "Bksp" },
  299: { keyId: "Tab", label: "Tab" },
  127: { keyId: "Delete", label: "Del" },
  297: { keyId: "Escape", label: "Esc" },
  513: { keyId: "ShiftLeft", label: "Shift" },
  517: { keyId: "ShiftRight", label: "Shift" },
  512: { keyId: "ControlLeft", label: "Ctrl" },
  516: { keyId: "ControlRight", label: "Ctrl" },
  514: { keyId: "AltLeft", label: "Alt" },
  518: { keyId: "AltRight", label: "Alt" },
  515: { keyId: "MetaLeft", label: "Meta" },
  519: { keyId: "MetaRight", label: "Meta" },
  335: { keyId: "ArrowRight", label: "Right" },
  336: { keyId: "ArrowLeft", label: "Left" },
  337: { keyId: "ArrowDown", label: "Down" },
  338: { keyId: "ArrowUp", label: "Up" },
  550: { keyId: "Cc1NumLeft", label: "Num" },
  551: { keyId: "Cc1NumRight", label: "Num" },
  552: { keyId: "Cc1FnLeft", label: "Fn" },
  553: { keyId: "Cc1FnRight", label: "Fn" },
  540: { keyId: "Cc1ThrowLeft", label: "Swap" },
  542: { keyId: "Cc1ThrowRight", label: "Swap" },
  536: { keyId: "Cc1Dup", label: "Dup" },
  562: { keyId: "Cc1MouseLeft", label: "Mouse" },
  563: { keyId: "Cc1MouseRight", label: "Mouse" },
  565: { keyId: "Cc1MouseEast", label: "M>" },
  566: { keyId: "Cc1MouseWest", label: "M<" },
  567: { keyId: "Cc1MouseSouth", label: "Mv" },
  568: { keyId: "Cc1MouseNorth", label: "M^" },
};

const HUB_ID: Record<number, string> = {
  600: "Cc1LeftThumb3Hub",
  601: "Cc1LeftThumb2Hub",
  602: "Cc1LeftThumb1Hub",
  603: "Cc1LeftIndexHub",
  604: "Cc1LeftMiddleHub",
  605: "Cc1LeftRingHub",
  606: "Cc1LeftPinkyHub",
  607: "Cc1LeftMiddle2Hub",
  608: "Cc1LeftRing2Hub",
  609: "Cc1RightThumb3Hub",
  610: "Cc1RightThumb2Hub",
  611: "Cc1RightThumb1Hub",
  612: "Cc1RightIndexHub",
  613: "Cc1RightMiddleHub",
  614: "Cc1RightRingHub",
  615: "Cc1RightPinkyHub",
  616: "Cc1RightMiddle2Hub",
  617: "Cc1RightRing2Hub",
};

const CENTER_LABEL = new Map<number, string>(
  Object.keys(HUB_ID).map((code) => {
    const value = Number(code);
    return [value, String(value - 599).padStart(2, "0")];
  }),
);

function leftCenter(finger: Cc1Finger): { x: number; y: number } {
  return {
    x: ORIGIN + COLUMN[finger] * PITCH,
    y: ORIGIN + ROW[finger] * PITCH,
  };
}

const MIRROR = (() => {
  const thumb = leftCenter("thumb1");
  return HAND_GAP + 2 * thumb.x + 2 * STEP + 1;
})();

function switchCenter(
  hand: Cc1Hand,
  finger: Cc1Finger,
): { x: number; y: number } {
  const left = leftCenter(finger);
  return hand === "left" ? left : { x: MIRROR - left.x, y: left.y };
}

function fingerZone(hand: Cc1Hand, finger: Cc1Finger): ZoneId {
  switch (finger) {
    case "pinky":
      return "pinky";
    case "ring":
    case "ring2":
      return "ring";
    case "middle":
    case "middle2":
      return "middle";
    case "index":
      return hand === "left" ? "leftIndex" : "rightIndex";
    default:
      return "thumb";
  }
}

function rowZone(direction: Cc1Direction): ZoneId {
  switch (direction) {
    case "n":
      return "top";
    case "s":
      return "bottom";
    default:
      return "home";
  }
}

function centered(text: string): LabelShape {
  return { text, pos: [19, 20], align: ["m", "m"] };
}

function cornerDigit(text: string): LabelShape {
  return { text, pos: [34, 32], align: ["e", "b"] };
}

function unshiftedKey(code: number): {
  keyId: string;
  codePoint: number;
  shift: number | null;
} | null {
  if (code >= /* a */ 0x61 && code <= /* z */ 0x7a) {
    return {
      keyId: `Key${String.fromCharCode(code).toUpperCase()}`,
      codePoint: code,
      shift: code - 0x20,
    };
  }
  const keyId = PUNCT_KEY[code];
  if (keyId == null) {
    return null;
  }
  return { keyId, codePoint: code, shift: PUNCT_SHIFT[code] ?? null };
}

const OWN_SWITCH_SHIFT = new Set<number>(
  CC1_A1.map((code) => SHIFTED_CHAR[code]?.codePointAt(0) ?? 0).filter(
    (codePoint) => codePoint > 0,
  ),
);

type Placement = {
  readonly keyId: string;
  readonly characters: readonly number[] | null;
  readonly labels: readonly LabelShape[];
  readonly homing: boolean;
};

function placement(index: number, used: Set<string>): Placement | null {
  const code = CC1_A1[index] ?? 0;
  if (code === 0) {
    return null;
  }
  const digit = CC1_A2[index] ?? 0;
  const digitLabel =
    digit >= 0x30 && digit <= 0x39
      ? cornerDigit(String.fromCharCode(digit))
      : null;
  const slot = CC1_SLOTS[index]!;
  const homing = slot.finger === "index" && slot.direction === "c";

  const claim = (preferred: string): string => {
    if (!used.has(preferred)) {
      used.add(preferred);
      return preferred;
    }
    const extra = `Cc1Slot${index}`;
    used.add(extra);
    return extra;
  };

  const char = unshiftedKey(code);
  if (char != null) {
    const keyId = claim(char.keyId);
    const shift =
      char.shift != null && !OWN_SWITCH_SHIFT.has(char.shift)
        ? char.shift
        : null;
    return {
      keyId,
      characters:
        keyId === char.keyId
          ? shift == null
            ? [char.codePoint]
            : [char.codePoint, shift]
          : null,
      labels: digitLabel == null ? [] : [digitLabel],
      homing,
    };
  }

  const named = NAMED_KEY[code];
  if (named != null) {
    const keyId = claim(named.keyId);
    const characters =
      keyId === "Space" && keyId === named.keyId ? [/* SPACE */ 0x0020] : null;
    return {
      keyId,
      characters,
      labels: [
        centered(named.label),
        ...(digitLabel == null ? [] : [digitLabel]),
      ],
      homing,
    };
  }

  const hub = HUB_ID[code];
  if (hub != null) {
    return {
      keyId: claim(hub),
      characters: null,
      labels: [centered(CENTER_LABEL.get(code) ?? "•")],
      homing,
    };
  }

  const shifted = SHIFTED_CHAR[code];
  if (shifted != null) {
    return {
      keyId: claim(`Cc1Slot${index}`),
      characters: null,
      labels: [centered(shifted), ...(digitLabel == null ? [] : [digitLabel])],
      homing,
    };
  }

  return {
    keyId: claim(`Cc1Slot${index}`),
    characters: null,
    labels: [centered(String(code))],
    homing,
  };
}

function build(): {
  geometry: GeometryDict;
  characters: CharacterDict;
} {
  const used = new Set<string>();
  const geometry: Record<string, GeometryDict[string]> = {};
  const characters: Record<string, readonly number[]> = {};
  CC1_SLOTS.forEach((slot, index) => {
    const placed = placement(index, used);
    if (placed == null) {
      return;
    }
    const { x: cx, y: cy } = switchCenter(slot.hand, slot.finger);
    const [dx, dy] = DIRECTION_OFFSET[slot.direction];
    geometry[placed.keyId] = {
      x: cx + dx - 0.5,
      y: cy + dy - 0.5,
      labels: placed.labels,
      zones: [
        fingerZone(slot.hand, slot.finger),
        slot.hand,
        rowZone(slot.direction),
      ],
      homing: placed.homing,
    };
    if (placed.characters != null) {
      characters[placed.keyId] = placed.characters;
    }
  });
  return { geometry, characters };
}

const built = build();

export const CC1_GEOMETRY: GeometryDict = built.geometry;
export const CC1_CHARACTERS: CharacterDict = built.characters;
