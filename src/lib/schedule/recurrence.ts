import type { StaffCalendarEvent } from "./types";

export type RecurrenceRangeType = "noEnd" | "endDate" | "numbered";

export type RecurrenceOrdinal = "first" | "second" | "third" | "fourth" | "last";

export type RecurrenceWeekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export const RECURRENCE_WEEKDAYS: RecurrenceWeekday[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const RECURRENCE_WEEKDAY_SHORT: Record<RecurrenceWeekday, string> = {
  sunday: "Sun",
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
};

export type RecurrencePatternType =
  | "daily"
  | "weekly"
  | "absoluteMonthly"
  | "relativeMonthly"
  | "absoluteYearly"
  | "relativeYearly";

/** Microsoft Graph–aligned recurrence pattern. */
export type StaffCalendarRecurrencePattern = {
  type: RecurrencePatternType;
  interval: number;
  daysOfWeek?: RecurrenceWeekday[];
  dayOfMonth?: number;
  ordinal?: RecurrenceOrdinal;
  weekday?: RecurrenceWeekday;
  month?: number;
};

export type StaffCalendarRecurrenceRange = {
  type: RecurrenceRangeType;
  endDate?: string;
  occurrenceCount?: number;
};

export type StaffCalendarRecurrence = {
  label: string;
  pattern: StaffCalendarRecurrencePattern;
  range: StaffCalendarRecurrenceRange;
  /** Series anchor (Graph `range.startDate`). */
  startDate: string;
};

/** @deprecated Legacy shape — normalized on read. */
export type LegacyStaffCalendarRecurrence = {
  label: string;
  frequency: "daily" | "weekly" | "monthly";
};

export type RecurrenceFormMode = "none" | "daily" | "weekly" | "monthly" | "yearly";

export type RecurrenceFormValue = {
  mode: RecurrenceFormMode;
  interval: number;
  weeklyDays: RecurrenceWeekday[];
  monthlyStyle: "date" | "ordinal";
  yearlyStyle: "date" | "ordinal";
  endType: RecurrenceRangeType;
  endDate: string;
  occurrenceCount: number;
};

function dateFromKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function weekdayFromDateKey(dateKey: string): RecurrenceWeekday {
  return RECURRENCE_WEEKDAYS[dateFromKey(dateKey).getDay()];
}

export function ordinalFromDate(date: Date): RecurrenceOrdinal {
  const weekday = date.getDay();
  const day = date.getDate();
  const ordinal = Math.ceil(day / 7);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const isLast =
    day + 7 > lastDay ||
    new Date(date.getFullYear(), date.getMonth(), day + 7).getDay() !== weekday;
  if (isLast) return "last";
  return (["first", "second", "third", "fourth"] as const)[ordinal - 1] ?? "fourth";
}

const ORDINAL_LABELS: Record<RecurrenceOrdinal, string> = {
  first: "first",
  second: "second",
  third: "third",
  fourth: "fourth",
  last: "last",
};

function weekdayLabel(day: RecurrenceWeekday): string {
  return day.charAt(0).toUpperCase() + day.slice(1);
}

function monthLabel(month: number): string {
  return new Date(2000, month - 1, 15).toLocaleDateString("en-US", { month: "long" });
}

export function buildRecurrenceLabel(
  pattern: StaffCalendarRecurrencePattern,
  anchorDateKey: string,
): string {
  const anchor = dateFromKey(anchorDateKey);
  const interval = Math.max(1, pattern.interval);

  switch (pattern.type) {
    case "daily":
      return interval === 1 ? "Daily" : `Every ${interval} days`;
    case "weekly": {
      const days = pattern.daysOfWeek?.length
        ? pattern.daysOfWeek.map((d) => weekdayLabel(d))
        : [weekdayLabel(weekdayFromDateKey(anchorDateKey))];
      const dayList =
        days.length === 1 ? days[0] : days.length === 2 ? `${days[0]} and ${days[1]}` : `${days.slice(0, -1).join(", ")}, and ${days[days.length - 1]}`;
      return interval === 1 ? `Weekly on ${dayList}` : `Every ${interval} weeks on ${dayList}`;
    }
    case "absoluteMonthly": {
      const dom = pattern.dayOfMonth ?? anchor.getDate();
      return interval === 1
        ? `Monthly on day ${dom}`
        : `Every ${interval} months on day ${dom}`;
    }
    case "relativeMonthly": {
      const ord = pattern.ordinal ?? ordinalFromDate(anchor);
      const wd = pattern.weekday ?? weekdayFromDateKey(anchorDateKey);
      return interval === 1
        ? `Monthly on the ${ORDINAL_LABELS[ord]} ${weekdayLabel(wd)}`
        : `Every ${interval} months on the ${ORDINAL_LABELS[ord]} ${weekdayLabel(wd)}`;
    }
    case "absoluteYearly": {
      const m = pattern.month ?? anchor.getMonth() + 1;
      const dom = pattern.dayOfMonth ?? anchor.getDate();
      return `Yearly on ${monthLabel(m)} ${dom}`;
    }
    case "relativeYearly": {
      const m = pattern.month ?? anchor.getMonth() + 1;
      const ord = pattern.ordinal ?? ordinalFromDate(anchor);
      const wd = pattern.weekday ?? weekdayFromDateKey(anchorDateKey);
      return `Yearly on the ${ORDINAL_LABELS[ord]} ${weekdayLabel(wd)} of ${monthLabel(m)}`;
    }
  }
}

export function defaultRecurrenceForm(anchorDateKey: string): RecurrenceFormValue {
  return {
    mode: "none",
    interval: 1,
    weeklyDays: [weekdayFromDateKey(anchorDateKey)],
    monthlyStyle: "date",
    yearlyStyle: "date",
    endType: "noEnd",
    endDate: anchorDateKey,
    occurrenceCount: 10,
  };
}

export function recurrenceFormFromRecurrence(
  recurrence: StaffCalendarRecurrence | undefined,
  anchorDateKey: string,
): RecurrenceFormValue {
  if (!recurrence) return defaultRecurrenceForm(anchorDateKey);
  const base = defaultRecurrenceForm(anchorDateKey);
  const { pattern, range } = recurrence;

  switch (pattern.type) {
    case "daily":
      return {
        ...base,
        mode: "daily",
        interval: pattern.interval,
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
    case "weekly":
      return {
        ...base,
        mode: "weekly",
        interval: pattern.interval,
        weeklyDays: pattern.daysOfWeek?.length
          ? pattern.daysOfWeek
          : [weekdayFromDateKey(anchorDateKey)],
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
    case "absoluteMonthly":
      return {
        ...base,
        mode: "monthly",
        interval: pattern.interval,
        monthlyStyle: "date",
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
    case "relativeMonthly":
      return {
        ...base,
        mode: "monthly",
        interval: pattern.interval,
        monthlyStyle: "ordinal",
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
    case "absoluteYearly":
      return {
        ...base,
        mode: "yearly",
        interval: 1,
        yearlyStyle: "date",
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
    case "relativeYearly":
      return {
        ...base,
        mode: "yearly",
        interval: 1,
        yearlyStyle: "ordinal",
        endType: range.type,
        endDate: range.endDate ?? anchorDateKey,
        occurrenceCount: range.occurrenceCount ?? 10,
      };
  }
}

export function buildRecurrenceFromForm(
  form: RecurrenceFormValue,
  anchorDateKey: string,
): StaffCalendarRecurrence | undefined {
  if (form.mode === "none") return undefined;

  const anchor = dateFromKey(anchorDateKey);
  const interval = Math.max(1, Math.min(form.interval, 99));
  let pattern: StaffCalendarRecurrencePattern;

  switch (form.mode) {
    case "daily":
      pattern = { type: "daily", interval };
      break;
    case "weekly":
      pattern = {
        type: "weekly",
        interval,
        daysOfWeek:
          form.weeklyDays.length > 0 ? form.weeklyDays : [weekdayFromDateKey(anchorDateKey)],
      };
      break;
    case "monthly":
      pattern =
        form.monthlyStyle === "ordinal"
          ? {
              type: "relativeMonthly",
              interval,
              ordinal: ordinalFromDate(anchor),
              weekday: weekdayFromDateKey(anchorDateKey),
            }
          : {
              type: "absoluteMonthly",
              interval,
              dayOfMonth: anchor.getDate(),
            };
      break;
    case "yearly":
      pattern =
        form.yearlyStyle === "ordinal"
          ? {
              type: "relativeYearly",
              interval: 1,
              month: anchor.getMonth() + 1,
              ordinal: ordinalFromDate(anchor),
              weekday: weekdayFromDateKey(anchorDateKey),
            }
          : {
              type: "absoluteYearly",
              interval: 1,
              month: anchor.getMonth() + 1,
              dayOfMonth: anchor.getDate(),
            };
      break;
  }

  const range: StaffCalendarRecurrenceRange =
    form.endType === "endDate"
      ? { type: "endDate", endDate: form.endDate }
      : form.endType === "numbered"
        ? { type: "numbered", occurrenceCount: Math.max(1, form.occurrenceCount) }
        : { type: "noEnd" };

  return {
    pattern,
    range,
    startDate: anchorDateKey,
    label: buildRecurrenceLabel(pattern, anchorDateKey),
  };
}

export function normalizeRecurrence(
  raw: StaffCalendarRecurrence | LegacyStaffCalendarRecurrence | undefined,
  anchorDateKey: string,
): StaffCalendarRecurrence | undefined {
  if (!raw) return undefined;
  if ("pattern" in raw && raw.pattern) {
    return {
      ...raw,
      startDate: raw.startDate ?? anchorDateKey,
      label: raw.label || buildRecurrenceLabel(raw.pattern, raw.startDate ?? anchorDateKey),
      range: raw.range ?? { type: "noEnd" },
    };
  }

  const legacy = raw as LegacyStaffCalendarRecurrence;
  const weekday = weekdayFromDateKey(anchorDateKey);
  const anchor = dateFromKey(anchorDateKey);
  let pattern: StaffCalendarRecurrencePattern;
  if (legacy.frequency === "daily") {
    pattern = { type: "daily", interval: 1 };
  } else if (legacy.frequency === "monthly") {
    pattern = { type: "absoluteMonthly", interval: 1, dayOfMonth: anchor.getDate() };
  } else {
    pattern = { type: "weekly", interval: 1, daysOfWeek: [weekday] };
  }

  return {
    label: legacy.label || buildRecurrenceLabel(pattern, anchorDateKey),
    pattern,
    range: { type: "noEnd" },
    startDate: anchorDateKey,
  };
}

function monthsBetween(start: Date, target: Date): number {
  return (target.getFullYear() - start.getFullYear()) * 12 + (target.getMonth() - start.getMonth());
}

function nthWeekdayOfMonth(year: number, month: number, ordinal: RecurrenceOrdinal, weekday: number): number | null {
  if (ordinal === "last") {
    const last = new Date(year, month + 1, 0);
    while (last.getDay() !== weekday) {
      last.setDate(last.getDate() - 1);
    }
    return last.getDate();
  }
  const map = { first: 1, second: 2, third: 3, fourth: 4 };
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const d = new Date(year, month, day);
    if (d.getMonth() !== month) break;
    if (d.getDay() === weekday) {
      count++;
      if (count === map[ordinal]) return day;
    }
  }
  return null;
}

function weekdayIndex(day: RecurrenceWeekday): number {
  return RECURRENCE_WEEKDAYS.indexOf(day);
}

function occursOnDate(recurrence: StaffCalendarRecurrence, dateKey: string): boolean {
  const target = dateFromKey(dateKey);
  const start = dateFromKey(recurrence.startDate);
  if (target < start) return false;

  const { pattern, range } = recurrence;
  if (range.type === "endDate" && range.endDate && dateKey > range.endDate) return false;

  switch (pattern.type) {
    case "daily": {
      const diffDays = Math.floor((target.getTime() - start.getTime()) / 86_400_000);
      return diffDays % pattern.interval === 0;
    }
    case "weekly": {
      const diffWeeks = Math.floor(
        (target.getTime() - start.getTime()) / (7 * 86_400_000),
      );
      if (diffWeeks % pattern.interval !== 0) return false;
      const days = pattern.daysOfWeek ?? [weekdayFromDateKey(recurrence.startDate)];
      return days.includes(RECURRENCE_WEEKDAYS[target.getDay()]);
    }
    case "absoluteMonthly": {
      const months = monthsBetween(start, target);
      if (months % pattern.interval !== 0) return false;
      return target.getDate() === (pattern.dayOfMonth ?? start.getDate());
    }
    case "relativeMonthly": {
      const months = monthsBetween(start, target);
      if (months % pattern.interval !== 0) return false;
      const ord = pattern.ordinal ?? "first";
      const wd = weekdayIndex(pattern.weekday ?? weekdayFromDateKey(recurrence.startDate));
      const dom = nthWeekdayOfMonth(target.getFullYear(), target.getMonth(), ord, wd);
      return dom === target.getDate();
    }
    case "absoluteYearly": {
      if (target.getMonth() + 1 !== (pattern.month ?? start.getMonth() + 1)) return false;
      return target.getDate() === (pattern.dayOfMonth ?? start.getDate());
    }
    case "relativeYearly": {
      if (target.getMonth() + 1 !== (pattern.month ?? start.getMonth() + 1)) return false;
      const ord = pattern.ordinal ?? "first";
      const wd = weekdayIndex(pattern.weekday ?? weekdayFromDateKey(recurrence.startDate));
      const dom = nthWeekdayOfMonth(target.getFullYear(), target.getMonth(), ord, wd);
      return dom === target.getDate();
    }
  }
}

export function seriesMasterEventId(eventId: string): string {
  const idx = eventId.indexOf("::");
  return idx >= 0 ? eventId.slice(0, idx) : eventId;
}

/** Expand recurring series into concrete instances for a set of calendar dates. */
export function expandRecurringEventsForDates(
  events: StaffCalendarEvent[],
  dateKeys: string[],
): StaffCalendarEvent[] {
  const keySet = new Set(dateKeys);
  const result: StaffCalendarEvent[] = [];

  for (const event of events) {
    const recurrence = normalizeRecurrence(event.recurrence, event.dateKey);
    if (!recurrence) {
      if (keySet.has(event.dateKey)) result.push(event);
      continue;
    }

    for (const dateKey of dateKeys) {
      if (!occursOnDate(recurrence, dateKey)) continue;
      result.push({
        ...event,
        id: dateKey === event.dateKey ? event.id : `${event.id}::${dateKey}`,
        dateKey,
        recurrence,
      });
    }
  }

  return result;
}

/** Shape for future Microsoft Graph `recurrence` payload. */
export function toGraphRecurrence(recurrence: StaffCalendarRecurrence) {
  const { pattern, range, startDate } = recurrence;
  return {
    pattern: {
      type: pattern.type,
      interval: pattern.interval,
      daysOfWeek: pattern.daysOfWeek,
      dayOfMonth: pattern.dayOfMonth,
      index: pattern.ordinal,
      dayOfWeek: pattern.weekday,
      month: pattern.month,
    },
    range: {
      type: range.type,
      startDate,
      endDate: range.endDate,
      numberOfOccurrences: range.occurrenceCount,
    },
  };
}

export function monthlyStyleLabels(anchorDateKey: string): { date: string; ordinal: string } {
  const anchor = dateFromKey(anchorDateKey);
  const ord = ordinalFromDate(anchor);
  const wd = weekdayLabel(weekdayFromDateKey(anchorDateKey));
  return {
    date: `Same date each month (day ${anchor.getDate()})`,
    ordinal: `Same weekday each month (${ORDINAL_LABELS[ord]} ${wd})`,
  };
}

export function yearlyStyleLabels(anchorDateKey: string): { date: string; ordinal: string } {
  const anchor = dateFromKey(anchorDateKey);
  const ord = ordinalFromDate(anchor);
  const wd = weekdayLabel(weekdayFromDateKey(anchorDateKey));
  const m = monthLabel(anchor.getMonth() + 1);
  return {
    date: `Same date every year (${m} ${anchor.getDate()})`,
    ordinal: `Same weekday every year (${ORDINAL_LABELS[ord]} ${wd} of ${m})`,
  };
}
