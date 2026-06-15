import { buildRollingMockTimeEntries } from "./mock-time-entries";
import type { TipEntry, TimeEntry } from "./types";

function tipAmountForEntry(entry: TimeEntry): number {
  if (entry.jobRef === "MV-DONE" || entry.jobRef === "MV-COMPLETE-2D") return 35;
  return Math.round(entry.hours * 8);
}

/** Crew tips derived from job time — office staff never receive tips. */
export function buildRollingMockTipEntries(today = new Date()): TipEntry[] {
  const timeEntries = buildRollingMockTimeEntries(today);
  return timeEntries
    .filter((e) => e.workerType === "crew" && e.jobRef)
    .map((e, index) => {
      const pending =
        e.status === "pending" || (e.status === "approved" && index % 4 === 0);
      return {
        id: `tip-${e.id}`,
        personId: e.personId,
        personName: e.personName,
        date: e.date,
        jobRef: e.jobRef!,
        amount: tipAmountForEntry(e),
        status: pending ? ("pending" as const) : ("approved" as const),
        source: "crew_app" as const,
        notes:
          pending && e.status === "approved"
            ? "Verify split with crew lead"
            : undefined,
      };
    });
}
