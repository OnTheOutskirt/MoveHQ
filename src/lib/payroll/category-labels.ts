import type { TimeCategoryHours, TimeEntry } from "./types";

export const PAYROLL_CATEGORY_LABELS: Record<keyof TimeCategoryHours, string> = {
  move: "Move time",
  drive: "Drive time",
  extra: "Extra time",
  office: "Office time",
  break: "Break",
};

export function categoryKeysForEntry(entry: TimeEntry): (keyof TimeCategoryHours)[] {
  if (entry.workerType === "office") {
    return ["office", "break"];
  }
  return ["move", "drive", "extra", "break"];
}

export function timeEntrySourceLabel(source: TimeEntry["source"]): string {
  switch (source) {
    case "crew_app":
      return "Crew app";
    case "office_clock":
      return "Office time clock";
    case "office_manual":
      return "Office (manual)";
    case "manager_edit":
      return "Manager edit";
    default:
      return source;
  }
}

export function isOfficeClockEntry(entry: TimeEntry): boolean {
  return entry.source === "office_clock" || entry.isLiveClock === true;
}
