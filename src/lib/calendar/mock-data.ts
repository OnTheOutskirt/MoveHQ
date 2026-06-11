import { buildDayPipeline } from "./day-jobs-mock";
import { resolveMoveIdForCalendarLabel } from "./resolve-move-link";
import { daysFromToday, toDateKey } from "./date-utils";
import {
  DEFAULT_COMPANY_OPEN_DAYS,
  isCompanyOpenDay,
} from "@/lib/settings/business-calendar";
import type { WeekdayId } from "@/lib/operations/fleet-types";
import { applyMayActuals } from "./may-actuals";
import { applyClosedDays } from "./settings/apply-closed";
import type { ClosedDayEntry } from "./settings/types";
import { EMPTY_SALES } from "./sales-metrics";
import type {
  CalendarDayData,
  CrewMemberOff,
  DaySalesMetrics,
  FtaSlot,
  HoldEntry,
  WaitlistEntry,
} from "./types";

const MOVER_CAPACITY = 18;
const TRUCK_CAPACITY = 7;

const WAITLIST_CUSTOMERS = [
  "Anderson — Lakewood move",
  "Chen family move",
  "Peterson estate move",
  "Rivera condo move",
  "Walsh office move",
  "Nguyen townhouse move",
  "Foster duplex move",
];

const CREW_OFF_NAMES: { name: string; role: string }[] = [
  { name: "Marcus T.", role: "Skipper" },
  { name: "Devon Lee", role: "Driver" },
  { name: "Chris P.", role: "Mover" },
  { name: "Jordan Kim", role: "Mover" },
  { name: "Sam R.", role: "Driver" },
  { name: "Tyler Brooks", role: "Skipper" },
];

