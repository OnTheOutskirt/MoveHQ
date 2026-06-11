import { isPreBookPipelineStage } from "./job-days-plan";
import {
  defaultLocationsForNewDay,
  resolveJobDayLocations,
  syncLegacyLocationNotes,
} from "./job-day-locations";
import { FLEXIBLE_ARRIVAL_WINDOW } from "@/lib/day-share/arrival-windows";
import { defaultCrewDepartureLabel } from "@/lib/moves/crew-departure";
import {
  arrivalWindowsEquivalent,
  computeJobDayArrivalWindow,
} from "@/lib/moves/job-day-arrival";
import type { DefaultsSettings } from "@/lib/settings/types";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { fractionLabel } from "@/lib/day-share/labels";
import { isJobDayFirstStop, jobDaySharePeriod } from "./job-day-schedule";
import type {
  JobDayFraction,
  JobDayLocation,
  JobDayService,
  MoveJobDay,
  MoveRecord,
} from "./types";

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

export const JOB_DAY_FRACTION_OPTIONS: { id: JobDayFraction; label: string }[] = [
  { id: "long", label: "Long (full day)" },
  { id: "medium", label: "Medium (⅔ day)" },
  { id: "short", label: "Short (½ day)" },
  { id: "brief", label: "Brief (⅓ day)" },
];

/** Follow-on jobs share the crew — cannot block a full day. */
export const DEFAULT_FOLLOW_ON_DAY_FRACTION: JobDayFraction = "medium";

export function jobDayFractionOptionsForSchedule(
  isFirstJobOfDay: boolean,
): typeof JOB_DAY_FRACTION_OPTIONS {
  if (isFirstJobOfDay) return JOB_DAY_FRACTION_OPTIONS;
  return JOB_DAY_FRACTION_OPTIONS.filter((opt) => opt.id !== "long");
}

export function coerceFollowOnDayFraction(
  dayFraction: JobDayFraction,
  isFirstJobOfDay: boolean,
): JobDayFraction {
  if (isFirstJobOfDay || dayFraction !== "long") return dayFraction;
  return DEFAULT_FOLLOW_ON_DAY_FRACTION;
}

export type JobDayFormValues = {
  date: string;
  services: JobDayService[];
  locations: JobDayLocation[];
  crewSize: string;
  truckCount: string;
  hoursEstimated: string;
  dayFraction: JobDayFraction;
  /** Crew's first stop that day — shop departure + calculated morning arrival. */
  isFirstJobOfDay: boolean;
  /** Crew shop departure — display label (e.g. "7:15 AM"). */
  departureWindow: string;
  /** Customer-facing arrival window for this job day. */
  arrivalWindow: string;
  /** When false, arrival is recalculated from departure and drive time (or 11–4 for follow-on). */
  arrivalWindowManual: boolean;
};

export type JobDayDefaultsContext = {
  defaults?: Pick<
    DefaultsSettings,
    | "defaultCrewDepartureTime"
    | "defaultCustomerArrivalWindowMinutes"
    | "defaultDepotToJobDriveMinutes"
    | "defaultFollowOnArrivalStartTime"
    | "defaultFollowOnArrivalEndTime"
  >;
  depot?: Pick<WorkspaceLocation, "addressLine1" | "city" | "state" | "zip">;
};

export type JobDayFormContext = JobDayDefaultsContext & {
  move: MoveRecord;
};

export function resolveComputedArrivalWindow(
  values: Pick<
    JobDayFormValues,
    "isFirstJobOfDay" | "departureWindow" | "locations"
  >,
  move: MoveRecord,
  context: JobDayDefaultsContext = {},
): string {
  return computeJobDayArrivalWindow({
    isFirstJobOfDay: values.isFirstJobOfDay,
    departureWindow: values.departureWindow,
    locations: values.locations,
    move,
    depot: context.depot,
    defaults: context.defaults,
  });
}

