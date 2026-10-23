import { test } from "node:test";
import { Reader, Writer } from "@keybr/binary";
import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram } from "@keybr/textinput";
import { deepEqual, equal } from "rich-assert";
import { readResult, writeResult } from "./binary.ts";

test("write and read", () => {
  // Arrange.

  const histogram = new Histogram([
    { codePoint: 0x0061, hitCount: 11, missCount: 1, timeToType: 111 },
    { codePoint: 0x0062, hitCount: 22, missCount: 2, timeToType: 222 },
    { codePoint: 0x0063, hitCount: 33, missCount: 3, timeToType: 333 },
  ]);

  const result = new Result(
    /* layout= */ Layout.EN_US,
    /* textType= */ TextType.GENERATED,
    /* timeStamp= */ Date.parse("2001-02-03T03:05:06.123Z"),
    /* length= */ 123,
    /* time= */ 12345,
    /* errors= */ 3,
    /* histogram= */ histogram,
  );

  const expected = new Result(
    /* layout= */ Layout.EN_US,
    /* textType= */ TextType.GENERATED,
    /* timeStamp= */ Date.parse("2001-02-03T03:05:06Z"),
    /* length= */ 123,
    /* time= */ 12345,
    /* errors= */ 3,
    /* histogram= */ histogram,
  );

  // Write.

  const writer = new Writer();

  writeResult(writer, result);
  writeResult(writer, result);
  writeResult(writer, result);

  const buffer = writer.buffer();

  equal(buffer.byteLength, 75);

  // Read.

  const reader = new Reader(buffer);

  equal(reader.remaining(), 75);
  deepEqual(readResult(reader), expected);
  equal(reader.remaining(), 50);
  deepEqual(readResult(reader), expected);
  equal(reader.remaining(), 25);
  deepEqual(readResult(reader), expected);
  equal(reader.remaining(), 0);
});

test("write and read a cc1 result", () => {
  const histogram = new Histogram([
    { codePoint: 0x0065, hitCount: 10, missCount: 1, timeToType: 150 },
  ]);
  const result = new Result(
    /* layout= */ Layout.EN_CC1,
    /* textType= */ TextType.GENERATED,
    /* timeStamp= */ Date.parse("2001-02-03T03:05:06Z"),
    /* length= */ 100,
    /* time= */ 10000,
    /* errors= */ 1,
    /* histogram= */ histogram,
  );
  const writer = new Writer();
  writeResult(writer, result);
  const read = readResult(new Reader(writer.buffer()));
  equal(read.layout, Layout.EN_CC1);
  equal(read.layout.family, "cc1");
  deepEqual(read, result);
});
