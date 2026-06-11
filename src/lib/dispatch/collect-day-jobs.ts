import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import type { FtaSlot } from "@/lib/calendar/types";
import { computeOpenSlotsForDay } from "@/lib/day-share/compute-open-slots";
import { defaultDayShareSettings } from "@/lib/day-share/settings-defaults";
import { resolveJobDayArrivalWindow } from "@/lib/day-share/arrival-windows";
import {
  ftaBookingCode,
  ftaBookingFromCalendarSlot,
  type DispatchFtaBooking,
} from "@/lib/dispatch/fta";
import { isMoveLost } from "@/lib/moves/move-pipeline";
import { isJobDayFirstStop, jobDaySharePeriod } from "@/lib/moves/job-day-schedule";
import type { JobDayFraction, MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { resolveDayBeforeConfirmation } from "./day-before-confirmation";
import { resolveDispatchScheduleBlock } from "./schedule-grid";
import type { DispatchDaySnapshot, DispatchJob } from "./types";
import type { DayShareSettings } from "@/lib/day-share/types";

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

function buildFtaBookingFromJobDay(day: MoveJobDay): DispatchFtaBooking | undefined {
  const fraction: JobDayFraction = day.dayFraction ?? "long";
  if (fraction === "long") return undefined;
  const period = jobDaySharePeriod(day);
  return {
    crewSize: day.crewSize ?? 4,
    period,
    morningStartTime: period === "morning" ? "7:45 AM" : null,
    duration: fraction,
  };
}

function jobDayOrdinal(move: MoveRecord, day: MoveJobDay): { dayNumber: number; totalJobDays: number } {
  const sorted = [...move.jobDays].sort((a, b) => a.date.localeCompare(b.date) || a.label.localeCompare(b.label));
  const index = sorted.findIndex((d) => d.id === day.id);
  return {
    dayNumber: index >= 0 ? index + 1 : 1,
    totalJobDays: sorted.length,
  };
}

export function jobDayToDispatchJob(move: MoveRecord, day: MoveJobDay, referenceDate: Date): DispatchJob {
  const id = `move:${move.id}:${day.id}`;
  const ftaBooking = buildFtaBookingFromJobDay(day);
  const isFtaJob = Boolean(ftaBooking);
  const { dayNumber, totalJobDays } = jobDayOrdinal(move, day);
  return {
    id,
    source: "move",
    moveId: move.id,
    jobDayId: day.id,
    customerName: move.customerName,
    date: day.date,
    label: day.label,
    status: day.status,
    arrivalWindow: resolveJobDayArrivalWindow({
      arrivalWindow: day.arrivalWindow,
      isFirstJobOfDay: isJobDayFirstStop(day),
      dayPeriod: day.dayPeriod,
    }),
    departureWindow: isJobDayFirstStop(day) ? day.departureWindow : undefined,
    durationLabel: day.durationLabel,
    originSummary: locationSummary(day, "origin") ?? move.originAddress,
    destinationSummary: locationSummary(day, "destination") ?? move.destinationAddress,
    crewSizeNeeded: day.crewSize ?? 4,
    trucksNeeded: day.truckCount ?? 1,
    dispatchNotes: day.dispatchNotes,
    accessNotes: day.accessNotes ?? day.notes,
    services: day.services,
    pinnedNote: pinNoteFromJobDay(day),
    ftaLabel: ftaBooking ? ftaBookingCode(ftaBooking) : null,
    ftaBooking,
    isFtaJob,
    dayFraction: day.dayFraction,
    dayNumber,
    totalJobDays,
    dayBeforeConfirmation: resolveDayBeforeConfirmation(day.date, {
      move,
      jobDayId: day.id,
      jobId: id,
      referenceDate,
    }),
  };
}

export function collectDispatchDay(
  moves: MoveRecord[],
  dateKey: string,
  today: Date = new Date(),
  dayShareSettings: DayShareSettings = defaultDayShareSettings(),
): DispatchDaySnapshot {
  const date = parseDateKey(dateKey);

  const fromMoves: DispatchJob[] = [];

  for (const move of moves) {
    if (isMoveLost(move)) continue;
    for (const day of move.jobDays) {
      if (day.date !== dateKey) continue;
      if (day.status === "cancelled") continue;
      fromMoves.push(jobDayToDispatchJob(move, day, today));
    }
  }

  const jobs = [...fromMoves].sort((a, b) => {
    const { startMinutes: aStart } = resolveDispatchScheduleBlock(a);
    const { startMinutes: bStart } = resolveDispatchScheduleBlock(b);
    return aStart - bStart || a.customerName.localeCompare(b.customerName);
  });

  const calendarDay = buildMockDay(date, today);
  const computedSlots = computeOpenSlotsForDay(moves, dateKey, dayShareSettings);
  const ftas: FtaSlot[] =
    computedSlots.length > 0 ? computedSlots : calendarDay.ftas;
  const ftaBookings = ftas.map(ftaBookingFromCalendarSlot);

  return {
    dateKey,
    jobs,
    ftas,
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
