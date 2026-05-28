import type { GanttBar, TimelineRow } from "./types";

const STORAGE_KEY = "movehq-planning-schedule-v1";

export type ScheduleOverrides = {
  timeline?: Record<string, { start?: string; end?: string }>;
  gantt?: Record<string, { start?: string; end?: string }>;
};

export function readScheduleOverrides(): ScheduleOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as ScheduleOverrides;
  } catch {
    return {};
  }
}

export function writeScheduleOverrides(overrides: ScheduleOverrides): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function formatIsoRange(start: string, end: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso + "T12:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };
  const a = fmt(start);
  const b = fmt(end);
  if (a === b) return a;
  const sameMonth =
    new Date(start + "T12:00:00").getMonth() === new Date(end + "T12:00:00").getMonth();
  if (sameMonth) {
    const endDay = new Date(end + "T12:00:00").getDate();
    const month = new Date(start + "T12:00:00").toLocaleDateString("en-US", { month: "short" });
    const startDay = new Date(start + "T12:00:00").getDate();
    return `${month} ${startDay} - ${endDay}`;
  }
  return `${a} - ${b}`;
}

export function mergeTimelineRows(
  defaults: TimelineRow[],
  overrides: ScheduleOverrides,
): TimelineRow[] {
  return defaults.map((row) => {
    const o = overrides.timeline?.[row.id];
    const start = o?.start ?? row.start;
    const end = o?.end ?? row.end;
    return {
      ...row,
      start,
      end,
      dates: formatIsoRange(start, end),
    };
  });
}

export function mergeGanttBars(
  defaults: GanttBar[],
  timeline: TimelineRow[],
  overrides: ScheduleOverrides,
): GanttBar[] {
  const timelineById = Object.fromEntries(timeline.map((t) => [t.id, t]));

  return defaults.map((bar) => {
    const direct = overrides.gantt?.[bar.id];
    if (direct?.start && direct?.end) {
      return { ...bar, start: direct.start, end: direct.end };
    }
    if (bar.timelineRowId) {
      const row = timelineById[bar.timelineRowId];
      if (row) return { ...bar, start: row.start, end: row.end };
    }
    return bar;
  });
}

export function planRangeFromBars(bars: GanttBar[]): { start: string; end: string } {
  if (bars.length === 0) return { start: "2026-06-01", end: "2026-08-31" };
  const starts = bars.map((b) => b.start).sort();
  const ends = bars.map((b) => b.end).sort();
  return { start: starts[0]!, end: ends[ends.length - 1]! };
}

export function setTimelineRowDates(
  overrides: ScheduleOverrides,
  rowId: string,
  start: string,
  end: string,
): ScheduleOverrides {
  const timeline = { ...overrides.timeline, [rowId]: { start, end } };
  return { ...overrides, timeline };
}
