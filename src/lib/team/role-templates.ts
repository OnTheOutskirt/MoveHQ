import {
  baseCapabilitiesForLevel,
  CAPABILITIES,
  type Capability,
} from "@/lib/auth/capabilities";
import { DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import type { PermissionLevel } from "./types";
import { PERMISSION_LEVELS } from "./types";

export type RoleLocationAccess = "all" | string[];

export type RoleTemplateSettings = {
  /** Custom capability sets per level — missing level uses code default. */
  capabilities: Partial<Record<PermissionLevel, Capability[]>>;
  /** Default location visibility for members on this template. */
  locationAccess: Partial<Record<PermissionLevel, RoleLocationAccess>>;
};

export type CapabilityGroup = {
  id: string;
  label: string;
  caps: Capability[];
};

export const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: "app",
    label: "Applications",
    caps: ["app.software", "app.crew"],
  },
  {
    id: "nav",
    label: "Sidebar modules",
    caps: [
      "nav.dashboard",
      "nav.calendar",
      "nav.schedule",
      "nav.inbox",
      "nav.sales",
      "nav.operations",
      "nav.payroll",
      "nav.reports",
      "nav.planning",
      "nav.admin",
    ],
  },
  {
    id: "dashboards",
    label: "Dashboard home screens",
    caps: ["dashboard.executive", "dashboard.manager", "dashboard.sales", "dashboard.ops"],
  },
  {
    id: "reports",
    label: "Report tabs",
    caps: ["reports.day", "reports.sales", "reports.operations", "reports.ai_quotes"],
  },
  {
    id: "payroll",
    label: "Payroll & time",
    caps: ["payroll.view", "payroll.approve", "payroll.export"],
  },
  {
    id: "admin",
    label: "Admin sections",
    caps: ["admin.staff", "admin.company", "admin.integrations", "admin.setup"],
  },
  {
    id: "data",
    label: "Data visibility",
    caps: ["data.scope.company"],
  },
];

export const MATRIX_CAPABILITIES: Capability[] = CAPABILITY_GROUPS.flatMap((g) => g.caps);

export function defaultLocationAccessForLevel(level: PermissionLevel): RoleLocationAccess {
  if (level === "admin" || level === "manager") return "all";
  return [DEFAULT_PRIMARY_LOCATION_ID];
}

export function defaultRoleTemplateSettings(): RoleTemplateSettings {
  return {
    capabilities: {},
    locationAccess: Object.fromEntries(
      PERMISSION_LEVELS.map((level) => [level, defaultLocationAccessForLevel(level)]),
    ) as Record<PermissionLevel, RoleLocationAccess>,
  };
}

export function normalizeRoleTemplateSettings(
  raw: Partial<RoleTemplateSettings> | null | undefined,
): RoleTemplateSettings {
  const defaults = defaultRoleTemplateSettings();
  return {
    capabilities: { ...defaults.capabilities, ...(raw?.capabilities ?? {}) },
    locationAccess: { ...defaults.locationAccess, ...(raw?.locationAccess ?? {}) },
  };
}

export function capabilitiesForRoleTemplate(
  level: PermissionLevel,
  templates: RoleTemplateSettings,
): Capability[] {
  const custom = templates.capabilities[level];
  if (custom) return [...custom];
  return [...baseCapabilitiesForLevel(level)];
}

export function setRoleTemplateCapability(
  templates: RoleTemplateSettings,
  level: PermissionLevel,
  cap: Capability,
  enabled: boolean,
): RoleTemplateSettings {
  const current = new Set(capabilitiesForRoleTemplate(level, templates));
  if (enabled) current.add(cap);
  else current.delete(cap);
  return {
    ...templates,
    capabilities: {
      ...templates.capabilities,
      [level]: [...current],
    },
  };
}

export function resetRoleTemplateLevel(
  templates: RoleTemplateSettings,
  level: PermissionLevel,
): RoleTemplateSettings {
  const nextCaps = { ...templates.capabilities };
  delete nextCaps[level];
  return {
    ...templates,
    capabilities: nextCaps,
    locationAccess: {
      ...templates.locationAccess,
      [level]: defaultLocationAccessForLevel(level),
    },
  };
}

export function isRoleTemplateCustomized(
  templates: RoleTemplateSettings,
  level: PermissionLevel,
): boolean {
  if (templates.capabilities[level]) return true;
  const defaultLoc = defaultLocationAccessForLevel(level);
  const current = templates.locationAccess[level];
  if (!current) return false;
  if (defaultLoc === "all" && current === "all") return false;
  if (Array.isArray(defaultLoc) && Array.isArray(current)) {
    return JSON.stringify(defaultLoc) !== JSON.stringify(current);
  }
  return true;
}

export function locationAccessLabel(access: RoleLocationAccess, locationNames?: Map<string, string>): string {
  if (access === "all") return "All locations";
  if (access.length === 0) return "No branches";
  if (access.length === 1) {
    const name = locationNames?.get(access[0]!) ?? access[0];
    return name ?? "One branch";
  }
  return `${access.length} branches`;
}
