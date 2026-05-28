import type { CrewMemberOff } from "@/lib/calendar/types";
import type { CrewRole, DispatchCrewMember } from "./types";

export type CrewOffDisplay =
  | { kind: "roster"; member: DispatchCrewMember }
  | { kind: "calendar"; id: string; name: string; roles: CrewRole[]; calendarRole: string };

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

/** Resolve calendar crew-off rows to roster members or calendar-only entries. */
export function resolveCrewOffDisplay(
  crewOff: CrewMemberOff[],
  crewOffIds: string[],
  roster: DispatchCrewMember[],
): CrewOffDisplay[] {
  const displays: CrewOffDisplay[] = [];
  const seenRoster = new Set<string>();

  for (const entry of crewOff) {
    const match = rosterMatchForOff(entry, roster);
    if (match && !seenRoster.has(match.id)) {
      seenRoster.add(match.id);
      displays.push({ kind: "roster", member: match });
    } else if (!match) {
      displays.push({
        kind: "calendar",
        id: entry.id,
        name: entry.name,
        roles: calendarRoleToRoles(entry.role),
        calendarRole: entry.role,
      });
    }
  }

  for (const id of crewOffIds) {
    if (seenRoster.has(id)) continue;
    const member = roster.find((c) => c.id === id);
    if (member) {
      seenRoster.add(id);
      displays.push({ kind: "roster", member });
    }
  }

  return displays.sort((a, b) => {
    const nameA = a.kind === "roster" ? a.member.name : a.name;
    const nameB = b.kind === "roster" ? b.member.name : b.name;
    return nameA.localeCompare(nameB);
  });
}
