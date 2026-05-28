import type { CrewRole } from "@/lib/dispatch/types";
import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import {
  fieldJobTitleOptions,
  isFieldJobTitle,
  matchRoleFromJobTitle,
  roleSingular,
} from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import type { JobTitle, TeamMemberFormData, TeamMemberRecord } from "@/lib/team/types";

export function crewRolesToJobTitles(
  roles: CrewRole[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): JobTitle[] {
  const titles: JobTitle[] = [];
  if (roles.includes("skipper")) titles.push(roleSingular(terms, "skipper") as JobTitle);
  if (roles.includes("driver")) titles.push(roleSingular(terms, "driver") as JobTitle);
  if (roles.includes("mover")) titles.push(roleSingular(terms, "mover") as JobTitle);
  return titles;
}

export function jobTitlesToCrewRoles(
  titles: JobTitle[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): CrewRole[] {
  const roles: CrewRole[] = [];
  for (const title of titles) {
    const role = matchRoleFromJobTitle(title, terms);
    if (role && !roles.includes(role)) roles.push(role);
  }
  return roles;
}

/** Merge field titles from crew roles; preserve non-field titles (e.g. Manager). */
export function mergeJobTitlesFromCrewRoles(
  existing: JobTitle[],
  roles: CrewRole[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): JobTitle[] {
  const preserved = existing.filter((t) => !isFieldJobTitle(t, terms));
  const field = crewRolesToJobTitles(roles, terms);
  return [...preserved, ...field];
}

export function applyCrewToTeamMember(
  member: TeamMemberRecord,
  roles: CrewRole[],
  active: boolean,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): TeamMemberFormData {
  return {
    ...member,
    jobTitles: mergeJobTitlesFromCrewRoles(member.jobTitles, roles, terms),
    status: active ? "active" : "inactive",
  };
}

export { fieldJobTitleOptions };
