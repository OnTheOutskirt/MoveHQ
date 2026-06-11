import { isMoveLost } from "@/lib/moves/move-pipeline";
import { jobDaySharePeriod } from "@/lib/moves/job-day-schedule";
import type { MoveJobDay, MoveRecord } from "@/lib/moves/types";
import { complementarySlots } from "./complement";
import { crewSizeAllowsDayShare } from "./settings-defaults";
import type {
  DayShareBooking,
  DayShareFraction,
  DaySharePeriod,
  DayShareSettings,
  DayShareSlot,
} from "./types";
import { isFullDayFraction } from "./units";

function inferPeriodFromJobDay(day: MoveJobDay): DaySharePeriod {
  return jobDaySharePeriod(day);
}

export function collectDayShareBookingsFromMoves(
  moves: MoveRecord[],
  dateKey: string,
  settings: DayShareSettings,
): DayShareBooking[] {
  const bookings: DayShareBooking[] = [];
  for (const move of moves) {
    if (isMoveLost(move)) continue;
    for (const day of move.jobDays) {
      if (day.date !== dateKey || day.status === "cancelled") continue;
      const fraction: DayShareFraction = day.dayFraction ?? "long";
      if (isFullDayFraction(fraction)) continue;
      const crewSize = day.crewSize ?? 4;
      if (!crewSizeAllowsDayShare(crewSize, settings)) continue;
      bookings.push({
        crewSize,
        period: inferPeriodFromJobDay(day),
        fraction,
        moveId: move.id,
        jobDayId: day.id,
        customerName: move.customerName,
      });
    }
  }
  return bookings;
}

function slotKey(slot: DayShareSlot): string {
  return `${slot.crewSize}:${slot.period}:${slot.duration}`;
}

function mergeSlots(slots: DayShareSlot[]): DayShareSlot[] {
  const map = new Map<string, DayShareSlot>();
  for (const slot of slots) {
    const key = slotKey(slot);
    const existing = map.get(key);
    if (existing) {
      existing.count += slot.count;
    } else {
      map.set(key, { ...slot });
    }
  }
  return [...map.values()].sort(
    (a, b) =>
      a.crewSize - b.crewSize ||
      a.period.localeCompare(b.period) ||
      a.duration.localeCompare(b.duration),
  );
}

export function computeOpenSlotsFromBookings(bookings: DayShareBooking[]): DayShareSlot[] {
  const needed: DayShareSlot[] = [];
  for (const booking of bookings) {
    if (isFullDayFraction(booking.fraction)) continue;
    needed.push(
      ...complementarySlots(
        booking.crewSize,
        booking.period,
        booking.fraction as Exclude<DayShareFraction, "long">,
      ),
    );
  }
  return mergeSlots(needed);
}

export function computeOpenSlotsForDay(
  moves: MoveRecord[],
  dateKey: string,
  settings: DayShareSettings,
): DayShareSlot[] {
  const bookings = collectDayShareBookingsFromMoves(moves, dateKey, settings);
  return computeOpenSlotsFromBookings(bookings);
}
