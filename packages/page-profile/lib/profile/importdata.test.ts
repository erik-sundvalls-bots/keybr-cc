import { test } from "node:test";
import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { deepEqual, equal } from "rich-assert";
import { parseTypingData, selectNewResults } from "./importdata.ts";

function makeResult(layout: Layout, timeStamp: number): Result {
  return new Result(
    layout,
    TextType.GENERATED,
    timeStamp,
    100,
    20000,
    3,
    new Histogram([
      { codePoint: 0x61, hitCount: 10, missCount: 1, timeToType: 250 },
      { codePoint: 0x62, hitCount: 12, missCount: 0, timeToType: 180 },
      { codePoint: 0x63, hitCount: 9, missCount: 2, timeToType: 300 },
    ]),
  );
}

test("round-trip downloaded data", () => {
  const results = [
    makeResult(Layout.EN_CC1, Date.UTC(2026, 9, 1)),
    makeResult(Layout.EN_US, Date.UTC(2026, 9, 2)),
  ];
  const parsed = parseTypingData(JSON.stringify(results));
  equal(parsed.length, 2);
  deepEqual(
    parsed.map((r) => r.toJSON()),
    results.map((r) => r.toJSON()),
  );
  equal(parsed[0].layout, Layout.EN_CC1);
});

test("skip invalid entries", () => {
  const good = makeResult(Layout.EN_CC1, Date.UTC(2026, 9, 1));
  const text = JSON.stringify([good, { layout: "nope" }, null, 42]);
  equal(parseTypingData(text).length, 1);
});

test("reject non-array", () => {
  let failed = false;
  try {
    parseTypingData("{}");
  } catch {
    failed = true;
  }
  equal(failed, true);
});

test("select only newer results", () => {
  const a = makeResult(Layout.EN_CC1, 1000_000);
  const b = makeResult(Layout.EN_CC1, 2000_000);
  const c = makeResult(Layout.EN_CC1, 3000_000);
  const { added, skipped } = selectNewResults([a, b], [c, b, a, c]);
  deepEqual(
    added.map((r) => r.timeStamp),
    [3000_000],
  );
  equal(skipped, 3);
  equal(selectNewResults([], [b, a]).added[0], a);
});
