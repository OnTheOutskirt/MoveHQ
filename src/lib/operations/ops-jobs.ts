import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { jobDayCrewLine, jobDayTruckLine } from "@/lib/moves/job-day-display";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { JobDayStatus, MoveJobDay, MoveRecord } from "@/lib/moves/types";

export type OpsJobsView = "past" | "today" | "tomorrow" | "date";

export type OpsJobDayRow = {
  id: string;
  moveId: string;
  jobDayId: string;
  date: string;
  customerName: string;
  dayLabel: string;
  status: JobDayStatus;
  moveType: MoveRecord["moveType"];
  pipelineStage: MoveRecord["pipelineStage"];
  arrivalWindow?: string;
  durationLabel?: string;
  crewLine: string | null;
  truckLine: string | null;
  origin: string;
  destination: string;
};

const PAST_LOOKBACK_DAYS = 21;
const FUTURE_LOOKAHEAD_DAYS = 90;

export function isOpsJobsEligibleMove(move: MoveRecord): boolean {
  if (isMoveLost(move)) return false;
  if (move.conditionStatus === "cancelled") return false;
  return move.jobDays.some((d) => d.status !== "cancelled");
}

function rowFromJobDay(move: MoveRecord, day: MoveJobDay): OpsJobDayRow {
  const origin = day.originNote?.trim() || move.originAddress;
  const destination = day.destinationNote?.trim() || move.destinationAddress;
  return {
    id: `${move.id}:${day.id}`,
    moveId: move.id,
    jobDayId: day.id,
    date: day.date,
    customerName: move.customerName,
    dayLabel: day.label,
    status: day.status,
    moveType: move.moveType,
    pipelineStage: move.pipelineStage,
    arrivalWindow: day.arrivalWindow,
    durationLabel: day.durationLabel,
    crewLine: jobDayCrewLine(day),
    truckLine: jobDayTruckLine(day),
    origin,
    destination,
  };
}

export function collectOpsJobDays(moves: MoveRecord[]): OpsJobDayRow[] {
  const rows: OpsJobDayRow[] = [];
  for (const move of moves) {
    if (!isOpsJobsEligibleMove(move)) continue;
    for (const day of move.jobDays) {
      if (day.status === "cancelled") continue;
      rows.push(rowFromJobDay(move, day));
    }
  }
  return rows.sort(
    (a, b) => a.date.localeCompare(b.date) || a.customerName.localeCompare(b.customerName),
  );
}

export function filterOpsJobDays(
  rows: OpsJobDayRow[],
  view: OpsJobsView,
  today: Date,
  selectedDateKey?: string,
): OpsJobDayRow[] {
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));
  const pastStart = toDateKey(addDays(today, -PAST_LOOKBACK_DAYS));

  switch (view) {
    case "past":
      return rows.filter((r) => r.date < todayKey && r.date >= pastStart);
    case "today":
      return rows.filter((r) => r.date === todayKey);
    case "tomorrow":
      return rows.filter((r) => r.date === tomorrowKey);
    case "date": {
      const key = selectedDateKey ?? todayKey;
      return rows.filter((r) => r.date === key);
    }
    default:
      return rows;
  }
}

export function opsJobsViewLabel(
  view: OpsJobsView,
  today: Date,
  selectedDateKey?: string,
): string {
  switch (view) {
    case "past":
      return `Past ${PAST_LOOKBACK_DAYS} days`;
    case "today":
      return "Today";
    case "tomorrow":
      return "Tomorrow";
    case "date": {
      if (!selectedDateKey) return "Selected day";
      const d = parseDateKey(selectedDateKey);
      return d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    }
  }
}

export function defaultSelectedDateForBrowse(today: Date): string {
  return toDateKey(addDays(today, 2));
}

export function isFutureDateKey(dateKey: string, today: Date): boolean {
  return dateKey > toDateKey(today);
}

export { PAST_LOOKBACK_DAYS, FUTURE_LOOKAHEAD_DAYS };
