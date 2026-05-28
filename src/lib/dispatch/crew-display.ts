import { DEFAULT_TERMINOLOGY } from "@/lib/terminology/defaults";
import {
  formatCrewRoles as formatCrewRolesWithTerms,
  roleInitial as roleInitialWithTerms,
  roleSingular,
} from "@/lib/terminology/labels";
import type { TerminologySettings } from "@/lib/terminology/types";
import type { CrewRole } from "./types";

export function crewRoleLabel(
  role: CrewRole,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string {
  return roleSingular(terms, role);
}

export function formatCrewRoles(
  roles: CrewRole[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string {
  return formatCrewRolesWithTerms(roles, terms);
}

export function crewRoleBadgeClass(role: CrewRole): string {
  switch (role) {
    case "skipper":
      return "bg-violet-100 text-violet-800";
    case "driver":
      return "bg-sky-100 text-sky-800";
    case "mover":
      return "bg-slate-100 text-slate-700";
  }
}

export function crewRoleInitial(
  role: CrewRole,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string {
  return roleInitialWithTerms(terms, role);
}