function seeded(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const FTA_OPTIONS: Omit<FtaSlot, "count">[] = [
  { crewSize: 2, period: "morning", duration: "short" },
  { crewSize: 2, period: "morning", duration: "brief" },
  { crewSize: 2, period: "morning", duration: "medium" },
  { crewSize: 2, period: "afternoon", duration: "short" },
  { crewSize: 2, period: "afternoon", duration: "brief" },
  { crewSize: 2, period: "afternoon", duration: "medium" },
  { crewSize: 3, period: "morning", duration: "short" },
  { crewSize: 3, period: "afternoon", duration: "brief" },
];

/** Usually 0 FTAs; occasionally 1–3 (one pill each). */
function buildFtas(seed: number): FtaSlot[] {
  const roll = seeded(seed + 99);
  let total: number;
  if (roll < 0.68) total = 0;
  else if (roll < 0.88) total = 1;
  else if (roll < 0.96) total = 2;
  else total = 3;

  if (total === 0) return [];

  const slots: FtaSlot[] = [];
  const used = new Set<number>();
  for (let i = 0; i < total; i++) {
    let idx = Math.floor(seeded(seed + 100 + i * 13) * FTA_OPTIONS.length);
    while (used.has(idx)) idx = (idx + 1) % FTA_OPTIONS.length;
    used.add(idx);
    slots.push({ ...FTA_OPTIONS[idx]!, count: 1 });
  }
  return slots;
}

function buildHolds(seed: number, moversOnHold: number, trucksOnHold: number): HoldEntry[] {
  if (moversOnHold === 0 && trucksOnHold === 0) return [];

  const entries: HoldEntry[] = [];
  let moversLeft = moversOnHold;
  let trucksLeft = trucksOnHold;
  let i = 0;

  while ((moversLeft > 0 || trucksLeft > 0) && i < 8) {
    const s = seed + i * 53;
    const movers =
      moversLeft > 0 ? Math.min(moversLeft, 1 + Math.floor(seeded(s) * Math.min(2, moversLeft))) : 0;
    const trucks =
      trucksLeft > 0 && seeded(s + 1) > 0.35
        ? Math.min(trucksLeft, 1 + Math.floor(seeded(s + 2) * Math.min(2, trucksLeft)))
        : 0;
    if (movers === 0 && trucks === 0) break;

    const customerName =
      WAITLIST_CUSTOMERS[Math.floor(seeded(s + 3) * WAITLIST_CUSTOMERS.length)]!;
    entries.push({
      id: `hold-${seed}-${i}`,
      customerName,
      movers,
      trucks,
      moveId: resolveMoveIdForCalendarLabel(customerName),
    });
    moversLeft -= movers;
    trucksLeft -= trucks;
    i++;
  }

  return entries;
}

function buildWaitlist(seed: number, count: number): WaitlistEntry[] {
  return Array.from({ length: count }, (_, i) => {
    const s = seed + i * 41;
    const customerName =
      WAITLIST_CUSTOMERS[Math.floor(seeded(s) * WAITLIST_CUSTOMERS.length)]!;
    return {
      id: `wl-${seed}-${i}`,
      customerName,
      movers: 2 + Math.floor(seeded(s + 1) * 5),
      trucks: 1 + Math.floor(seeded(s + 2) * 2),
      moveId: resolveMoveIdForCalendarLabel(customerName),
    };
  });
}

function buildSalesMetrics(seed: number, fill: number): DaySalesMetrics {
  const r = seeded(seed + 50);
  const totalLeads = Math.max(0, Math.floor(2 + fill * 14 + r * 10));
  const localRatio = 0.52 + seeded(seed + 51) * 0.28;
  const leadsLocal = Math.max(0, Math.floor(totalLeads * localRatio));
  const leadsLongDistance = Math.max(0, totalLeads - leadsLocal);
  const maxUnqualified = Math.min(totalLeads, Math.max(0, Math.floor(1 + r * 3)));
  const leadsUnqualified = Math.min(
    maxUnqualified,
    Math.floor(totalLeads * (0.05 + seeded(seed + 52) * 0.12)),
  );
  const leadsQualified = Math.max(0, totalLeads - leadsUnqualified);
  const proposalsSent = Math.max(
    0,
    Math.floor(
      leadsQualified * (0.58 + fill * 0.12) +
        leadsLocal * 0.08 +
        leadsLongDistance * 0.05 +
        r * 2,
    ),
  );
  const bookedJobs = Math.max(
    0,
    Math.min(proposalsSent, Math.floor(proposalsSent * (0.22 + fill * 0.38 + r * 0.12))),
  );
  return {
    leadsLocal,
    leadsLongDistance,
    leadsQualified,
    leadsUnqualified,
    proposalsSent,
    bookedJobs,
  };
}

function buildCrewOff(seed: number, fill: number): CrewMemberOff[] {
  if (fill < 0.55 || seeded(seed + 30) > 0.55) return [];
  const count = 1 + Math.floor(seeded(seed + 31) * 3);
  const used = new Set<number>();
  const list: CrewMemberOff[] = [];
  for (let i = 0; i < count; i++) {
    let idx = Math.floor(seeded(seed + 32 + i * 7) * CREW_OFF_NAMES.length);
    while (used.has(idx)) idx = (idx + 1) % CREW_OFF_NAMES.length;
    used.add(idx);
    const person = CREW_OFF_NAMES[idx]!;
    list.push({ id: `off-${seed}-${i}`, name: person.name, role: person.role });
  }
  return list;
}

/** 0 = empty, 1 = nearly full */
function bookingFill(offset: number, r: number): number {
  if (offset >= 28) return 0;
  if (offset < 0) return 0.5 + r * 0.22;
  if (offset <= 7) return 0.84 + r * 0.14;
  if (offset <= 14) {
    const t = (offset - 7) / 7;
    return 0.84 - t * 0.38 + r * 0.06;
  }
  if (offset <= 21) {
    const t = (offset - 14) / 7;
    return 0.46 - t * 0.34 + r * 0.06;
  }
  const t = (offset - 21) / 7;
  return Math.max(0, 0.12 - t * 0.12 + r * 0.04);
}


function emptyFutureDay(date: Date): CalendarDayData {
  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return {
    date: toDateKey(date),
    moversBooked: 0,
    moversOnHold: 0,
    moversCapacity: MOVER_CAPACITY,
    trucksBooked: 0,
    trucksOnHold: 0,
    trucksCapacity: TRUCK_CAPACITY,
    importantNotes: "",
    skippersLeft: 4,
    driversLeft: 5,
    extraCabsLeft: 3,
    f150Count: 1,
    waitlistCount: 0,
    waitlist: [],
    holds: [],
    crewOff: [],
    ftas: buildFtas(seed),
    isClosed: false,
    manuallyMarkedBooked: false,
    sales: EMPTY_SALES,
    pipeline: [],
  };
}

export function buildMockDay(
  date: Date,
  today: Date = new Date(),
  closedDays: ClosedDayEntry[] = [],
  federalHolidayBookedDates: string[] = [],
  openDays: WeekdayId[] = DEFAULT_COMPANY_OPEN_DAYS,
): CalendarDayData {
  const key = toDateKey(date);
  const offset = daysFromToday(date, today);

  if (!isCompanyOpenDay(date, openDays)) {
    return applyClosedDays(emptyFutureDay(date), closedDays, federalHolidayBookedDates);
  }

  if (offset >= 28) {
    return applyClosedDays(emptyFutureDay(date), closedDays, federalHolidayBookedDates);
  }

  const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  const r = seeded(seed);
  const fill = bookingFill(offset, r);

  let moversBooked = Math.floor(MOVER_CAPACITY * fill);
  let trucksBooked = Math.floor(TRUCK_CAPACITY * fill);
  let moversOnHold = 0;
  let trucksOnHold = 0;

  if (offset === 3) {
    moversBooked = 15;
    moversOnHold = 3;
    trucksBooked = 6;
    trucksOnHold = 1;
  } else if (offset >= 0 && offset <= 7 && seeded(seed + 19) > 0.72) {
    moversOnHold = 1 + Math.floor(seeded(seed + 20) * 2);
    trucksOnHold = seeded(seed + 21) > 0.65 ? 1 : 0;
    moversBooked = Math.min(moversBooked, MOVER_CAPACITY - moversOnHold);
    trucksBooked = Math.min(trucksBooked, TRUCK_CAPACITY - trucksOnHold);
  }

  const effectiveMovers = Math.min(MOVER_CAPACITY, moversBooked + moversOnHold);
  const effectiveTrucks = Math.min(TRUCK_CAPACITY, trucksBooked + trucksOnHold);
  const fullyBooked = effectiveMovers >= MOVER_CAPACITY && effectiveTrucks >= TRUCK_CAPACITY;
  const ftas = fullyBooked ? [] : buildFtas(seed);

  const notes: string[] = [];
  if (offset >= 0 && offset <= 10) {
    if (seeded(seed + 3) > 0.68) notes.push("2 large condos — confirm elevator");
    if (seeded(seed + 5) > 0.75) notes.push("PM crew lead: Marcus only");
    if (seeded(seed + 7) > 0.8) notes.push("Stadium event — avoid downtown before 11");
  }

  const stress = Math.min(1, fill * 1.15);
  const skippersLeft = Math.max(0, Math.min(4, Math.floor((1 - stress) * 4 + r * 0.4)));
  const driversLeft = Math.max(0, Math.min(5, Math.floor((1 - stress) * 5 + r * 0.5)));
  const extraCabsLeft = Math.max(0, Math.min(3, Math.floor((1 - fill * 0.9) * 3)));
  const f150Count = fill > 0.75 && seeded(seed + 11) > 0.55 ? 0 : 1;

  const waitlistCount =
    offset >= 0 && offset <= 9 && fill > 0.7 && seeded(seed + 13) > 0.55
      ? 1 + Math.floor(seeded(seed + 14) * 3)
      : 0;
  const waitlist = buildWaitlist(seed, waitlistCount);
  const holds = buildHolds(seed, moversOnHold, trucksOnHold);
  const crewOff = buildCrewOff(seed, fill);
  const sales = buildSalesMetrics(seed, fill);
  const pipeline = buildDayPipeline(seed, fill, ftas);

  const base: CalendarDayData = {
    date: key,
    moversBooked,
    moversOnHold,
    moversCapacity: MOVER_CAPACITY,
    trucksBooked,
    trucksOnHold,
    trucksCapacity: TRUCK_CAPACITY,
    importantNotes: notes.join(" · "),
    skippersLeft,
    driversLeft,
    extraCabsLeft,
    f150Count,
    waitlistCount,
    waitlist,
    holds,
    crewOff,
    ftas,
    isClosed: false,
    manuallyMarkedBooked: false,
    sales,
    pipeline,
  };

  return applyClosedDays(applyMayActuals(date, base), closedDays, federalHolidayBookedDates);
}

export function buildMockMonth(
  anchor: Date,
  today: Date = new Date(),
  closedDays: ClosedDayEntry[] = [],
  federalHolidayBookedDates: string[] = [],
  openDays: WeekdayId[] = DEFAULT_COMPANY_OPEN_DAYS,
): Record<string, CalendarDayData> {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const map: Record<string, CalendarDayData> = {};

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    map[toDateKey(date)] = buildMockDay(
      date,
      today,
      closedDays,
      federalHolidayBookedDates,
      openDays,
    );
  }

  return map;
}

export function getDayData(
  map: Record<string, CalendarDayData>,
  date: Date,
  today: Date = new Date(),
  closedDays: ClosedDayEntry[] = [],
  federalHolidayBookedDates: string[] = [],
  openDays: WeekdayId[] = DEFAULT_COMPANY_OPEN_DAYS,
): CalendarDayData {
  const key = toDateKey(date);
  return (
    map[key] ??
    buildMockDay(date, today, closedDays, federalHolidayBookedDates, openDays)
  );
}
