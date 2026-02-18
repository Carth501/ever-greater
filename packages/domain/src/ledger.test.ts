import { describe, expect, it } from "vitest";
import { calculateRolling24hContribution } from "./ledger.js";

describe("rolling 24h ledger", () => {
  it("ignores entries older than 24h", () => {
    const now = 1_700_000_000_000;
    const result = calculateRolling24hContribution(
      "u1",
      [
        { userId: "u1", createdAtMs: now - 1_000, amount: [3] },
        {
          userId: "u1",
          createdAtMs: now - 24 * 60 * 60 * 1000 - 1,
          amount: [50],
        },
        { userId: "u2", createdAtMs: now - 2_000, amount: [99] },
      ],
      now,
    );

    expect(result).toEqual([3]);
  });
});
