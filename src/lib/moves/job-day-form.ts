import { isPreBookPipelineStage } from "./job-days-plan";
import {
  defaultLocationsForNewDay,
  resolveJobDayLocations,
  syncLegacyLocationNotes,
} from "./job-day-locations";
import type { JobDayLocation, JobDayService, MoveJobDay, MoveRecord } from "./types";

/** Soft cap for job days per move (UI); can be raised later. */
export const MAX_JOB_DAYS_PER_MOVE = 10;

export const NEW_JOB_DAY_PREFIX = "__new__";

export function isNewJobDayKey(key: string): boolean {
  return key.startsWith(NEW_JOB_DAY_PREFIX);
}

export function createNewJobDayKey(): string {
  return `${NEW_JOB_DAY_PREFIX}${Date.now()}`;
}

export const JOB_DAY_SERVICE_OPTIONS: { id: JobDayService; label: string }[] = [
  { id: "packing", label: "Packing" },
  { id: "loading", label: "Loading" },
  { id: "moving", label: "Moving" },
  { id: "unloading", label: "Unloading" },
  { id: "unpacking", label: "Unpacking" },
  { id: "junk_removal", label: "Junk removal" },
];

export type JobDayFormValues = {
  date: string;
  services: JobDayService[];
  locations: JobDayLocation[];
  crewSize: string;
  truckCount: string;
  hoursEstimated: string;
};

function nextCalendarDay(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Form values for duplicating a job day — copies settings/locations; date defaults to day after source. */
export function duplicateJobDayFormValues(source: MoveJobDay): JobDayFormValues {
  const base = jobDayToFormValues(source);
  return {
    ...base,
    date: source.date ? nextCalendarDay(source.date) : "",
    locations: base.locations.map((loc) => ({
      ...loc,
      id: `loc-${loc.role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
  };
}

export function jobDayToFormValues(day: MoveJobDay): JobDayFormValues {
  const truckCount =
    day.truckCount ??
    (day.truckSummary?.match(/(\d+)/)?.[1] ? parseInt(day.truckSummary.match(/(\d+)/)![1]!, 10) : undefined);

  return {
    date: day.date,
    services: day.services ?? [],
    locations: resolveJobDayLocations(day),
    crewSize: day.crewSize != null ? String(day.crewSize) : "",
    truckCount: truckCount != null ? String(truckCount) : "",
    hoursEstimated: day.hoursEstimated != null ? String(day.hoursEstimated) : "",
  };
}

function latestIsoDate(dates: string[]): string | undefined {
  const valid = dates.filter((d) => d.trim().length > 0);
  if (valid.length === 0) return undefined;
  return [...valid].sort((a, b) => new Date(a).getTime() - new Date(b).getTime()).at(-1);
}

function dayAfter(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function defaultDayDate(move: MoveRecord, extraDates: string[] = []): string {
  const last = latestIsoDate([...move.jobDays.map((d) => d.date), ...extraDates]);
  if (last) return dayAfter(last);
  const base = move.intake.moveDate || move.preferredDate;
  if (!base) return "";
  return base;
}

/** Default form values for another unsaved day in the editor. */
export function createDefaultJobDayFormValues(
  move: MoveRecord,
  extraDates: string[] = [],
): JobDayFormValues {
  const day = createDefaultJobDay(move, extraDates);
  return jobDayToFormValues(day);
}

/** Auto title — day number only (services shown on the card separately). */
export function generateJobDayLabel(dayIndex: number): string {
  return `Day ${dayIndex + 1}`;
}

/** Day number (0-based) from chronological order by date, including the given date. */
export function jobDayIndexForDate(
  move: MoveRecord,
  date: string,
  existingId?: string,
): number {
  const others = move.jobDays.filter((d) => d.id !== existingId);
  const dates = [...others.map((d) => d.date), date]
    .filter((d) => d.trim().length > 0)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const i = dates.indexOf(date);
  return i >= 0 ? i : dates.length;
}

function defaultServicesForDay(move: MoveRecord, index: number): JobDayService[] {
  if (index === 0 && move.intake.packingService !== "none") {
    return ["packing", "loading"];
  }
  return ["moving", "unloading"];
}

/** First job day when a move is created — uses intake move date, locations, and defaults. */
export function createInitialJobDayFromIntake(move: MoveRecord): MoveJobDay {
  return createDefaultJobDay({ ...move, jobDays: [] });
}

export function createDefaultJobDay(move: MoveRecord, extraDates: string[] = []): MoveJobDay {
  const date = defaultDayDate(move, extraDates);
  const index = jobDayIndexForDate(move, date);
  const services = defaultServicesForDay(move, index);
  const crewSize = move.moveType === "Commercial" ? 6 : 4;
  const proposed = isPreBookPipelineStage(move.pipelineStage);
  const label = generateJobDayLabel(index);

  const base: MoveJobDay = {
    id: `jd-${move.id}-${Date.now()}`,
    label,
    date,
    status: proposed ? "proposed" : "scheduled",
    services,
    locations: defaultLocationsForNewDay(move),
    crewSize,
    truckCount: 1,
    hoursEstimated: 8,
  };

  return { ...base, ...syncLegacyLocationNotes(base) };
}

function parsePositiveInt(value: string): number | undefined {
  const n = parseInt(value.trim(), 10);
  if (Number.isNaN(n) || n < 0) return undefined;
  return n;
}

function parseHours(value: string): number | undefined {
  const n = parseFloat(value.trim());
  if (Number.isNaN(n) || n < 0) return undefined;
  return n;
}

export function formValuesToJobDay(
  values: JobDayFormValues,
  move: MoveRecord,
  existing?: MoveJobDay,
): MoveJobDay {
  const crewSize = parsePositiveInt(values.crewSize);
  const truckCount = parsePositiveInt(values.truckCount);
  const hours = parseHours(values.hoursEstimated);
  const services: JobDayService[] =
    values.services.length > 0 ? values.services : (["moving"] as JobDayService[]);

  const index = jobDayIndexForDate(move, values.date, existing?.id);

  const proposed = isPreBookPipelineStage(move.pipelineStage);
  const status = existing?.status ?? (proposed ? "proposed" : "scheduled");

  const crewSummary =
    crewSize != null ? `${crewSize} mover${crewSize === 1 ? "" : "s"}` : undefined;
  const truckSummary =
    truckCount != null
      ? `${truckCount} truck${truckCount === 1 ? "" : "s"}`
      : undefined;

  const draft: MoveJobDay = {
    id: existing?.id ?? `jd-${Date.now()}`,
    label: generateJobDayLabel(index),
    date: values.date,
    status,
    services,
    locations: values.locations,
    crewSize,
    crewSummary,
    truckCount,
    truckSummary,
    hoursEstimated: hours,
    hoursActual: existing?.hoursActual,
    arrivalWindow: existing?.arrivalWindow,
    durationLabel: existing?.durationLabel,
    dispatchNotes: existing?.dispatchNotes,
    accessNotes: existing?.accessNotes,
  };

  return { ...draft, ...syncLegacyLocationNotes(draft) };
}

export function getSortedJobDays(move: MoveRecord): MoveJobDay[] {
  return [...move.jobDays].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

/** Re-sort by date and assign Day 1, Day 2, … labels. */
export function relabelJobDaysByDate(jobDays: MoveJobDay[]): MoveJobDay[] {
  return [...jobDays]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((day, index) => ({
      ...day,
      label: generateJobDayLabel(index),
    }));
}
