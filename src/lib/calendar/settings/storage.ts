import { normalizeDayShareSettings } from "@/lib/day-share/settings-defaults";
import { defaultCalendarPalette, mergeCalendarPalette } from "./color-palette";
import { federalHolidays2026WithIds, mergeFederalHolidays } from "./federal-holidays-2026";
import { normalizeLocationSettings } from "./location-settings";
import type { CalendarLocationSettings, CalendarSettings } from "./types";

const CALENDAR_SETTINGS_KEY = "jm-calendar-settings";

function defaultCompanySettings(): CalendarLocationSettings {
  return {
    closedDays: federalHolidays2026WithIds(),
    federalHolidayBookedDates: [],
    removedFederalDates: [],
    colorPalette: defaultCalendarPalette(),
    dayShareSettings: normalizeDayShareSettings(),
  };
}

export function defaultCalendarSettings(): CalendarSettings {
  return {
    version: 3,
    companyDefaults: defaultCompanySettings(),
    locationOverrides: {},
  };
}

function migrateV2ToV3(parsed: {
  closedDays?: CalendarLocationSettings["closedDays"];
  federalHolidayBookedDates?: string[];
  colorPalette?: CalendarLocationSettings["colorPalette"];
  colors?: unknown;
}): CalendarSettings {
  const defaults = defaultCompanySettings();
  const closedDays = mergeFederalHolidays(
    parsed.closedDays?.length ? parsed.closedDays : defaults.closedDays,
  );
  const colorPalette =
    parsed.colorPalette != null
      ? mergeCalendarPalette(parsed.colorPalette)
      : defaults.colorPalette;

  return {
    version: 3,
    companyDefaults: {
      closedDays,
      federalHolidayBookedDates: parsed.federalHolidayBookedDates ?? [],
      removedFederalDates: [],
      colorPalette,
      dayShareSettings: defaults.dayShareSettings,
    },
    locationOverrides: {},
  };
}

export function loadCalendarSettings(): CalendarSettings {
  if (typeof window === "undefined") return defaultCalendarSettings();
  try {
    const raw = localStorage.getItem(CALENDAR_SETTINGS_KEY);
    if (!raw) return defaultCalendarSettings();
    const parsed = JSON.parse(raw) as Partial<CalendarSettings> & {
      version?: number;
      closedDays?: CalendarLocationSettings["closedDays"];
      federalHolidayBookedDates?: string[];
      colorPalette?: CalendarLocationSettings["colorPalette"];
      colors?: unknown;
    };

    if (parsed.version === 3 && parsed.companyDefaults) {
      return {
        version: 3,
        companyDefaults: normalizeLocationSettings(parsed.companyDefaults),
        locationOverrides:
          parsed.locationOverrides && typeof parsed.locationOverrides === "object"
            ? Object.fromEntries(
                Object.entries(parsed.locationOverrides).map(([id, val]) => {
                  if (!val || typeof val !== "object") return [id, { useCompanyDefault: true }];
                  const o = val as { useCompanyDefault?: boolean; settings?: unknown };
                  return [
                    id,
                    {
                      useCompanyDefault: o.useCompanyDefault !== false,
                      settings: o.settings
                        ? normalizeLocationSettings(o.settings)
                        : undefined,
                    },
                  ];
                }),
              )
            : {},
      };
    }

    return migrateV2ToV3(parsed);
  } catch {
    return defaultCalendarSettings();
  }
}

export function saveCalendarSettings(settings: CalendarSettings): void {
  localStorage.setItem(CALENDAR_SETTINGS_KEY, JSON.stringify(settings));
}

export function generateClosedDayId(): string {
  return `closed-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
