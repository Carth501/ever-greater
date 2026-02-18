import { describe, expect, it } from "vitest";
import { evaluateUnlocks } from "./unlocks.js";

describe("unlock rules", () => {
  it("returns no unlocks below first threshold", () => {
    expect(evaluateUnlocks(19)).toEqual([]);
  });

  it("unlocks configured features as thresholds are crossed", () => {
    expect(evaluateUnlocks(100)).toEqual([
      "ticket_tps_stats",
      "personal_stock",
      "ticket_machine",
    ]);
  });
});
