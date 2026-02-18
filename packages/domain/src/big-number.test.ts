import { describe, expect, it } from "vitest";
import {
  addSegmented,
  compareSegmented,
  normalizeSegmented,
  segmentedFromNumber,
  segmentedToString,
} from "./big-number.js";

describe("big-number", () => {
  it("normalizes carry across multiple limbs", () => {
    expect(normalizeSegmented([1001, 2050, 0])).toEqual([1, 51, 2]);
  });

  it("adds segmented values deterministically", () => {
    const result = addSegmented([999, 999], [2, 0]);
    expect(result).toEqual([1, 0, 1]);
  });

  it("converts to and from numbers", () => {
    const segmented = segmentedFromNumber(1_234_567);
    expect(segmented).toEqual([567, 234, 1]);
    expect(segmentedToString(segmented)).toBe("1234567");
  });

  it("compares segmented numbers", () => {
    expect(compareSegmented([1], [1])).toBe(0);
    expect(compareSegmented([0, 1], [999])).toBe(1);
    expect(compareSegmented([998], [999])).toBe(-1);
  });

  it("rejects invalid segmentedFromNumber input", () => {
    expect(() => segmentedFromNumber(-1)).toThrowError(
      "Input must be a non-negative integer",
    );
  });
});
