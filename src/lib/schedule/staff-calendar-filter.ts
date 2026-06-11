import type {
  StaffCalendarEvent,
  StaffCalendarScope,
  StaffDepartment,
  StaffTeamFilter,
} from "./types";

export type StaffCalendarMember = {
  staffId: string;
  staffName: string;
  department: StaffDepartment;
};

export function filterStaffCalendarEvents(
  events: StaffCalendarEvent[],
  scope: StaffCalendarScope,
  team: StaffTeamFilter,
  currentStaffId: string,
  staffFilter = "all",
): StaffCalendarEvent[] {
  if (scope === "mine") {
    return events.filter((e) => e.staffId === currentStaffId);
  }

  let list = events;
  if (team === "sales") {
    list = list.filter((e) => e.department === "sales");
  } else if (team === "ops") {
    list = list.filter((e) => e.department === "operations");
  }
  if (staffFilter !== "all") {
    list = list.filter((e) => e.staffId === staffFilter);
  }
  return list;
}

/** People with events on the calendar — for company-view person picker. */
export function staffMembersFromEvents(
  events: StaffCalendarEvent[],
  team: StaffTeamFilter,
): StaffCalendarMember[] {
  let list = events;
  if (team === "sales") {
    list = list.filter((e) => e.department === "sales");
  } else if (team === "ops") {
    list = list.filter((e) => e.department === "operations");
  }

  const map = new Map<string, StaffCalendarMember>();
  for (const event of list) {
    map.set(event.staffId, {
      staffId: event.staffId,
      staffName: event.staffName,
      department: event.department,
    });
  }

  return [...map.values()].sort((a, b) =>
    a.staffName.localeCompare(b.staffName, undefined, { sensitivity: "base" }),
  );
}

export function departmentLabel(dept: StaffDepartment): string {
  return dept === "sales" ? "Sales" : "Ops";
}

export function departmentTone(dept: StaffDepartment): {
  border: string;
  bg: string;
  text: string;
} {
  if (dept === "sales") {
    return {
      border: "border-brand-200",
      bg: "bg-brand-50/80",
      text: "text-brand-900",
    };
  }
  return {
    border: "border-amber-200",
    bg: "bg-amber-50/80",
    text: "text-amber-950",
  };
}
