import {
  addSegmented,
  segmentedFromNumber,
  SegmentedNumber,
} from "./big-number.js";

export interface ContributionLedgerEntry {
  userId: string;
  createdAtMs: number;
  amount: SegmentedNumber;
}

export function calculateRolling24hContribution(
  userId: string,
  entries: ContributionLedgerEntry[],
  nowMs: number,
): SegmentedNumber {
  const startWindow = nowMs - 24 * 60 * 60 * 1000;

  return entries
    .filter((entry) => entry.userId === userId)
    .filter((entry) => entry.createdAtMs >= startWindow)
    .reduce(
      (accumulator, entry) => addSegmented(accumulator, entry.amount),
      segmentedFromNumber(0),
    );
}
