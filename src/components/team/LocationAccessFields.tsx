"use client";

import { SettingsField, SettingsSelect } from "@/components/settings/SettingsField";
import type { RoleLocationAccess } from "@/lib/team/role-templates";
import { locationAccessLabel } from "@/lib/team/role-templates";
import type { WorkspaceLocation } from "@/lib/workspace/types";
import { cn } from "@/lib/utils";

type LocationAccessFieldsProps = {
  locations: WorkspaceLocation[];
  primaryLocationId: string;
  locationAccess: RoleLocationAccess;
  onPrimaryChange: (id: string) => void;
  onAccessChange: (access: RoleLocationAccess) => void;
  compact?: boolean;
};

export function LocationAccessFields({
  locations,
  primaryLocationId,
  locationAccess,
  onPrimaryChange,
  onAccessChange,
  compact,
}: LocationAccessFieldsProps) {
  const activeLocations = locations.filter(
    (l) => l.status === "active" || l.status === "planned",
  );
  const mode =
    locationAccess === "all"
      ? "all"
      : locationAccess.length === 1 && locationAccess[0] === primaryLocationId
        ? "primary"
        : "custom";

  const nameMap = new Map(activeLocations.map((l) => [l.id, l.name]));

  return (
    <div className={cn("space-y-3", compact && "space-y-2")}>
      <SettingsField
        label="Location access"
        hint="Which branches this person can view and switch between."
      >
        <SettingsSelect
          value={mode}
          onChange={(e) => {
            const next = e.target.value;
            if (next === "all") onAccessChange("all");
            else if (next === "primary") onAccessChange([primaryLocationId]);
            else onAccessChange(locationAccess === "all" ? [primaryLocationId] : locationAccess);
          }}
        >
          <option value="all">All locations</option>
          <option value="primary">Primary branch only</option>
          <option value="custom">Selected branches</option>
        </SettingsSelect>
        <p className="mt-1 text-xs text-slate-500">
          {locationAccessLabel(locationAccess, nameMap)}
        </p>
      </SettingsField>

      <SettingsField label="Primary branch">
        <SettingsSelect
          value={primaryLocationId}
          onChange={(e) => {
            const id = e.target.value;
            onPrimaryChange(id);
            if (mode === "primary") onAccessChange([id]);
          }}
        >
          {activeLocations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </SettingsSelect>
      </SettingsField>

      {mode === "custom" ? (
        <fieldset className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Branches
          </legend>
          <ul className="mt-2 space-y-1.5">
            {activeLocations.map((loc) => {
              const selected =
                locationAccess !== "all" && locationAccess.includes(loc.id);
              return (
                <li key={loc.id}>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-800">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => {
                        const current =
                          locationAccess === "all" ? [] : [...locationAccess];
                        const next = e.target.checked
                          ? [...new Set([...current, loc.id])]
                          : current.filter((id) => id !== loc.id);
                        onAccessChange(next.length > 0 ? next : [primaryLocationId]);
                      }}
                      className="rounded border-slate-300"
                    />
                    {loc.name}
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      ) : null}
    </div>
  );
}
