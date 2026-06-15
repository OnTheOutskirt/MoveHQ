import { toDateKey } from "@/lib/calendar/date-utils";

export type MonthWeekBucket = {
  id: "w1" | "w2" | "w3" | "w4" | "remainder";
  label: string;
  rangeLabel: string;
  start: string;
  end: string;
};

export type MonthWeekColumns = {
  monthKey: string;
  monthLabel: string;
  weeks: MonthWeekBucket[];
};

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatRangeLabel(start: string, end: string): string {
  const [, sm, sd] = start.split("-");
  const [, em, ed] = end.split("-");
  return `${sm}/${sd}-${em}/${ed}`;
}

/** Calendar month split into four 7-day buckets plus remainder (CEO snapshot layout). */
export function monthWeekBuckets(year: number, monthIndex: number): MonthWeekColumns {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const monthKey = `${year}-${pad2(monthIndex + 1)}`;
  const monthLabel = new Date(year, monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const ranges: Array<[number, number]> = [
    [1, 7],
    [8, 14],
    [15, 21],
    [22, 28],
    [29, daysInMonth],
  ];

  const ids: MonthWeekBucket["id"][] = ["w1", "w2", "w3", "w4", "remainder"];
  const labels = ["Week 1", "Week 2", "Week 3", "Week 4", "Remainder"];

  const weeks = ranges.map(([fromDay, toDay], index) => {
    if (fromDay > daysInMonth) {
      const emptyStart = `${monthKey}-${pad2(daysInMonth)}`;
      return {
        id: ids[index]!,
        label: labels[index]!,
        rangeLabel: "—",
        start: emptyStart,
        end: emptyStart,
      };
    }
    const endDay = Math.min(toDay, daysInMonth);
    const start = `${monthKey}-${pad2(fromDay)}`;
    const end = `${monthKey}-${pad2(endDay)}`;
    return {
      id: ids[index]!,
      label: labels[index]!,
      rangeLabel: formatRangeLabel(start, end),
      start,
      end,
    };
  });

  return { monthKey, monthLabel, weeks };
}

export function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  const [y, m] = monthKey.split("-").map(Number);
  return { year: y!, monthIndex: m! - 1 };
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const { year, monthIndex } = parseMonthKey(monthKey);
  const d = new Date(year, monthIndex + delta, 1);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}

export function isDateInBucket(dateKey: string, bucket: MonthWeekBucket): boolean {
  if (bucket.rangeLabel === "—") return false;
  return dateKey >= bucket.start && dateKey <= bucket.end;
}

export function monthKeysForRange(startKey: string, endKey: string): string[] {
  const keys: string[] = [];
  const start = parseMonthKey(startKey.slice(0, 7));
  const end = parseMonthKey(endKey.slice(0, 7));
  let cursor = new Date(start.year, start.monthIndex, 1);
  const endDate = new Date(end.year, end.monthIndex, 1);
  while (cursor <= endDate) {
    keys.push(`${cursor.getFullYear()}-${pad2(cursor.getMonth() + 1)}`);
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  return keys;
}

export function currentMonthKey(today: Date = new Date()): string {
  return toDateKey(today).slice(0, 7);
}
