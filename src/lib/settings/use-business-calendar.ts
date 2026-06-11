"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { calendarFromCompany } from "@/lib/settings/business-calendar";
import { calendarFromLocation } from "@/lib/workspace/location-profile";
import { useMemo } from "react";

export function useBusinessCalendar() {
  const { settings } = useSettings();
  const { activeLocation, config } = useWorkspace();

  const location =
    activeLocation ?? config.locations.find((l) => l.isPrimary) ?? config.locations[0];

  return useMemo(
    () =>
      location ? calendarFromLocation(location) : calendarFromCompany(settings.company),
    [location, settings.company],
  );
}
