import type { CrewRole } from "@/lib/dispatch/types";

export type CrewRoleKind = CrewRole;

export type RoleTerm = {
  singular: string;
  plural: string;
};

export type TerminologySettings = {
  skipper: RoleTerm;
  driver: RoleTerm;
  mover: RoleTerm;
};
