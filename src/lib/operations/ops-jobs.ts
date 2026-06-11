import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { jobDayCrewLine, jobDayTruckLine } from "@/lib/moves/job-day-display";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import { mergeRollingOpsDemoJobDays } from "@/lib/operations/ops-jobs-rolling-demo";
import type { JobDayStatus, MoveJobDay, MoveRecord, PipelineStageId } from "@/lib/moves/types";

/** Moves that have entered operations (booked or finished). */
const OPS_JOBS_PIPELINE_STAGES: PipelineStageId[] = ["booked", "completed"];

/** Active / upcoming job days on the schedule (not quote-only). */
const BOOKED_OPS_DAY_STATUSES: JobDayStatus[] = ["scheduled", "in_progress"];

const COMPLETED_OPS_DAY_STATUS: JobDayStatus = "completed";

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

export function isOpsJobsBookedJobDay(day: MoveJobDay): boolean {
  if (day.status === "cancelled" || day.status === "proposed") return false;
  return BOOKED_OPS_DAY_STATUSES.includes(day.status) || day.status === COMPLETED_OPS_DAY_STATUS;
}

export function isOpsJobsEligibleMove(move: MoveRecord): boolean {
  if (isMoveLost(move)) return false;
  if (move.conditionStatus === "cancelled") return false;
  if (!OPS_JOBS_PIPELINE_STAGES.includes(move.pipelineStage)) return false;
  return move.jobDays.some((d) => isOpsJobsBookedJobDay(d));
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

export function collectOpsJobDays(moves: MoveRecord[], today: Date = new Date()): OpsJobDayRow[] {
  const rows: OpsJobDayRow[] = [];
  for (const move of moves) {
    if (!isOpsJobsEligibleMove(move)) continue;
    for (const day of move.jobDays) {
      if (!isOpsJobsBookedJobDay(day)) continue;
      rows.push(rowFromJobDay(move, day));
    }
  }
  return mergeRollingOpsDemoJobDays(rows, moves, today);
}

function sortOpsJobRows(rows: OpsJobDayRow[], view: OpsJobsView): OpsJobDayRow[] {
  const tieBreak = (a: OpsJobDayRow, b: OpsJobDayRow) =>
    a.customerName.localeCompare(b.customerName);

  if (view === "past") {
    return [...rows].sort(
      (a, b) => b.date.localeCompare(a.date) || tieBreak(a, b),
    );
  }

  return [...rows].sort(
    (a, b) => a.date.localeCompare(b.date) || tieBreak(a, b),
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

  let filtered: OpsJobDayRow[];

  switch (view) {
    case "past":
      filtered = rows.filter(
        (r) =>
          r.date < todayKey &&
          r.date >= pastStart &&
          r.status === COMPLETED_OPS_DAY_STATUS,
      );
      break;
    case "today":
      filtered = rows.filter(
        (r) =>
          r.date === todayKey &&
          (BOOKED_OPS_DAY_STATUSES.includes(r.status) ||
            r.status === COMPLETED_OPS_DAY_STATUS),
      );
      break;
    case "tomorrow":
      filtered = rows.filter(
        (r) => r.date === tomorrowKey && BOOKED_OPS_DAY_STATUSES.includes(r.status),
      );
      break;
    case "date": {
      const key = selectedDateKey ?? todayKey;
      filtered = rows.filter((r) => {
        if (r.date !== key) return false;
        if (key < todayKey) {
          return r.status === COMPLETED_OPS_DAY_STATUS;
        }
        return BOOKED_OPS_DAY_STATUSES.includes(r.status);
      });
      break;
    }
    default:
      filtered = rows;
  }

  return sortOpsJobRows(filtered, view);
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

/** Rolling demo rows use synthetic jobDayIds — build a displayable day from list row data. */
export function jobDayFromOpsRow(row: OpsJobDayRow): MoveJobDay {
  return {
    id: row.jobDayId,
    label: row.dayLabel,
    date: row.date,
    status: row.status,
    arrivalWindow: row.arrivalWindow,
    durationLabel: row.durationLabel,
    crewSummary: row.crewLine ?? undefined,
    truckSummary: row.truckLine ?? undefined,
    originNote: row.origin,
    destinationNote: row.destination,
  };
}

/**
 * Resolve the job day backing an ops list row.
 * Demo rows may not have a matching id on the move — fall back to date match, then synthesize.
 */
export function resolveJobDayForOpsRow(
  move: MoveRecord,
  row: OpsJobDayRow,
): MoveJobDay {
  const byId = move.jobDays.find((d) => d.id === row.jobDayId);
  if (byId) return byId;

  const byDate = move.jobDays.find(
    (d) =>
      d.date === row.date &&
      d.status !== "cancelled" &&
      d.status !== "proposed",
  );
  if (byDate) return byDate;

  return jobDayFromOpsRow(row);
}

/** Persisted job day on the move, if any — used when applying edits. */
export function findPersistedJobDayForOpsRow(
  move: MoveRecord,
  row: OpsJobDayRow,
): MoveJobDay | undefined {
  return (
    move.jobDays.find((d) => d.id === row.jobDayId) ??
    move.jobDays.find(
      (d) =>
        d.date === row.date &&
        d.status !== "cancelled" &&
        d.status !== "proposed",
    )
  );
}

export function mergeOpsJobDayPatch(
  move: MoveRecord,
  row: OpsJobDayRow,
  patch: Partial<MoveJobDay>,
): MoveJobDay {
  const resolved = resolveJobDayForOpsRow(move, row);
  const persisted = findPersistedJobDayForOpsRow(move, row);
  const base = persisted ?? resolved;
  return { ...base, ...patch };
}

export { PAST_LOOKBACK_DAYS, FUTURE_LOOKAHEAD_DAYS };
