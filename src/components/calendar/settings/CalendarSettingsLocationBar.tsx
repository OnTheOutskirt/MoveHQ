"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Copy } from "lucide-react";

type CalendarSettingsLocationBarProps = {
  className?: string;
};

export function CalendarSettingsLocationBar({ className }: CalendarSettingsLocationBarProps) {
  const { config, hasMultipleLocations, getLocationById } = useWorkspace();
  const {
    settingsLocationId,
    setSettingsLocationId,
    settingsUseCompanyDefault,
    setSettingsUseCompanyDefault,
    applySettingsToAllLocations,
  } = useCalendarSettings();

  const locationName = getLocationById(settingsLocationId)?.name ?? "Location";

  if (!hasMultipleLocations) {
    return (
      <p className={cn("text-xs text-slate-500", className)}>
        These settings apply to your company calendar.
      </p>
    );
  }

  return (
    <div className={cn("space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3", className)}>
      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-slate-600">Editing settings for</label>
        <select
          value={settingsLocationId}
          onChange={(e) => setSettingsLocationId(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
        >
          {config.locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
              {loc.isPrimary ? " (primary)" : ""}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={settingsUseCompanyDefault}
          onChange={(e) => setSettingsUseCompanyDefault(e.target.checked)}
          className="mt-0.5 rounded border-slate-300"
        />
        <span>
          Use company defaults for <span className="font-medium">{locationName}</span>
        </span>
      </label>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        className="w-full gap-1.5"
        onClick={applySettingsToAllLocations}
      >
        <Copy className="h-3.5 w-3.5" />
        Apply {locationName} settings to all locations
      </Button>
      <p className="text-[11px] leading-snug text-slate-500">
        Copies days off, colors, and day-card metrics from this branch to company defaults. Other
        branches will follow those defaults.
      </p>
    </div>
  );
}
