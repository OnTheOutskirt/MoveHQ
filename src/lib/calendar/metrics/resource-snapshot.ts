import {
  effectiveMoversBooked,
  effectiveTrucksBooked,
} from "@/lib/calendar/capacity";
import type { CalendarDayData } from "@/lib/calendar/types";
import type { CalendarResourceDataKey } from "./types";

export type ResourceDaySnapshot = {
  booked: number;
  capacity: number;
  onHold: number;
  remaining: number;
};

export function getResourceDaySnapshot(
  day: CalendarDayData,
  dataKey: CalendarResourceDataKey,
): ResourceDaySnapshot {
  switch (dataKey) {
    case "movers":
      return {
        booked: day.moversBooked,
        capacity: day.moversCapacity,
        onHold: day.moversOnHold,
        remaining: Math.max(0, day.moversCapacity - effectiveMoversBooked(day)),
      };
    case "trucks":
      return {
        booked: day.trucksBooked,
        capacity: day.trucksCapacity,
        onHold: day.trucksOnHold,
        remaining: Math.max(0, day.trucksCapacity - effectiveTrucksBooked(day)),
      };
    case "skippers":
      return {
        booked: 0,
        capacity: 0,
        onHold: 0,
        remaining: day.skippersLeft,
      };
    case "drivers":
      return {
        booked: 0,
        capacity: 0,
        onHold: 0,
        remaining: day.driversLeft,
      };
    case "extra_cab_trucks":
      return {
        booked: 0,
        capacity: 0,
        onHold: 0,
        remaining: day.extraCabsLeft,
      };
    case "f150s":
      return {
        booked: 0,
        capacity: 0,
        onHold: 0,
        remaining: day.f150Count,
      };
    default:
      return { booked: 0, capacity: 0, onHold: 0, remaining: 0 };
  }
}
