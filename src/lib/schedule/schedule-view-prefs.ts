import type { StaffCalendarScope, StaffTeamFilter } from "./types";

export type StaffScheduleViewPrefs = {
  scope: StaffCalendarScope;
  team: StaffTeamFilter;
  /** Company view — specific staff member id, or "all". */
  staffFilter: string;
};

const STORAGE_KEY = "jm-staff-schedule-view-v2";

const DEFAULT_PREFS: StaffScheduleViewPrefs = {
  scope: "mine",
  team: "all",
  staffFilter: "all",
};

export function readStaffScheduleViewPrefs(): StaffScheduleViewPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<StaffScheduleViewPrefs>;
    const scope = parsed.scope === "company" ? "company" : "mine";
    const team =
      parsed.team === "sales" || parsed.team === "ops" ? parsed.team : "all";
    const staffFilter =
      typeof parsed.staffFilter === "string" && parsed.staffFilter.trim()
        ? parsed.staffFilter
        : "all";
    return { scope, team, staffFilter };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function writeStaffScheduleViewPrefs(prefs: StaffScheduleViewPrefs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}
