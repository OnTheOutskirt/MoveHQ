import type { PermissionLevel } from "@/lib/team/types";
import type { WorkspaceRole } from "@/lib/workspace/types";

export type OfficePersonaId =
  | "user-jonah-morrison"
  | "user-sarah-kim"
  | "user-alex-rivera"
  | "user-lisa-parker"
  | "user-pat-kim"
  | "user-carlos-rivera";

export type FollowUpScope = "all" | "assigned";

export type OfficePersona = {
  id: OfficePersonaId;
  name: string;
  initials: string;
  title: string;
  email: string;
  phone: string;
  /** Matches `MoveRecord.assignedRep` for rep-scoped views */
  assignedRep: string;
  workspaceRole: WorkspaceRole;
  permissionLevel: PermissionLevel;
  /** True for the real signed-in admin — can switch personas */
  isRealAdmin: boolean;
  followUpScope: FollowUpScope;
};

export const OFFICE_PERSONAS: OfficePersona[] = [
  {
    id: "user-jonah-morrison",
    name: "Jonah Morrison",
    initials: "JM",
    title: "Owner / Admin",
    email: "jonah@jonahsmovers.com",
    phone: "(555) 201-1001",
    assignedRep: "Jonah Morrison",
    workspaceRole: "owner",
    permissionLevel: "admin",
    isRealAdmin: true,
    followUpScope: "all",
  },
  {
    id: "user-sarah-kim",
    name: "Sarah Kim",
    initials: "SK",
    title: "Manager",
    email: "sarah@jonahsmovers.com",
    phone: "(555) 201-1002",
    assignedRep: "Sarah Kim",
    workspaceRole: "manager",
    permissionLevel: "manager",
    isRealAdmin: false,
    followUpScope: "all",
  },
  {
    id: "user-alex-rivera",
    name: "Alex Rivera",
    initials: "AR",
    title: "Sales",
    email: "alex@jonahsmovers.com",
    phone: "(216) 555-0142",
    assignedRep: "Alex Rivera",
    workspaceRole: "sales",
    permissionLevel: "sales",
    isRealAdmin: false,
    followUpScope: "assigned",
  },
  {
    id: "user-lisa-parker",
    name: "Lisa Parker",
    initials: "LP",
    title: "Operations",
    email: "lisa@jonahsmovers.com",
    phone: "(555) 201-1003",
    assignedRep: "Lisa Parker",
    workspaceRole: "operations",
    permissionLevel: "operations",
    isRealAdmin: false,
    followUpScope: "assigned",
  },
  {
    id: "user-pat-kim",
    name: "Pat Kim",
    initials: "PK",
    title: "Payroll / Office",
    email: "pat@jonahsmovers.com",
    phone: "(555) 201-1004",
    assignedRep: "Pat Kim",
    workspaceRole: "operations",
    permissionLevel: "operations",
    isRealAdmin: false,
    followUpScope: "all",
  },
  {
    id: "user-carlos-rivera",
    name: "Carlos Rivera",
    initials: "CR",
    title: "Crew",
    email: "carlos@jonahsmovers.com",
    phone: "(555) 301-1001",
    assignedRep: "Carlos Rivera",
    workspaceRole: "crew",
    permissionLevel: "crew",
    isRealAdmin: false,
    followUpScope: "assigned",
  },
];

export const DEFAULT_OFFICE_PERSONA_ID: OfficePersonaId = "user-jonah-morrison";

export const REAL_ADMIN_PERSONA = OFFICE_PERSONAS.find((p) => p.isRealAdmin)!;

export function getOfficePersona(id: string): OfficePersona {
  return OFFICE_PERSONAS.find((p) => p.id === id) ?? REAL_ADMIN_PERSONA;
}

export function personaForPermissionLevel(level: PermissionLevel): OfficePersona {
  return OFFICE_PERSONAS.find((p) => p.permissionLevel === level) ?? REAL_ADMIN_PERSONA;
}

/** Rep filter for inbox / notifications — `"all"` for managers and admins. */
export function repFilterForPersona(persona: OfficePersona): string {
  return persona.followUpScope === "all" ? "all" : persona.assignedRep;
}
