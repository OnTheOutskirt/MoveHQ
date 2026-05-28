import { DEFAULT_ROLE_TERMS, DEFAULT_TERMINOLOGY } from "./defaults";
import type { CrewRoleKind, TerminologySettings } from "./types";

const ROLE_ORDER: CrewRoleKind[] = ["skipper", "driver", "mover"];

export function roleSingular(
  terms: TerminologySettings,
  role: CrewRoleKind,
): string {
  return terms[role].singular.trim() || DEFAULT_ROLE_TERMS[role].singular;
}

export function rolePlural(terms: TerminologySettings, role: CrewRoleKind): string {
  return terms[role].plural.trim() || DEFAULT_ROLE_TERMS[role].plural;
}

/** First letter of the singular label (calendar/dispatch abbreviations). */
export function roleInitial(terms: TerminologySettings, role: CrewRoleKind): string {
  const s = roleSingular(terms, role);
  const ch = s.charAt(0);
  return ch ? ch.toUpperCase() : DEFAULT_ROLE_TERMS[role].singular.charAt(0).toUpperCase();
}

export function roleCountWord(
  terms: TerminologySettings,
  role: CrewRoleKind,
  count: number,
): string {
  return count === 1 ? roleSingular(terms, role) : rolePlural(terms, role);
}

/** e.g. "2 Skippers" or "1 Skipper" */
export function roleQuantityLabel(
  terms: TerminologySettings,
  role: CrewRoleKind,
  count: number,
): string {
  return `${count} ${roleCountWord(terms, role, count)}`;
}

/** Dispatch slot label — "Driver" or "Driver 2" */
export function roleSlotLabel(
  terms: TerminologySettings,
  role: CrewRoleKind,
  index: number,
  total: number,
): string {
  const base = roleSingular(terms, role);
  return total === 1 ? base : `${base} ${index + 1}`;
}

export function formatCrewRoles(
  roles: CrewRoleKind[],
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): string {
  return ROLE_ORDER.filter((r) => roles.includes(r))
    .map((r) => roleSingular(terms, r))
    .join(" · ");
}

/** e.g. "Skippers left" */
export function roleLeftHeading(
  terms: TerminologySettings,
  role: CrewRoleKind,
): string {
  return `${rolePlural(terms, role)} left`;
}

export function fieldJobTitleOptions(
  terms: TerminologySettings,
): string[] {
  return ROLE_ORDER.map((r) => roleSingular(terms, r));
}

export function matchRoleFromJobTitle(
  title: string,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): CrewRoleKind | null {
  const lower = title.trim().toLowerCase();
  if (!lower) return null;
  for (const role of ROLE_ORDER) {
    if (roleSingular(terms, role).toLowerCase() === lower) return role;
    if (DEFAULT_ROLE_TERMS[role].singular.toLowerCase() === lower) return role;
  }
  return null;
}

export function isFieldJobTitle(
  title: string,
  terms: TerminologySettings = DEFAULT_TERMINOLOGY,
): boolean {
  return matchRoleFromJobTitle(title, terms) !== null;
}
