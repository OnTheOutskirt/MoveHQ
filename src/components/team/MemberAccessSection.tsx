"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { LocationAccessFields } from "@/components/team/LocationAccessFields";
import { SettingsSelect } from "@/components/settings/SettingsField";
import {
  CAPABILITY_OVERRIDE_OPTIONS,
  effectiveOverrideEnabled,
  presetOverrideEnabled,
  setCapabilityOverride,
  type CapabilityOverrideKey,
} from "@/lib/auth/capabilities";
import {
  APP_ACCESS_META,
  accessTagline,
  activeModuleLabels,
  appsForPermissionLevel,
  canCustomizeModules,
} from "@/lib/team/access-profiles";
import { permissionLevelMeta } from "@/lib/team/permissions";
import { DEFAULT_PRIMARY_LOCATION_ID } from "@/lib/workspace/constants";
import type { RoleLocationAccess } from "@/lib/team/role-templates";
import { PERMISSION_LEVELS, type CapabilityOverrides, type PermissionLevel } from "@/lib/team/types";
import { cn } from "@/lib/utils";
import { ChevronDown, LayoutDashboard, Smartphone } from "lucide-react";
import { useState } from "react";

type MemberAccessSectionProps = {
  permissionLevel: PermissionLevel;
  capabilityOverrides?: CapabilityOverrides;
  primaryLocationId?: string;
  locationAccess?: RoleLocationAccess;
  onPermissionLevelChange: (level: PermissionLevel) => void;
  onCapabilityOverridesChange: (overrides: CapabilityOverrides | undefined) => void;
  onPrimaryLocationChange: (id: string) => void;
  onLocationAccessChange: (access: RoleLocationAccess) => void;
};

function AppBadge({ kind }: { kind: "dashboard" | "crew_app" }) {
  const meta = APP_ACCESS_META[kind];
  const Icon = kind === "dashboard" ? LayoutDashboard : Smartphone;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3.5 w-3.5 opacity-70" />
      {meta.short}
    </span>
  );
}

function ModulePill({
  label,
  active,
  preset,
  onClick,
}: {
  label: string;
  active: boolean;
  preset: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-brand-300 bg-brand-50 text-brand-800"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300",
        !active && preset && "line-through opacity-60",
      )}
      title={active ? (preset ? "Included in role" : "Added for this person") : "Off for this person"}
    >
      {label}
    </button>
  );
}

export function MemberAccessSection({
  permissionLevel,
  capabilityOverrides,
  primaryLocationId = DEFAULT_PRIMARY_LOCATION_ID,
  locationAccess,
  onPermissionLevelChange,
  onCapabilityOverridesChange,
  onPrimaryLocationChange,
  onLocationAccessChange,
}: MemberAccessSectionProps) {
  const { config, hasMultipleLocations } = useWorkspace();
  const [modulesOpen, setModulesOpen] = useState(() => {
    const overrides = capabilityOverrides ?? {};
    return Object.keys(overrides).length > 0;
  });
  const [locationsOpen, setLocationsOpen] = useState(false);

  const apps = appsForPermissionLevel(permissionLevel);
  const modules = activeModuleLabels(permissionLevel, capabilityOverrides);
  const showModules = canCustomizeModules(permissionLevel);
  const overrides = capabilityOverrides ?? {};

  function patchModule(key: CapabilityOverrideKey) {
    const enabled = effectiveOverrideEnabled(permissionLevel, overrides, key);
    onCapabilityOverridesChange(
      setCapabilityOverride(permissionLevel, overrides, key, !enabled),
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">System access</p>
        <p className="mt-0.5 text-xs text-slate-500">
          Controls login, sidebar modules, and reports. Field roles below are separate.
        </p>
      </div>

      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          Access level
        </span>
        <SettingsSelect
          className="mt-1"
          value={permissionLevel}
          onChange={(e) => onPermissionLevelChange(e.target.value as PermissionLevel)}
        >
          {PERMISSION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {permissionLevelMeta[level].label}
            </option>
          ))}
        </SettingsSelect>
        <p className="mt-1.5 text-xs text-slate-600">{accessTagline(permissionLevel)}</p>
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          Logs into
        </span>
        {apps.map((app) => (
          <AppBadge key={app} kind={app} />
        ))}
      </div>

      {modules.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="w-full text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Modules
          </span>
          {modules.map((label) => (
            <span
              key={label}
              className="rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200/80"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      {showModules ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50/60">
          <button
            type="button"
            onClick={() => setModulesOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700"
          >
            <span>Customize modules for this person</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", modulesOpen && "rotate-180")} />
          </button>
          {modulesOpen ? (
            <div className="flex flex-wrap gap-2 border-t border-slate-100 px-3 py-3">
              {CAPABILITY_OVERRIDE_OPTIONS.map((option) => (
                <ModulePill
                  key={option.key}
                  label={option.shortLabel}
                  active={effectiveOverrideEnabled(permissionLevel, overrides, option.key)}
                  preset={presetOverrideEnabled(permissionLevel, option.key)}
                  onClick={() => patchModule(option.key)}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {hasMultipleLocations ? (
        <div className="rounded-lg border border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={() => setLocationsOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700"
          >
            <span>Branch access</span>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", locationsOpen && "rotate-180")}
            />
          </button>
          {locationsOpen ? (
            <div className="border-t border-slate-100 px-3 py-3">
              <LocationAccessFields
                compact
                locations={config.locations}
                primaryLocationId={primaryLocationId}
                locationAccess={locationAccess ?? "all"}
                onPrimaryChange={onPrimaryLocationChange}
                onAccessChange={onLocationAccessChange}
              />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