function nextCalendarDay(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** Form values for duplicating a job day — copies settings/locations; date defaults to day after source. */
export function duplicateJobDayFormValues(
  source: MoveJobDay,
  context?: JobDayFormContext,
): JobDayFormValues {
  const base = jobDayToFormValues(source, context);
  return {
    ...base,
    date: source.date ? nextCalendarDay(source.date) : "",
    locations: base.locations.map((loc) => ({
      ...loc,
      id: `loc-${loc.role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    })),
  };
}

export function jobDayToFormValues(
  day: MoveJobDay,
  context?: JobDayFormContext,
): JobDayFormValues {
  const truckCount =
    day.truckCount ??
    (day.truckSummary?.match(/(\d+)/)?.[1] ? parseInt(day.truckSummary.match(/(\d+)/)![1]!, 10) : undefined);

  const isFirstJobOfDay = isJobDayFirstStop(day);
  const dayFraction = coerceFollowOnDayFraction(day.dayFraction ?? "long", isFirstJobOfDay);
  const locations = resolveJobDayLocations(day);
  const departureWindow = isFirstJobOfDay
    ? day.departureWindow ?? defaultCrewDepartureLabel(context?.defaults)
    : "";

  const baseValues: JobDayFormValues = {
    date: day.date,
    services: day.services ?? [],
    locations,
    crewSize: day.crewSize != null ? String(day.crewSize) : "",
    truckCount: truckCount != null ? String(truckCount) : "",
    hoursEstimated: day.hoursEstimated != null ? String(day.hoursEstimated) : "",
    dayFraction,
    isFirstJobOfDay,
    departureWindow,
    arrivalWindow: day.arrivalWindow?.trim() ?? "",
    arrivalWindowManual: false,
  };

  if (!context?.move) {
    return {
      ...baseValues,
      arrivalWindow:
        baseValues.arrivalWindow ||
        (isFirstJobOfDay ? "8:00 – 8:30 AM" : FLEXIBLE_ARRIVAL_WINDOW),
    };
  }

  const computed = resolveComputedArrivalWindow(baseValues, context.move, context);
  const stored = baseValues.arrivalWindow;
  const arrivalWindowManual =
    stored.length > 0 && !arrivalWindowsEquivalent(stored, computed);

  return {
    ...baseValues,
    arrivalWindow: arrivalWindowManual ? stored : computed,
    arrivalWindowManual,
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
  context: JobDayDefaultsContext = {},
): JobDayFormValues {
  const day = createDefaultJobDay(move, extraDates, context);
  return jobDayToFormValues(day, { move, ...context });
}

/** Auto title — day number only (services shown on the card separately). */
export function generateJobDayLabel(dayIndex: number): string {
  return `Day ${dayIndex + 1}`;
}

export type JobDayEditorDateEntry = {
  key: string;
  date: string;
};

function sortJobDayEditorEntries(
  entries: JobDayEditorDateEntry[],
): JobDayEditorDateEntry[] {
  return [...entries].sort((a, b) => {
    const aDate = a.date.trim();
    const bDate = b.date.trim();
    if (aDate && bDate) {
      const diff = new Date(aDate).getTime() - new Date(bDate).getTime();
      if (diff !== 0) return diff;
    } else if (aDate) {
      return -1;
    } else if (bDate) {
      return 1;
    }
    return a.key.localeCompare(b.key);
  });
}

/** Day labels for all tabs in the job day editor — ordered by date (drafts included). */
export function buildJobDaySwitcherLabels(
  entries: JobDayEditorDateEntry[],
): Map<string, string> {
  const sorted = sortJobDayEditorEntries(entries);
  const map = new Map<string, string>();
  sorted.forEach((entry, index) => {
    map.set(entry.key, generateJobDayLabel(index));
  });
  return map;
}

/** 0-based day index among editor entries (saved + unsaved), ordered by date. */
export function jobDayIndexAmongEditorEntries(
  selfKey: string,
  entries: JobDayEditorDateEntry[],
): number {
  const sorted = sortJobDayEditorEntries(entries);
  const index = sorted.findIndex((entry) => entry.key === selfKey);
  return index >= 0 ? index : sorted.length;
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
export function createInitialJobDayFromIntake(
  move: MoveRecord,
  context: JobDayDefaultsContext = {},
): MoveJobDay {
  return createDefaultJobDay({ ...move, jobDays: [] }, [], context);
}

export function createDefaultJobDay(
  move: MoveRecord,
  extraDates: string[] = [],
  context: JobDayDefaultsContext = {},
): MoveJobDay {
  const date = defaultDayDate(move, extraDates);
  const index = jobDayIndexForDate(move, date);
  const services = defaultServicesForDay(move, index);
  const crewSize = move.moveType === "Commercial" ? 6 : 4;
  const proposed = isPreBookPipelineStage(move.pipelineStage);
  const label = generateJobDayLabel(index);

  const locations = defaultLocationsForNewDay(move);
  const departureWindow = defaultCrewDepartureLabel(context.defaults);
  const arrivalWindow = computeJobDayArrivalWindow({
    isFirstJobOfDay: true,
    departureWindow,
    locations,
    move,
    depot: context.depot,
    defaults: context.defaults,
  });

  const base: MoveJobDay = {
    id: `jd-${move.id}-${Date.now()}`,
    label,
    date,
    status: proposed ? "proposed" : "scheduled",
    services,
    locations,
    crewSize,
    truckCount: 1,
    hoursEstimated: 8,
    dayFraction: "long",
    isFirstJobOfDay: true,
    dayPeriod: "morning",
    arrivalWindow,
    departureWindow,
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

  const isFirstJobOfDay = values.isFirstJobOfDay;
  const dayFraction = coerceFollowOnDayFraction(values.dayFraction, isFirstJobOfDay);
  const dayPeriod = jobDaySharePeriod({ isFirstJobOfDay, dayPeriod: existing?.dayPeriod });
  const arrivalWindow = values.arrivalWindow.trim()
    ? values.arrivalWindow.trim()
    : resolveComputedArrivalWindow(values, move);
  const departureWindow = isFirstJobOfDay
    ? values.departureWindow.trim() ||
      existing?.departureWindow ||
      defaultCrewDepartureLabel()
    : undefined;
  const durationLabel =
    dayFraction === "long" ? existing?.durationLabel : fractionLabel(dayFraction);

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
    dayFraction,
    isFirstJobOfDay,
    dayPeriod,
    arrivalWindow,
    departureWindow,
    durationLabel,
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
