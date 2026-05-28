import { buildMockDay } from "@/lib/calendar/mock-data";
import type { DayPipelineRow } from "@/lib/calendar/types";
import { parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import {
  ftaBookingFromCalendarSlot,
  parseFtaLabel,
} from "@/lib/dispatch/fta";
import { resolveDayBeforeConfirmation } from "./day-before-confirmation";
import type { DispatchDaySnapshot, DispatchJob } from "./types";

function locationSummary(day: MoveJobDay, role: "origin" | "destination"): string | undefined {
  const loc = day.locations?.find((l) => l.role === role);
  if (loc?.formattedAddress) return loc.formattedAddress;
  if (role === "origin" && day.originNote) return day.originNote;
  if (role === "destination" && day.destinationNote) return day.destinationNote;
  return undefined;
}

function pinNoteFromJobDay(day: MoveJobDay): string | undefined {
  const access = day.accessNotes?.trim();
  if (access && access.length <= 100) return access;
  const notes = day.notes?.trim();
  if (notes && notes.length <= 100) return notes;
  return undefined;
}

function jobDayToDispatchJob(move: MoveRecord, day: MoveJobDay, referenceDate: Date): DispatchJob {
  const id = `move:${move.id}:${day.id}`;
  return {
    id,
    source: "move",
    moveId: move.id,
    jobDayId: day.id,
    customerName: move.customerName,
    date: day.date,
    label: day.label,
    status: day.status,
    arrivalWindow: day.arrivalWindow,
    durationLabel: day.durationLabel,
    originSummary: locationSummary(day, "origin") ?? move.originAddress,
    destinationSummary: locationSummary(day, "destination") ?? move.destinationAddress,
    crewSizeNeeded: day.crewSize ?? 4,
    trucksNeeded: day.truckCount ?? 1,
    dispatchNotes: day.dispatchNotes,
    accessNotes: day.accessNotes ?? day.notes,
    services: day.services,
    pinnedNote: pinNoteFromJobDay(day),
    ftaLabel: null,
    isFtaJob: false,
    dayBeforeConfirmation: resolveDayBeforeConfirmation(day.date, {
      move,
      jobDayId: day.id,
      jobId: id,
      referenceDate,
    }),
  };
}

function pipelineRowToDispatchJob(
  row: DayPipelineRow,
  dateKey: string,
  referenceDate: Date,
): DispatchJob | null {
  if (row.stage !== "booked") return null;
  const ftaBooking = parseFtaLabel(row.fta) ?? undefined;
  const id = `cal:${dateKey}:${row.id}`;
  return {
    id,
    source: "calendar",
    moveId: row.moveId,
    customerName: row.personName,
    date: dateKey,
    label: "Booked job",
    status: "booked",
    crewSizeNeeded: row.movers,
    trucksNeeded: row.trucks,
    dispatchNotes: undefined,
    pinnedNote: row.fta ? "FTA booking — see slot details" : undefined,
    ftaLabel: row.fta,
    ftaBooking,
    isFtaJob: Boolean(row.fta || ftaBooking),
    dayBeforeConfirmation: resolveDayBeforeConfirmation(dateKey, {
      jobId: id,
      referenceDate,
    }),
  };
}

export function collectDispatchDay(
  moves: MoveRecord[],
  dateKey: string,
  today: Date = new Date(),
): DispatchDaySnapshot {
  const date = parseDateKey(dateKey);
  const calendarDay = buildMockDay(date, today);

  const fromMoves: DispatchJob[] = [];

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    for (const day of move.jobDays) {
      if (day.date !== dateKey) continue;
      if (day.status === "cancelled") continue;
      fromMoves.push(jobDayToDispatchJob(move, day, today));
    }
  }

  const fromCalendar: DispatchJob[] = [];
  for (const row of calendarDay.pipeline) {
    const job = pipelineRowToDispatchJob(row, dateKey, today);
    if (!job) continue;
    const duplicate =
      job.moveId &&
      fromMoves.some((j) => j.moveId === job.moveId && j.customerName === job.customerName);
    if (duplicate) continue;
    fromCalendar.push(job);
  }

  const jobs = [...fromMoves, ...fromCalendar].sort((a, b) => {
    const aw = a.arrivalWindow ?? "99:99";
    const bw = b.arrivalWindow ?? "99:99";
    return aw.localeCompare(bw) || a.customerName.localeCompare(b.customerName);
  });

  const ftaBookings = calendarDay.ftas.map(ftaBookingFromCalendarSlot);

  return {
    dateKey,
    jobs,
    ftas: calendarDay.ftas,
    ftaBookings,
    crewOffIds: [],
    crewOff: calendarDay.crewOff,
    importantNotes: calendarDay.importantNotes,
  };
}

export function tomorrowDateKey(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  return toDateKey(d);
}
