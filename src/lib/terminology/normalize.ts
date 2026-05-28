import { DEFAULT_ROLE_TERMS, DEFAULT_TERMINOLOGY } from "./defaults";
import type { CrewRoleKind, RoleTerm, TerminologySettings } from "./types";

function normalizeRoleTerm(
  raw: Partial<RoleTerm> | undefined,
  role: CrewRoleKind,
): RoleTerm {
  const fallback = DEFAULT_ROLE_TERMS[role];
  const singular = String(raw?.singular ?? "").trim() || fallback.singular;
  const plural = String(raw?.plural ?? "").trim() || fallback.plural;
  return { singular, plural };
}

export function normalizeTerminology(
  raw: Partial<TerminologySettings> | undefined,
): TerminologySettings {
  return {
    skipper: normalizeRoleTerm(raw?.skipper, "skipper"),
    driver: normalizeRoleTerm(raw?.driver, "driver"),
    mover: normalizeRoleTerm(raw?.mover, "mover"),
  };
}

export function mergeTerminology(
  patch: Partial<TerminologySettings>,
  current: TerminologySettings = DEFAULT_TERMINOLOGY,
): TerminologySettings {
  return normalizeTerminology({
    skipper: { ...current.skipper, ...patch.skipper },
    driver: { ...current.driver, ...patch.driver },
    mover: { ...current.mover, ...patch.mover },
  });
}
