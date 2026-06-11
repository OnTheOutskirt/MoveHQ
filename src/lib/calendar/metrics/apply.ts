import { resolveMetricsForLocation } from "./resolve";
import type { CalendarDayCardMetricsConfig, WorkspaceCalendarConfig } from "./types";

export function applyMetricsToAllLocations(
  calendar: WorkspaceCalendarConfig,
  sourceLocationId: string,
): WorkspaceCalendarConfig {
  const metrics = resolveMetricsForLocation(calendar, sourceLocationId);
  const locationOverrides = { ...calendar.locationOverrides };
  for (const key of Object.keys(locationOverrides)) {
    locationOverrides[key] = {
      useCompanyDefault: true,
      metrics: locationOverrides[key]?.metrics,
    };
  }
  return {
    ...calendar,
    companyDefaults: {
      primary: metrics.primary.map((s) => ({ ...s })),
      secondary: metrics.secondary.map((s) => ({ ...s })),
    },
    locationOverrides,
  };
}

export function setMetricsUseCompanyDefault(
  calendar: WorkspaceCalendarConfig,
  locationId: string,
  useCompanyDefault: boolean,
): WorkspaceCalendarConfig {
  const existing = calendar.locationOverrides[locationId];
  return {
    ...calendar,
    locationOverrides: {
      ...calendar.locationOverrides,
      [locationId]: {
        useCompanyDefault,
        metrics: existing?.metrics,
      },
    },
  };
}

export function patchMetricsForSettingsLocation(
  calendar: WorkspaceCalendarConfig,
  locationId: string,
  useCompanyDefault: boolean,
  metrics: CalendarDayCardMetricsConfig,
): WorkspaceCalendarConfig {
  if (useCompanyDefault) {
    return { ...calendar, companyDefaults: metrics };
  }
  return {
    ...calendar,
    locationOverrides: {
      ...calendar.locationOverrides,
      [locationId]: { useCompanyDefault: false, metrics },
    },
  };
}
