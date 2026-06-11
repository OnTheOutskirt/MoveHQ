import { addDays, toDateKey } from "@/lib/calendar/date-utils";
import { jobDayCrewLine, jobDayTruckLine } from "@/lib/moves/job-day-display";
import type { JobDayStatus, MoveRecord } from "@/lib/moves/types";
import type { OpsJobDayRow } from "./ops-jobs";

type RollingJobTemplate = {
  moveId: string;
  jobDayId: string;
  dayLabel: string;
  status: JobDayStatus;
  arrivalWindow?: string;
  durationLabel?: string;
  crewSummary?: string;
  truckSummary?: string;
  dispatchNotes?: string;
};

function buildRow(
  move: MoveRecord,
  template: RollingJobTemplate,
  date: string,
): OpsJobDayRow {
  const origin = move.originAddress;
  const destination = move.destinationAddress;
  const day = {
    id: template.jobDayId,
    label: template.dayLabel,
    date,
    status: template.status,
    arrivalWindow: template.arrivalWindow,
    durationLabel: template.durationLabel,
    crewSummary: template.crewSummary,
    truckSummary: template.truckSummary,
    dispatchNotes: template.dispatchNotes,
  };
  return {
    id: `rolling:${move.id}:${template.jobDayId}:${date}`,
    moveId: move.id,
    jobDayId: template.jobDayId,
    date,
    customerName: move.customerName,
    dayLabel: template.dayLabel,
    status: template.status,
    moveType: move.moveType,
    pipelineStage: move.pipelineStage,
    arrivalWindow: template.arrivalWindow,
    durationLabel: template.durationLabel,
    crewLine: jobDayCrewLine(day) ?? template.crewSummary ?? null,
    truckLine: jobDayTruckLine(day) ?? template.truckSummary ?? null,
    origin,
    destination,
  };
}

const YESTERDAY_JOBS: RollingJobTemplate[] = [
  {
    moveId: "mv-complete",
    jobDayId: "rolling-y-1",
    dayLabel: "Day 1",
    status: "completed",
    arrivalWindow: "8:00 – 10:00 AM",
    durationLabel: "~5 hrs",
    crewSummary: "3 movers · Crew C",
    truckSummary: "Truck #6",
  },
  {
    moveId: "mv-complete-2day",
    jobDayId: "rolling-y-2",
    dayLabel: "Day 2",
    status: "completed",
    arrivalWindow: "7:00 – 9:00 AM",
    durationLabel: "~8 hrs",
    crewSummary: "4 movers · Crew B",
    truckSummary: "26 ft box · Truck #3",
    dispatchNotes: "BOL signed on site",
  },
];

const TODAY_JOBS: RollingJobTemplate[] = [
  {
    moveId: "mv-booked",
    jobDayId: "rolling-t-1",
    dayLabel: "Day 2",
    status: "in_progress",
    arrivalWindow: "7:00 – 9:00 AM",
    durationLabel: "~8 hrs",
    crewSummary: "4 movers · Crew A",
    truckSummary: "Truck #12 + shuttle",
    dispatchNotes: "On site 7:12 AM",
  },
  {
    moveId: "mv-ai-booked",
    jobDayId: "rolling-t-2",
    dayLabel: "Day 1",
    status: "in_progress",
    arrivalWindow: "9:00 – 11:00 AM",
    durationLabel: "~6 hrs",
    crewSummary: "3 movers · Crew D",
    truckSummary: "Box truck #8",
  },
  {
    moveId: "mv-booked",
    jobDayId: "rolling-t-3",
    dayLabel: "Pack day",
    status: "scheduled",
    arrivalWindow: "1:00 – 3:00 PM",
    durationLabel: "~4 hrs",
    crewSummary: "2 packers",
    truckSummary: "Cargo van",
  },
];

const TOMORROW_JOBS: RollingJobTemplate[] = [
  {
    moveId: "mv-ai-booked",
    jobDayId: "rolling-m-1",
    dayLabel: "Day 1",
    status: "scheduled",
    arrivalWindow: "8:00 – 10:00 AM",
    durationLabel: "~7 hrs",
    crewSummary: "4 movers · Crew D",
    truckSummary: "26 ft box",
  },
  {
    moveId: "mv-booked",
    jobDayId: "rolling-m-2",
    dayLabel: "Load day",
    status: "scheduled",
    arrivalWindow: "7:30 – 9:30 AM",
    durationLabel: "~8 hrs",
    crewSummary: "4 movers · Crew A",
    truckSummary: "Truck #12 + shuttle",
  },
];

/** Always-on demo rows anchored to yesterday / today / tomorrow. */
export function buildRollingOpsDemoJobDays(
  moves: MoveRecord[],
  today: Date = new Date(),
): OpsJobDayRow[] {
  const yesterdayKey = toDateKey(addDays(today, -1));
  const todayKey = toDateKey(today);
  const tomorrowKey = toDateKey(addDays(today, 1));
  const rows: OpsJobDayRow[] = [];

  function addTemplates(templates: RollingJobTemplate[], date: string) {
    for (const template of templates) {
      const move = moves.find((m) => m.id === template.moveId);
      if (!move) continue;
      rows.push(buildRow(move, template, date));
    }
  }

  addTemplates(YESTERDAY_JOBS, yesterdayKey);
  addTemplates(TODAY_JOBS, todayKey);
  addTemplates(TOMORROW_JOBS, tomorrowKey);

  return rows;
}

export function mergeRollingOpsDemoJobDays(
  rows: OpsJobDayRow[],
  moves: MoveRecord[],
  today: Date = new Date(),
): OpsJobDayRow[] {
  const existingIds = new Set(rows.map((r) => r.id));
  const demo = buildRollingOpsDemoJobDays(moves, today);
  const merged = [...rows];
  for (const row of demo) {
    if (!existingIds.has(row.id)) merged.push(row);
  }
  return merged;
}
