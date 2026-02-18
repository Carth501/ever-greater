export type UnlockFeature =
  | "ticket_tps_stats"
  | "personal_stock"
  | "ticket_machine";

export interface UnlockRule {
  threshold: number;
  feature: UnlockFeature;
}

export const defaultUnlockRules: UnlockRule[] = [
  { threshold: 20, feature: "ticket_tps_stats" },
  { threshold: 50, feature: "personal_stock" },
  { threshold: 100, feature: "ticket_machine" },
];

export function evaluateUnlocks(
  contributedTickets: number,
  rules: UnlockRule[] = defaultUnlockRules,
): UnlockFeature[] {
  return rules
    .filter((rule) => contributedTickets >= rule.threshold)
    .map((rule) => rule.feature);
}
