import type { PermissionLevel } from "./types";

export const permissionLevelMeta: Record<
  PermissionLevel,
  { label: string; description: string }
> = {
  admin: {
    label: "Admin",
    description: "Full system access — settings, team, pricing, integrations, and all modules.",
  },
  manager: {
    label: "Manager",
    description: "Operations and sales oversight — dispatch, reports, moves, calendar, and team.",
  },
  sales: {
    label: "Sales",
    description: "Moves, people, quotes, calendar, and documents. JM software by default; crew app optional.",
  },
  operations: {
    label: "Operations",
    description: "Calendar, dispatch, jobs, crew, trucks — JM software and crew app access.",
  },
  crew: {
    label: "Crew",
    description: "Crew mobile app only. JM software access is not available at this level.",
  },
};

/** Defaults applied when permission level changes — not on every save. */
export function getAccessDefaultsForPermission(level: PermissionLevel): {
  hasSoftwareAccess: boolean;
  hasCrewAppAccess: boolean;
} {
  switch (level) {
    case "admin":
    case "manager":
    case "operations":
      return { hasSoftwareAccess: true, hasCrewAppAccess: true };
    case "sales":
      return { hasSoftwareAccess: true, hasCrewAppAccess: false };
    case "crew":
      return { hasSoftwareAccess: false, hasCrewAppAccess: true };
  }
}

/** @deprecated Use getAccessDefaultsForPermission */
export const getAccessForPermission = getAccessDefaultsForPermission;

export function isSoftwareAccessLocked(level: PermissionLevel): boolean {
  return level === "crew";
}

/** Enforce hard rules on save (crew cannot have software). */
export function enforceAccessRules(data: {
  permissionLevel: PermissionLevel;
  hasSoftwareAccess: boolean;
  hasCrewAppAccess: boolean;
}): { hasSoftwareAccess: boolean; hasCrewAppAccess: boolean } {
  if (data.permissionLevel === "crew") {
    return { hasSoftwareAccess: false, hasCrewAppAccess: true };
  }
  return {
    hasSoftwareAccess: data.hasSoftwareAccess,
    hasCrewAppAccess: data.hasCrewAppAccess,
  };
}

export function accessIsValidForPermission(m: {
  permissionLevel: PermissionLevel;
  hasSoftwareAccess: boolean;
  hasCrewAppAccess: boolean;
}): boolean {
  if (m.permissionLevel === "crew") {
    return !m.hasSoftwareAccess && m.hasCrewAppAccess;
  }
  if (m.permissionLevel === "sales") {
    return m.hasSoftwareAccess;
  }
  return true;
}
