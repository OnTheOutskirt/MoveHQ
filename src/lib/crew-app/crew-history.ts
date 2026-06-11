import { addDays, parseDateKey, toDateKey } from "@/lib/calendar/date-utils";
import { readJobFieldState } from "@/lib/crew-app/job-field-storage";
import { CREW_DEMO_TODAY_KEY } from "@/lib/crew-app/mock-jobs";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { startOfWeek } from "@/lib/settings/business-calendar";
import type { WeekStartsOn } from "@/lib/settings/types";

export type CrewHistoryJobEntry = {
  job: CrewAppJob;
  hours: number;
  tips: number;
};

export type CrewWeekSummary = {
  weekStartKey: string;
  weekEndKey: string;
  label: string;
  isCurrentWeek: boolean;
  jobCount: number;
  totalHours: number;
  totalTips: number;
  jobs: CrewHistoryJobEntry[];
};

/** Align crew history with demo job dates. */
export function crewScheduleTodayKey(): string {
  return CREW_DEMO_TODAY_KEY;
}

export function weekStartKeyForDate(dateKey: string, weekStartsOn: WeekStartsOn = "monday"): string {
  return toDateKey(startOfWeek(parseDateKey(dateKey), weekStartsOn));
}

export function jobBillableHours(jobId: string): number {
  const field = readJobFieldState(jobId);
  let ms = 0;
  for (const slot of Object.values(field.times)) {
    if (!slot.clockIn || !slot.clockOut) continue;
    ms += new Date(slot.clockOut).getTime() - new Date(slot.clockIn).getTime();
  }
  return Math.round((ms / 3_600_000) * 10) / 10;
}

/** Demo tips until payroll integration — scales with job type and hours. */
export function demoTipsForJob(job: CrewAppJob, hours: number): number {
  if (job.quoteType === "flat") return 35;
  return Math.round(hours * 8);
}

export function historyJobEntry(job: CrewAppJob): CrewHistoryJobEntry {
  const hours = jobBillableHours(job.id);
  return { job, hours, tips: demoTipsForJob(job, hours) };
}

export function jobsInWeek(
  jobs: CrewAppJob[],
  weekStartKey: string,
  weekStartsOn: WeekStartsOn = "monday",
  throughToday = true,
): CrewAppJob[] {
  const todayKey = crewScheduleTodayKey();
  const endKey = toDateKey(addDays(parseDateKey(weekStartKey), 6));
  const lastDay = throughToday ? todayKey : toDateKey(addDays(parseDateKey(todayKey), -1));
  return jobs
    .filter((j) => j.dateKey >= weekStartKey && j.dateKey <= endKey && j.dateKey <= lastDay)
    .sort(
      (a, b) =>
        b.dateKey.localeCompare(a.dateKey) ||
        (b.arrivalWindow ?? "").localeCompare(a.arrivalWindow ?? ""),
    );
}

export function summarizeWeek(
  jobs: CrewAppJob[],
  weekStartKey: string,
  weekStartsOn: WeekStartsOn = "monday",
): CrewWeekSummary {
  const weekJobs = jobsInWeek(jobs, weekStartKey, weekStartsOn, true);
  const entries = weekJobs.map(historyJobEntry);
  const todayKey = crewScheduleTodayKey();
  const currentWeekStart = weekStartKeyForDate(todayKey, weekStartsOn);
  const start = parseDateKey(weekStartKey);
  const endKey = toDateKey(addDays(start, 6));

  return {
    weekStartKey,
    weekEndKey: endKey,
    label: formatWeekRangeLabel(weekStartKey, endKey),
    isCurrentWeek: weekStartKey === currentWeekStart,
    jobCount: entries.length,
    totalHours: Math.round(entries.reduce((s, e) => s + e.hours, 0) * 10) / 10,
    totalTips: entries.reduce((s, e) => s + e.tips, 0),
    jobs: entries,
  };
}

export function formatWeekRangeLabel(weekStartKey: string, weekEndKey: string): string {
  const start = parseDateKey(weekStartKey);
  const end = parseDateKey(weekEndKey);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const a = start.toLocaleDateString("en-US", opts);
  const b = end.toLocaleDateString("en-US", {
    ...opts,
    year: start.getFullYear() !== end.getFullYear() ? "numeric" : undefined,
  });
  if (weekStartKey === weekStartKeyForDate(crewScheduleTodayKey())) return "This week";
  return `${a} – ${b}`;
}

/** Recent week starts that have at least one past job, plus current week. */
export function listHistoryWeeks(
  jobs: CrewAppJob[],
  weekStartsOn: WeekStartsOn = "monday",
  maxWeeks = 8,
): string[] {
  const todayKey = crewScheduleTodayKey();
  const current = weekStartKeyForDate(todayKey, weekStartsOn);
  const keys = new Set<string>([current]);

  for (const job of jobs) {
    if (job.dateKey >= todayKey) continue;
    keys.add(weekStartKeyForDate(job.dateKey, weekStartsOn));
  }

  let cursor = parseDateKey(current);
  for (let i = 0; i < maxWeeks; i++) {
    keys.add(toDateKey(cursor));
    cursor = addDays(cursor, -7);
  }

  return [...keys].sort((a, b) => b.localeCompare(a));
}
