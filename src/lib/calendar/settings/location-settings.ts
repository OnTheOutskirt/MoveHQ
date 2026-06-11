import { normalizeDayShareSettings } from "@/lib/day-share/settings-defaults";
import { defaultCalendarPalette, mergeCalendarPalette } from "./color-palette";
import { mergeFederalHolidays } from "./federal-holidays-2026";
import type {
  CalendarLocationSettings,
  CalendarSettings,
  LocationCalendarSettingsOverride,
} from "./types";

export function normalizeLocationSettings(raw: unknown): CalendarLocationSettings {
  const palette = defaultCalendarPalette();
  if (!raw || typeof raw !== "object") {
    return {
      closedDays: [],
      federalHolidayBookedDates: [],
      colorPalette: palette,
      dayShareSettings: normalizeDayShareSettings(),
    };
  }
  const s = raw as Partial<CalendarLocationSettings>;
  return {
    closedDays: Array.isArray(s.closedDays) ? s.closedDays : [],
    federalHolidayBookedDates: Array.isArray(s.federalHolidayBookedDates)
      ? s.federalHolidayBookedDates
      : [],
    colorPalette: s.colorPalette ? mergeCalendarPalette(s.colorPalette) : palette,
    dayShareSettings: normalizeDayShareSettings(s.dayShareSettings),
  };
}

export function resolveLocationCalendarSettings(
  store: CalendarSettings,
  locationId: string,
): CalendarLocationSettings {
  const override = store.locationOverrides[locationId];
  if (override && !override.useCompanyDefault && override.settings) {
    return {
      closedDays: mergeFederalHolidays(override.settings.closedDays),
      federalHolidayBookedDates: override.settings.federalHolidayBookedDates,
      colorPalette: override.settings.colorPalette,
      dayShareSettings: override.settings.dayShareSettings,
    };
  }
  return {
    closedDays: mergeFederalHolidays(store.companyDefaults.closedDays),
    federalHolidayBookedDates: store.companyDefaults.federalHolidayBookedDates,
    colorPalette: store.companyDefaults.colorPalette,
    dayShareSettings: store.companyDefaults.dayShareSettings,
  };
}

export function locationUsesCompanyDefault(store: CalendarSettings, locationId: string): boolean {
  const override = store.locationOverrides[locationId];
  return override?.useCompanyDefault !== false;
}

export function setLocationUsesCompanyDefault(
  store: CalendarSettings,
  locationId: string,
  useCompanyDefault: boolean,
): CalendarSettings {
  const existing = store.locationOverrides[locationId];
  if (useCompanyDefault) {
    return {
      ...store,
      locationOverrides: {
        ...store.locationOverrides,
        [locationId]: {
          useCompanyDefault: true,
          settings: existing?.settings,
        },
      },
    };
  }
  const base = resolveLocationCalendarSettings(store, locationId);
  return {
    ...store,
    locationOverrides: {
      ...store.locationOverrides,
      [locationId]: {
        useCompanyDefault: false,
        settings: existing?.settings ?? base,
      },
    },
  };
}

export function patchLocationCalendarSettings(
  store: CalendarSettings,
  locationId: string,
  patch: Partial<CalendarLocationSettings>,
): CalendarSettings {
  const usesDefault = locationUsesCompanyDefault(store, locationId);
  if (usesDefault) {
    return {
      ...store,
      companyDefaults: {
        ...store.companyDefaults,
        ...patch,
        closedDays: patch.closedDays ?? store.companyDefaults.closedDays,
        colorPalette: patch.colorPalette ?? store.companyDefaults.colorPalette,
      },
    };
  }
  const override = store.locationOverrides[locationId] ?? { useCompanyDefault: false };
  const current = override.settings ?? resolveLocationCalendarSettings(store, locationId);
  return {
    ...store,
    locationOverrides: {
      ...store.locationOverrides,
      [locationId]: {
        useCompanyDefault: false,
        settings: { ...current, ...patch },
      },
    },
  };
}

/** Copy one location's effective settings to company defaults; all branches use defaults. */
export function applyLocationSettingsToAll(
  store: CalendarSettings,
  sourceLocationId: string,
): CalendarSettings {
  const effective = resolveLocationCalendarSettings(store, sourceLocationId);
  const locationOverrides: Record<string, LocationCalendarSettingsOverride> = {};
  for (const key of Object.keys(store.locationOverrides)) {
    locationOverrides[key] = { useCompanyDefault: true };
  }
  return {
    ...store,
    companyDefaults: effective,
    locationOverrides,
  };
}
