import type { CrewRoleKind, RoleTerm, TerminologySettings } from "./types";

export const DEFAULT_ROLE_TERMS: Record<CrewRoleKind, RoleTerm> = {
  skipper: { singular: "Skipper", plural: "Skippers" },
  driver: { singular: "Driver", plural: "Drivers" },
  mover: { singular: "Mover", plural: "Movers" },
};

export const DEFAULT_TERMINOLOGY: TerminologySettings = {
  skipper: { ...DEFAULT_ROLE_TERMS.skipper },
  driver: { ...DEFAULT_ROLE_TERMS.driver },
  mover: { ...DEFAULT_ROLE_TERMS.mover },
};
