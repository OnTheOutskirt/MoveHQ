import { tomorrowDateKey } from "./collect-day-jobs";

/** Placeholder in mock move/job-day dates — resolved to calendar tomorrow at enrich time. */
export const DISPATCH_DEMO_DATE_SENTINEL = "__TOMORROW__";

export const DISPATCH_DEMO_MOVE_IDS = [
  "mv-ds-long",
  "mv-ds-medium",
  "mv-ds-short-am",
  "mv-ds-short-pm",
  "mv-ds-brief-pm",
] as const;

export function resolveDispatchDemoDate(
  date: string,
  referenceDate: Date = new Date(),
): string {
  return date === DISPATCH_DEMO_DATE_SENTINEL ? tomorrowDateKey(referenceDate) : date;
}

export function isDispatchDemoMoveId(moveId: string): boolean {
  return (DISPATCH_DEMO_MOVE_IDS as readonly string[]).includes(moveId);
}
