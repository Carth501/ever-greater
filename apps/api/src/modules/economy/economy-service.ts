import {
  addSegmented,
  evaluateUnlocks,
  segmentedFromNumber,
  SegmentedNumber,
  segmentedToString,
} from "@ever-greater/domain";

export interface EconomyUserState {
  userId: string;
  contributed: SegmentedNumber;
  personalStock: number;
}

export interface EconomyGlobalState {
  tickets: SegmentedNumber;
}

export interface EconomyLedgerEntry {
  userId: string;
  createdAtMs: number;
  amount: SegmentedNumber;
  actionId: string;
}

export interface PrintTicketResult {
  globalTickets: string;
  userContributedTickets: string;
  personalStock: number;
  unlockedFeatures: string[];
}

export class EconomyService {
  private readonly users = new Map<string, EconomyUserState>();
  private readonly processedActionIds = new Set<string>();
  private readonly ledgerEntries: EconomyLedgerEntry[] = [];
  private global: EconomyGlobalState = { tickets: segmentedFromNumber(0) };

  ensureUser(userId: string): void {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        userId,
        contributed: segmentedFromNumber(0),
        personalStock: 100,
      });
    }
  }

  printTicket(
    userId: string,
    actionId: string,
    createdAtMs: number,
  ): PrintTicketResult {
    if (!actionId) {
      throw new Error("Action ID is required");
    }

    this.ensureUser(userId);
    const user = this.users.get(userId)!;

    if (this.processedActionIds.has(actionId)) {
      return this.toSnapshot(user);
    }

    if (user.personalStock <= 0) {
      throw new Error("Personal stock is empty");
    }

    user.personalStock -= 1;
    user.contributed = addSegmented(user.contributed, segmentedFromNumber(1));
    this.global = {
      tickets: addSegmented(this.global.tickets, segmentedFromNumber(1)),
    };
    this.processedActionIds.add(actionId);
    this.ledgerEntries.push({
      userId,
      actionId,
      createdAtMs,
      amount: segmentedFromNumber(1),
    });

    return this.toSnapshot(user);
  }

  getSnapshot(userId: string): PrintTicketResult {
    this.ensureUser(userId);
    return this.toSnapshot(this.users.get(userId)!);
  }

  getGlobalSnapshot(): { globalTickets: string } {
    return {
      globalTickets: segmentedToString(this.global.tickets),
    };
  }

  getLedger(): EconomyLedgerEntry[] {
    return [...this.ledgerEntries];
  }

  private toSnapshot(user: EconomyUserState): PrintTicketResult {
    const contributedAsNumber = Number(segmentedToString(user.contributed));

    return {
      globalTickets: segmentedToString(this.global.tickets),
      userContributedTickets: segmentedToString(user.contributed),
      personalStock: user.personalStock,
      unlockedFeatures: evaluateUnlocks(contributedAsNumber),
    };
  }
}
