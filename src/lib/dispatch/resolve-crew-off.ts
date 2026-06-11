import { isDateInRange } from "@/lib/operations/fleet-capacity";
import type { CrewMemberOff } from "@/lib/calendar/types";
import type { FleetCrewMember, TimeOffRequest } from "@/lib/operations/fleet-types";
import type { CrewRole, DispatchCrewMember } from "./types";

export type CrewOffReason = {
  label: string;
  detail: string;
};

export type CrewOffDisplay =
  | { kind: "roster"; member: DispatchCrewMember; offReason: CrewOffReason }
  | {
      kind: "calendar";
      id: string;
      name: string;
      roles: CrewRole[];
      calendarRole: string;
      offReason: CrewOffReason;
    };

function calendarRoleToRoles(role: string): CrewRole[] {
  const r = role.toLowerCase();
  const roles: CrewRole[] = ["mover"];
  if (r.includes("skipper")) roles.unshift("skipper");
  if (r.includes("driver")) roles.splice(roles.includes("skipper") ? 1 : 0, 0, "driver");
  return [...new Set(roles)];
}

function rosterMatchForOff(
  entry: CrewMemberOff,
  roster: DispatchCrewMember[],
): DispatchCrewMember | undefined {
  const token = entry.name.split(/\s+/)[0]?.toLowerCase();
  return roster.find((c) => {
    const crewToken = c.name.split(/\s+/)[0]?.toLowerCase();
    return (
      crewToken === token ||
      c.name.toLowerCase() === entry.name.toLowerCase() ||
      entry.name.toLowerCase().startsWith(crewToken ?? "")
    );
  });
}

function timeOffOnDate(
  crewId: string,
  dateKey: string,
  requests: TimeOffRequest[],
): TimeOffRequest | undefined {
  return requests.find(
    (request) =>
      request.crewId === crewId &&
      request.status !== "denied" &&
      isDateInRange(dateKey, request.startDate, request.endDate),
  );
}

export function resolveCrewOffReason(
  crewId: string,
  dateKey: string,
  timeOffRequests: TimeOffRequest[],
  fleetCrew: FleetCrewMember[],
  calendarRole?: string,
): CrewOffReason {
  const member = fleetCrew.find((crew) => crew.id === crewId);
  if (member && !member.active) {
    return { label: "Inactive", detail: "Not on active roster" };
  }

  const timeOff = timeOffOnDate(crewId, dateKey, timeOffRequests);
  if (timeOff) {
    return {
      label: timeOff.status === "pending" ? "Pending time off" : "Time off",
      detail: timeOff.reason,
    };
  }

  if (calendarRole?.trim()) {
    return { label: "Scheduled off", detail: calendarRole.trim() };
  }

  return { label: "Off", detail: "Marked off on the move calendar" };
}

/** Resolve calendar crew-off rows to roster members or calendar-only entries. */
export function resolveCrewOffDisplay(
  crewOff: CrewMemberOff[],
  crewOffIds: string[],
  roster: DispatchCrewMember[],
  options: {
    dateKey: string;
    timeOffRequests: TimeOffRequest[];
    fleetCrew: FleetCrewMember[];
  },
): CrewOffDisplay[] {
  const { dateKey, timeOffRequests, fleetCrew } = options;
  const displays: CrewOffDisplay[] = [];
  const seenRoster = new Set<string>();

  for (const entry of crewOff) {
    const match = rosterMatchForOff(entry, roster);
    if (match && !seenRoster.has(match.id)) {
      seenRoster.add(match.id);
      displays.push({
        kind: "roster",
        member: match,
        offReason: resolveCrewOffReason(match.id, dateKey, timeOffRequests, fleetCrew, entry.role),
      });
    } else if (!match) {
      const calendarMatch = rosterMatchForOff(entry, fleetCrew);
      displays.push({
        kind: "calendar",
        id: entry.id,
        name: entry.name,
        roles: calendarRoleToRoles(entry.role),
        calendarRole: entry.role,
        offReason: calendarMatch
          ? resolveCrewOffReason(
              calendarMatch.id,
              dateKey,
              timeOffRequests,
              fleetCrew,
              entry.role,
            )
          : { label: "Scheduled off", detail: entry.role },
      });
    }
  }

  for (const id of crewOffIds) {
    if (seenRoster.has(id)) continue;
    const member = roster.find((crew) => crew.id === id);
    if (member) {
      seenRoster.add(id);
      displays.push({
        kind: "roster",
        member,
        offReason: resolveCrewOffReason(id, dateKey, timeOffRequests, fleetCrew),
      });
    }
  }

  return displays.sort((a, b) => {
    const nameA = a.kind === "roster" ? a.member.name : a.name;
    const nameB = b.kind === "roster" ? b.member.name : b.name;
    return nameA.localeCompare(nameB);
  });
}

