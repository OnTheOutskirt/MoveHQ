import type { Capability } from "@/lib/auth/capabilities";
import { baseCapabilitiesForLevel } from "@/lib/auth/capabilities";
import type { PermissionLevel } from "./types";

export const permissionLevelMeta: Record<
  PermissionLevel,
  { label: string; tagline: string; description: string }
> = {
  admin: {
    label: "Admin",
    tagline: "Full access to every module, setting, and report.",
    description: "Owners and system admins. Includes payroll, executive dashboard, admin settings, and planning.",
  },
  manager: {
    label: "Manager",
    tagline: "Run sales and operations with reports and admin settings.",
    description: "Branch or department leads. Add payroll, executive view, or planning per person if needed.",
  },
  sales: {
    label: "Sales",
    tagline: "Pipeline, quotes, walkthroughs, and sales reporting.",
    description: "Sales reps and coordinators. Read-only access to operations screens.",
  },
  operations: {
    label: "Operations",
    tagline: "Dispatch, jobs, crew, fleet, and operations reporting.",
    description: "Dispatchers and ops leads. Includes dashboard and crew app.",
  },
  crew: {
    label: "Crew",
    tagline: "Crew mobile app only — no dashboard login.",
    description: "Field crew on job days. Assign field roles separately below.",
  },
};

/** Highlights for the Roles admin tab */
export const permissionLevelHighlights: Record<PermissionLevel, string[]> = {
  admin: ["All modules", "Executive", "Admin", "Planning", "Payroll"],
  manager: ["Sales & ops", "Reports", "Admin settings"],
  sales: ["Sales pipeline", "Ops (read)", "Reports"],
  operations: ["Dispatch & jobs", "Sales (read)", "Reports", "Crew app"],
  crew: ["Crew app"],
};

export function capabilitiesForLevelDisplay(level: PermissionLevel): Capability[] {
  return [...baseCapabilitiesForLevel(level)];
}

/** Defaults applied when permission level changes — not on every save. */
export function getAccessDefaultsForPermission(level: PermissionLevel): {
  hasSoftwareAccess: boolean;
  hasCrewAppAccess: boolean;
} {
  switch (level) {
    case "admin":
    case "manager":
      return { hasSoftwareAccess: true, hasCrewAppAccess: false };
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
