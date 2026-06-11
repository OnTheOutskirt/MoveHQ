import { estimateDriveHours } from "@/lib/moves/profitability";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";

/** Planned crew travel hours for one job day (split evenly across days for now). */
export function estimateJobDayDriveHours(move: MoveRecord, jobDayId: string): number {
  void jobDayId;
  const total = estimateDriveHours(move);
  const days = Math.max(1, move.jobDays.length);
  return Math.round((total / days) * 10) / 10;
}

export function jobDayDriveDisplay(
  jobDay: MoveJobDay,
  move: MoveRecord,
): { estimated: number; actual: number | null } {
  return {
    estimated: estimateJobDayDriveHours(move, jobDay.id),
    actual: jobDay.actualDriveHours ?? null,
  };
}
