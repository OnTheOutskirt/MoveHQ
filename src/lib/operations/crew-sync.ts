import type { CrewRole } from "@/lib/dispatch/types";
import type { JobTitle, TeamMemberFormData, TeamMemberRecord } from "@/lib/team/types";

const FIELD_TITLES: JobTitle[] = ["Skipper", "Driver", "Mover"];

export function crewRolesToJobTitles(roles: CrewRole[]): JobTitle[] {
  const titles: JobTitle[] = [];
  if (roles.includes("skipper")) titles.push("Skipper");
  if (roles.includes("driver")) titles.push("Driver");
  if (roles.includes("mover")) titles.push("Mover");
  return titles;
}

export function jobTitlesToCrewRoles(titles: JobTitle[]): CrewRole[] {
  const roles: CrewRole[] = [];
  if (titles.includes("Skipper")) roles.push("skipper");
  if (titles.includes("Driver")) roles.push("driver");
  if (titles.includes("Mover")) roles.push("mover");
  return roles;
}

/** Merge field titles from crew roles; preserve non-field titles (e.g. Manager). */
export function mergeJobTitlesFromCrewRoles(
  existing: JobTitle[],
  roles: CrewRole[],
): JobTitle[] {
  const preserved = existing.filter((t) => !FIELD_TITLES.includes(t));
  const field = crewRolesToJobTitles(roles);
  return [...preserved, ...field];
}

export function applyCrewToTeamMember(
  member: TeamMemberRecord,
  roles: CrewRole[],
  active: boolean,
): TeamMemberFormData {
  return {
    ...member,
    jobTitles: mergeJobTitlesFromCrewRoles(member.jobTitles, roles),
    status: active ? "active" : "inactive",
  };
}
