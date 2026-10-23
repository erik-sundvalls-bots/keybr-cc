// Import of typing data previously saved with "Download data".
// Used by the static GitHub Pages build of the fork, where the results
// are kept only in the browser and there is no account to sync them.

import { Layout } from "@keybr/keyboard";
import { Result, TextType } from "@keybr/result";
import { Histogram, type Sample } from "@keybr/textinput";

/**
 * Parses the JSON produced by "Download data" (`Result.toJSON()` of every
 * result) back into results. Invalid entries are skipped.
 */
export function parseTypingData(text: string): Result[] {
  const json: unknown = JSON.parse(text);
  if (!Array.isArray(json)) {
    throw new TypeError("Expected a JSON array of results");
  }
  const results: Result[] = [];
  for (const item of json) {
    const result = parseResult(item);
    if (result != null && result.validate()) {
      results.push(result);
    }
  }
  return results;
}

function parseResult(item: any): Result | null {
  if (item == null || typeof item !== "object") {
    return null;
  }
  const { layout, textType, timeStamp, length, time, errors, histogram } = item;
  const ts =
    typeof timeStamp === "number" ? timeStamp : Date.parse(String(timeStamp));
  if (!(
    typeof layout === "string" &&
    typeof textType === "string" &&
    Number.isSafeInteger(ts) &&
    Number.isSafeInteger(length) &&
    Number.isSafeInteger(time) &&
    Number.isSafeInteger(errors) &&
    Array.isArray(histogram)
  )) {
    return null;
  }
  const samples: Sample[] = [];
  for (const s of histogram) {
    if (
      s == null ||
      !Number.isSafeInteger(s.codePoint) ||
      !Number.isSafeInteger(s.hitCount) ||
      !Number.isSafeInteger(s.missCount) ||
      !Number.isFinite(s.timeToType)
    ) {
      return null;
    }
    samples.push({
      codePoint: s.codePoint,
      hitCount: s.hitCount,
      missCount: s.missCount,
      timeToType: Math.round(s.timeToType),
    });
  }
  try {
    return new Result(
      Layout.ALL.get(layout),
      TextType.ALL.get(textType),
      ts,
      length,
      time,
      errors,
      new Histogram(samples),
    );
  } catch {
    return null;
  }
}

/**
 * Picks the imported results that can be appended to the existing ones:
 * results are stored in chronological order, so only results newer than the
 * latest existing one are added. Duplicates are therefore skipped too.
 */
export function selectNewResults(
  existing: readonly Result[],
  imported: readonly Result[],
): { readonly added: Result[]; readonly skipped: number } {
  const latest = existing.reduce((t, r) => Math.max(t, r.timeStamp), -Infinity);
  const added = imported
    .filter((r) => r.timeStamp > latest)
    .sort((a, b) => a.timeStamp - b.timeStamp);
  const unique: Result[] = [];
  for (const r of added) {
    if (unique.length === 0 || unique.at(-1)!.timeStamp !== r.timeStamp) {
      unique.push(r);
    }
  }
  return { added: unique, skipped: imported.length - unique.length };
}
