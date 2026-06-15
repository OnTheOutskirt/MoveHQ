import type { PayPeriod, PayrollReadinessBlocker, TimeEntry, TipEntry } from "./types";

export function pendingTimeEntryIds(entries: TimeEntry[]): string[] {
  return entries.filter((e) => e.status === "pending").map((e) => e.id);
}

export function pendingTipEntryIds(tips: TipEntry[]): string[] {
  return tips.filter((t) => t.status === "pending").map((t) => t.id);
}

export function assessPayPeriodReadiness(
  allEntries: TimeEntry[],
  allTips: TipEntry[],
  period: PayPeriod,
): { ready: boolean; blockers: PayrollReadinessBlocker[] } {
  const periodEntries = allEntries.filter(
    (e) => e.date >= period.start && e.date <= period.end,
  );
  const periodTips = allTips.filter((t) => t.date >= period.start && t.date <= period.end);
  const blockers: PayrollReadinessBlocker[] = [];

  const pendingTime = periodEntries.filter((e) => e.status === "pending");
  if (pendingTime.length > 0) {
    blockers.push({
      kind: "time_pending",
      message: `${pendingTime.length} time ${pendingTime.length === 1 ? "entry" : "entries"} still pending approval for this pay period.`,
    });
  }

  const pendingTips = periodTips.filter((t) => t.status === "pending");
  if (pendingTips.length > 0) {
    blockers.push({
      kind: "tips_pending",
      message: `${pendingTips.length} tip ${pendingTips.length === 1 ? "entry" : "entries"} still pending approval for this pay period.`,
    });
  }

  return { ready: blockers.length === 0, blockers };
}
