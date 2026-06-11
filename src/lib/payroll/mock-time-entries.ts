import { addDays, startOfWeekSunday, toDateKey } from "@/lib/calendar/date-utils";
import {
  billableHoursFromCategories,
  buildCurrentPayPeriods,
  normalizeTimeEntry,
} from "./time-entry-utils";
import type { PayPeriod, TimeEntry, TimeCategoryHours } from "./types";

export { buildRipplingPayrollRows, ripplingPayrollCsvContent } from "./rippling-export";

type DemoPerson = {
  personId: string;
  personName: string;
  workerType: TimeEntry["workerType"];
  roleLabel: string;
  hourlyRate: number | null;
};

const CREW: DemoPerson[] = [
  {
    personId: "crew-marcus",
    personName: "Marcus T.",
    workerType: "crew",
    roleLabel: "Skipper",
    hourlyRate: 22,
  },
  {
    personId: "crew-tyler",
    personName: "Tyler Brooks",
    workerType: "crew",
    roleLabel: "Skipper / Driver",
    hourlyRate: 21,
  },
  {
    personId: "crew-devon",
    personName: "Devon Lee",
    workerType: "crew",
    roleLabel: "Driver",
    hourlyRate: 19,
  },
  {
    personId: "crew-sam",
    personName: "Sam R.",
    workerType: "crew",
    roleLabel: "Mover",
    hourlyRate: 18,
  },
  {
    personId: "crew-pat",
    personName: "Pat Morrison",
    workerType: "crew",
    roleLabel: "Driver / Mover",
    hourlyRate: 19,
  },
];

const OFFICE: DemoPerson[] = [
  {
    personId: "office-alex",
    personName: "Alex Rivera",
    workerType: "office",
    roleLabel: "Sales · hourly",
    hourlyRate: 24,
  },
  {
    personId: "office-lisa",
    personName: "Lisa Parker",
    workerType: "office",
    roleLabel: "Operations · hourly",
    hourlyRate: 28,
  },
];

function crewEntry(
  person: DemoPerson,
  date: string,
  jobRef: string,
  categories: TimeCategoryHours,
  status: TimeEntry["status"],
  notes?: string,
): TimeEntry {
  return normalizeTimeEntry({
    id: `te-${person.personId}-${date}-${jobRef}`,
    personId: person.personId,
    personName: person.personName,
    workerType: person.workerType,
    roleLabel: person.roleLabel,
    date,
    jobRef,
    categories,
    hours: billableHoursFromCategories(categories),
    hourlyRate: person.hourlyRate,
    status,
    source: "crew_app",
    notes,
  });
}

function officeEntry(
  person: DemoPerson,
  date: string,
  categories: TimeCategoryHours,
  status: TimeEntry["status"],
  notes?: string,
): TimeEntry {
  return normalizeTimeEntry({
    id: `te-${person.personId}-${date}-office`,
    personId: person.personId,
    personName: person.personName,
    workerType: person.workerType,
    roleLabel: person.roleLabel,
    date,
    jobRef: null,
    categories,
    hours: billableHoursFromCategories(categories),
    hourlyRate: person.hourlyRate,
    status,
    source: "office_manual",
    notes,
  });
}

/** Demo time entries anchored to the current calendar week and yesterday/today. */
export function buildRollingMockTimeEntries(today = new Date()): TimeEntry[] {
  const weekStart = startOfWeekSunday(today);
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));

  const entries: TimeEntry[] = [];

  entries.push(
    crewEntry(CREW[0]!, yesterdayKey, "MV-DONE", { move: 4.5, drive: 1.25, extra: 0, office: 0, break: 0.5 }, "approved"),
    crewEntry(CREW[1]!, yesterdayKey, "MV-DONE", { move: 4.75, drive: 1.5, extra: 0.25, office: 0, break: 0.5 }, "approved"),
    crewEntry(CREW[2]!, yesterdayKey, "MV-COMPLETE-2D", { move: 5, drive: 2, extra: 0, office: 0, break: 0.5 }, "approved"),
    crewEntry(CREW[3]!, yesterdayKey, "MV-COMPLETE-2D", { move: 5.25, drive: 1.75, extra: 0, office: 0, break: 0.5 }, "approved"),
  );

  entries.push(
    crewEntry(CREW[0]!, todayKey, "MV-BOOKED", { move: 3.5, drive: 0.75, extra: 0, office: 0, break: 0.25 }, "pending"),
    crewEntry(CREW[1]!, todayKey, "MV-BOOKED", { move: 3.75, drive: 1, extra: 0.25, office: 0, break: 0.25 }, "pending"),
    crewEntry(
      CREW[2]!,
      todayKey,
      "MV-BOOKED",
      { move: 2.5, drive: 1.25, extra: 0, office: 0, break: 0.25 },
      "pending",
      "Clock-out looks early — verify with dispatch",
    ),
    crewEntry(CREW[4]!, todayKey, "MV-AI", { move: 2, drive: 0.5, extra: 0, office: 0, break: 0 }, "pending"),
    officeEntry(
      OFFICE[1]!,
      todayKey,
      { move: 0, drive: 0, extra: 0, office: 6.5, break: 0.5 },
      "pending",
      "Adjusted lunch break per timesheet",
    ),
  );

  for (let offset = 0; offset < 7; offset += 1) {
    const date = toDateKey(addDays(weekStart, offset));
    if (date >= todayKey) continue;
    if (date === yesterdayKey) continue;

    entries.push(
      crewEntry(CREW[3]!, date, "MV-BOOKED", { move: 5, drive: 1.5, extra: 0, office: 0, break: 0.5 }, "approved"),
    );
    if (offset % 2 === 0) {
      entries.push(
        crewEntry(CREW[4]!, date, "MV-AI", { move: 4.25, drive: 1.25, extra: 0.25, office: 0, break: 0.5 }, "approved"),
      );
    }
  }

  entries.push(
    officeEntry(
      OFFICE[0]!,
      yesterdayKey,
      { move: 0, drive: 0, extra: 0, office: 7.5, break: 0.5 },
      "approved",
    ),
  );

  return entries;
}

export const MOCK_TIME_ENTRIES = buildRollingMockTimeEntries();

export const PAY_PERIODS = buildCurrentPayPeriods();

export function entriesInPeriod(entries: TimeEntry[], period: PayPeriod): TimeEntry[] {
  return entries.filter((e) => e.date >= period.start && e.date <= period.end);
}

export function payPeriodsForToday(today = new Date()): PayPeriod[] {
  return buildCurrentPayPeriods(today);
}
