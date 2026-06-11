import {
  CAPABILITY_OVERRIDE_OPTIONS,
  effectiveOverrideEnabled,
  presetOverrideEnabled,
  type CapabilityOverrideKey,
} from "@/lib/auth/capabilities";
import type { CapabilityOverrides, PermissionLevel } from "./types";
import { permissionLevelMeta } from "./permissions";

export type AppAccessKind = "dashboard" | "crew_app";

export const APP_ACCESS_META: Record<AppAccessKind, { label: string; short: string }> = {
  dashboard: { label: "JM dashboard", short: "Dashboard" },
  crew_app: { label: "Crew mobile app", short: "Crew app" },
};

/** Which apps this access level can use — derived from permission, not manual toggles. */
export function appsForPermissionLevel(level: PermissionLevel): AppAccessKind[] {
  switch (level) {
    case "crew":
      return ["crew_app"];
    case "operations":
      return ["dashboard", "crew_app"];
    default:
      return ["dashboard"];
  }
}

export function accessTagline(level: PermissionLevel): string {
  return permissionLevelMeta[level].tagline;
}

export function canCustomizeModules(level: PermissionLevel): boolean {
  return level !== "admin" && level !== "crew";
}

/** Module add-ons that are on for this person (after overrides). */
export function activeModuleLabels(
  level: PermissionLevel,
  overrides?: CapabilityOverrides,
): string[] {
  return CAPABILITY_OVERRIDE_OPTIONS.filter((option) =>
    effectiveOverrideEnabled(level, overrides, option.key),
  ).map((option) => option.shortLabel);
}

/** Per-person deltas vs the role preset — for directory display. */
export function memberModuleCustomizations(
  level: PermissionLevel,
  overrides?: CapabilityOverrides,
): string[] {
  const deltas: string[] = [];
  for (const option of CAPABILITY_OVERRIDE_OPTIONS) {
    const preset = presetOverrideEnabled(level, option.key);
    const effective = effectiveOverrideEnabled(level, overrides, option.key);
    if (effective && !preset) deltas.push(`+${option.shortLabel}`);
    if (!effective && preset) deltas.push(`−${option.shortLabel}`);
  }
  return deltas;
}

export function moduleOptionForKey(key: CapabilityOverrideKey) {
  return CAPABILITY_OVERRIDE_OPTIONS.find((o) => o.key === key)!;
}
