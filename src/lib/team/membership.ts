import { DEFAULT_COMPANY_ID, DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import type { UserWorkspaceMembership, WorkspaceRole } from "@/lib/workspace/types";
import type { OfficePersona } from "@/lib/session/personas";
import type { PermissionLevel, TeamMemberRecord } from "./types";
import type { RoleLocationAccess } from "./role-templates";
import { defaultLocationAccessForLevel } from "./role-templates";

function workspaceRoleFromPermission(
  level: PermissionLevel,
  personaRole: WorkspaceRole,
): WorkspaceRole {
  if (personaRole === "owner") return "owner";
  switch (level) {
    case "admin":
      return "admin";
    case "manager":
      return "manager";
    case "sales":
      return "sales";
    case "operations":
      return "operations";
    case "crew":
      return "crew";
    default:
      return personaRole;
  }
}

export function resolveMemberLocationAccess(
  member: Pick<TeamMemberRecord, "permissionLevel" | "primaryLocationId" | "locationAccess">,
  templateDefault?: RoleLocationAccess,
): UserWorkspaceMembership["locationAccess"] {
  if (member.locationAccess === "all") return "all";
  if (Array.isArray(member.locationAccess) && member.locationAccess.length > 0) {
    return member.locationAccess;
  }
  const fallback = templateDefault ?? defaultLocationAccessForLevel(member.permissionLevel);
  if (fallback === "all") return "all";
  return fallback;
}

/** Build workspace membership from a team record + active demo persona. */
export function membershipFromTeamMember(
  member: TeamMemberRecord,
  persona: OfficePersona,
  templateLocationDefault?: RoleLocationAccess,
): UserWorkspaceMembership {
  return {
    companyId: DEFAULT_COMPANY_ID,
    role: workspaceRoleFromPermission(member.permissionLevel, persona.workspaceRole),
    primaryLocationId: member.primaryLocationId ?? DEFAULT_PRIMARY_LOCATION_ID,
    locationAccess: resolveMemberLocationAccess(member, templateLocationDefault),
  };
}
