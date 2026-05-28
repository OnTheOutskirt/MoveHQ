export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function addWeeks(date: Date, weeks: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfWeekSunday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** True when date is strictly before today (local midnight). */
export function isBeforeToday(date: Date, today: Date): boolean {
  return startOfDay(date).getTime() < startOfDay(today).getTime();
}

/** Whole days from today (negative = past). */
export function daysFromToday(date: Date, today: Date = new Date()): number {
  const ms = startOfDay(date).getTime() - startOfDay(today).getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const start = weekStart.toLocaleDateString("en-US", opts);
  const end = weekEnd.toLocaleDateString("en-US", {
    ...opts,
    year: weekStart.getFullYear() !== weekEnd.getFullYear() ? "numeric" : undefined,
  });
  const year =
    weekStart.getFullYear() === weekEnd.getFullYear()
      ? `, ${weekStart.getFullYear()}`
      : "";
  return `${start} – ${end}${year}`;
}

export function formatDayLong(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Monday = 0 … Saturday = 5 (Sundays excluded from the work-week grid). */
export function workWeekColumnIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0;
}

/**
 * Current month, Mon–Sat only — leading/trailing padding cells are null.
 */
export function getMonthOnlyGridCells(anchor: Date): (Date | null)[] {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    if (isSunday(date)) continue;

    if (cells.length === 0) {
      const leading = workWeekColumnIndex(date);
      for (let i = 0; i < leading; i++) cells.push(null);
    }
    cells.push(date);
  }

  while (cells.length % 6 !== 0) {
    cells.push(null);
  }

  return cells;
}
