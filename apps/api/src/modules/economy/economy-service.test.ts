import { describe, expect, it } from "vitest";
import { EconomyService } from "./economy-service.js";

describe("EconomyService", () => {
  it("increments global and user counters on print", () => {
    const service = new EconomyService();
    const result = service.printTicket("u1", "a1", 1_700_000_000_000);

    expect(result.globalTickets).toBe("1");
    expect(result.userContributedTickets).toBe("1");
    expect(result.personalStock).toBe(99);
  });

  it("is idempotent by action id", () => {
    const service = new EconomyService();
    const first = service.printTicket("u1", "same-action", 1_700_000_000_000);
    const second = service.printTicket("u1", "same-action", 1_700_000_000_005);

    expect(first).toEqual(second);
    expect(service.getLedger()).toHaveLength(1);
  });

  it("unlocks tps stats at 20 contributions", () => {
    const service = new EconomyService();
    for (let index = 0; index < 20; index += 1) {
      service.printTicket("u1", `a-${index}`, 1_700_000_000_000 + index);
    }

    const latest = service.printTicket("u1", "a-20", 1_700_000_000_100);
    expect(latest.unlockedFeatures).toContain("ticket_tps_stats");
  });
});
