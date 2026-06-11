import { toDateKey } from "./date-utils";
import type { CalendarDayData, CrewMemberOff, FtaSlot, HoldEntry, WaitlistEntry } from "./types";

type MayDaySpec = {
  moversBooked: number;
  moversCapacity: number;
  trucksBooked: number;
  trucksCapacity: number;
  skippersLeft: number;
  driversLeft: number;
  extraCabsLeft: number;
  f150Count: number;
  ftas?: FtaSlot[];
  moversOnHold?: number;
  trucksOnHold?: number;
  crewOff?: CrewMemberOff[];
  waitlist?: WaitlistEntry[];
  holds?: HoldEntry[];
};

/**
 * User-provided May capacity snapshot (calendar month index 4 = May).
 * Applies to these dates every year in mock data.
 */
const MAY_DAY_SPECS: Record<number, MayDaySpec> = {
  19: {
    moversBooked: 18,
    moversCapacity: 18,
    trucksBooked: 6,
    trucksCapacity: 6,
    skippersLeft: 2,
    driversLeft: 2,
    extraCabsLeft: 2,
    f150Count: 1,
    ftas: [{ count: 1, crewSize: 2, period: "afternoon", duration: "short" }],
  },
  20: {
    moversBooked: 16,
    moversCapacity: 20,
    trucksBooked: 6,
    trucksCapacity: 7,
    skippersLeft: 4,
    driversLeft: 4,
    extraCabsLeft: 1,
    f150Count: 1,
    ftas: [],
  },
  21: {
    moversBooked: 16,
    moversCapacity: 16,
    trucksBooked: 5,
    trucksCapacity: 7,
    skippersLeft: 3,
    driversLeft: 2,
    extraCabsLeft: 1,
    f150Count: 1,
    ftas: [{ count: 1, crewSize: 3, period: "morning", duration: "brief" }],
  },
  22: {
    moversBooked: 21,
    moversCapacity: 19,
    trucksBooked: 7,
    trucksCapacity: 7,
    skippersLeft: 3,
    driversLeft: 3,
    extraCabsLeft: 0,
    f150Count: 1,
    ftas: [],
  },
  23: {
    moversBooked: 7,
    moversCapacity: 7,
    trucksBooked: 3,
    trucksCapacity: 6,
    skippersLeft: 0,
    driversLeft: 0,
    extraCabsLeft: 2,
    f150Count: 1,
    ftas: [],
  },
  26: {
    moversBooked: 22,
    moversCapacity: 22,
    trucksBooked: 8,
    trucksCapacity: 8,
    skippersLeft: 2,
    driversLeft: 1,
    extraCabsLeft: 1,
    f150Count: 0,
    ftas: [{ count: 1, crewSize: 2, period: "afternoon", duration: "brief" }],
  },
  27: {
    moversBooked: 22,
    moversCapacity: 22,
    moversOnHold: 2,
    trucksBooked: 6,
    trucksCapacity: 7,
    trucksOnHold: 1,
    skippersLeft: 2,
    driversLeft: 1,
    extraCabsLeft: 1,
    f150Count: 0,
    ftas: [],
    crewOff: [
      { id: "off-may-27-juan", name: "Juan Martinez", role: "Driver" },
      { id: "off-may-27-marcus", name: "Marcus T.", role: "Skipper" },
      { id: "off-may-27-chris", name: "Chris P.", role: "Mover" },
    ],
    holds: [
      {
        id: "hold-may-27-1",
        customerName: "Walsh office move",
        movers: 2,
        trucks: 1,
        moveId: "mv-quote-sent",
      },
    ],
    waitlist: [
      {
        id: "wl-may-27-1",
        customerName: "Peterson estate move",
        movers: 3,
        trucks: 1,
        moveId: "mv-waiting-walkthrough",
      },
    ],
  },
  28: {
    moversBooked: 19,
    moversCapacity: 18,
    trucksBooked: 8,
    trucksCapacity: 8,
    skippersLeft: 2,
    driversLeft: 0,
    extraCabsLeft: 1,
    f150Count: 1,
    ftas: [{ count: 1, crewSize: 3, period: "afternoon", duration: "brief" }],
  },
  29: {
    moversBooked: 20,
    moversCapacity: 21,
    trucksBooked: 9,
    trucksCapacity: 9,
    skippersLeft: 2,
    driversLeft: 0,
    extraCabsLeft: 2,
    f150Count: 1,
    ftas: [],
  },
  30: {
    moversBooked: 8,
    moversCapacity: 10,
    trucksBooked: 4,
    trucksCapacity: 6,
    skippersLeft: 0,
    driversLeft: 0,
    extraCabsLeft: 2,
    f150Count: 1,
    ftas: [],
  },
};

export function isMayActualDay(date: Date): boolean {
  return date.getMonth() === 4 && date.getDate() in MAY_DAY_SPECS;
}

export function applyMayActuals(date: Date, day: CalendarDayData): CalendarDayData {
  if (date.getMonth() !== 4) return day;

  const spec = MAY_DAY_SPECS[date.getDate()];
  if (!spec) return day;

  const next: CalendarDayData = {
    ...day,
    date: toDateKey(date),
    moversBooked: spec.moversBooked,
    moversCapacity: spec.moversCapacity,
    trucksBooked: spec.trucksBooked,
    trucksCapacity: spec.trucksCapacity,
    skippersLeft: spec.skippersLeft,
    driversLeft: spec.driversLeft,
    extraCabsLeft: spec.extraCabsLeft,
    f150Count: spec.f150Count,
    manuallyMarkedBooked: day.manuallyMarkedBooked,
    sales: day.sales,
  };

  next.moversOnHold = spec.moversOnHold ?? 0;
  next.trucksOnHold = spec.trucksOnHold ?? 0;
  next.ftas = spec.ftas ?? [];
  next.crewOff = spec.crewOff ?? [];
  if (spec.waitlist !== undefined) {
    next.waitlist = spec.waitlist;
    next.waitlistCount = spec.waitlist.length;
  } else {
    next.waitlist = [];
    next.waitlistCount = 0;
  }
  next.holds = spec.holds ?? [];

  return next;
}
