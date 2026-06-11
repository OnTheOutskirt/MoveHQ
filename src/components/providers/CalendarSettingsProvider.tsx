"use client";

import { useWorkspace } from "@/components/providers/WorkspaceProvider";
import { expandPaletteToTheme } from "@/lib/calendar/settings/color-derive";
import {
  defaultCalendarPalette,
  normalizeHex,
  type CalendarColorPalette,
} from "@/lib/calendar/settings/color-palette";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import {
  applyMetricsToAllLocations,
  setMetricsUseCompanyDefault,
} from "@/lib/calendar/metrics/apply";
import {
  applyLocationSettingsToAll,
  locationUsesCompanyDefault,
  patchLocationCalendarSettings,
  resolveLocationCalendarSettings,
  setLocationUsesCompanyDefault,
} from "@/lib/calendar/settings/location-settings";
import {
  defaultCalendarSettings,
  generateClosedDayId,
  loadCalendarSettings,
  saveCalendarSettings,
} from "@/lib/calendar/settings/storage";
import { normalizeDayShareSettings } from "@/lib/day-share/settings-defaults";
import type { DayShareSettings } from "@/lib/day-share/types";
import type { CalendarSettings, ClosedDayEntry } from "@/lib/calendar/settings/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type CalendarSettingsContextValue = {
  /** Effective settings for the calendar view (active workspace location). */
  closedDays: ClosedDayEntry[];
  federalHolidayBookedDates: string[];
  colorPalette: CalendarColorPalette;
  colors: CalendarColorTheme;
  /** Settings sidebar — location selected in the editor. */
  settingsClosedDays: ClosedDayEntry[];
  settingsFederalHolidayBookedDates: string[];
  settingsColorPalette: CalendarColorPalette;
  settingsColors: CalendarColorTheme;
  isReady: boolean;
  viewLocationId: string;
  /** Location being edited in Move Calendar Settings. */
  settingsLocationId: string;
  setSettingsLocationId: (id: string) => void;
  settingsUseCompanyDefault: boolean;
  setSettingsUseCompanyDefault: (useDefault: boolean) => void;
  applySettingsToAllLocations: () => void;
  addClosedDay: (entry: Omit<ClosedDayEntry, "id">) => void;
  updateClosedDay: (id: string, patch: Partial<Pick<ClosedDayEntry, "date" | "label">>) => void;
  removeClosedDay: (id: string) => void;
  removeClosedDayForDate: (dateKey: string) => void;
  setFederalHolidayBooked: (dateKey: string, booked: boolean) => void;
  updatePaletteColor: (key: keyof CalendarColorPalette, value: string) => void;
  resetColors: () => void;
  dayShareSettings: DayShareSettings;
  settingsDayShareSettings: DayShareSettings;
  updateDayShareSettings: (patch: Partial<DayShareSettings>) => void;
};

const CalendarSettingsContext = createContext<CalendarSettingsContextValue | null>(null);

function primaryLocationId(locations: { id: string; isPrimary?: boolean }[]): string {
  return locations.find((l) => l.isPrimary)?.id ?? locations[0]?.id ?? "";
}

export function CalendarSettingsProvider({ children }: { children: React.ReactNode }) {
  const { config, updateConfig, activeLocation, hasMultipleLocations } = useWorkspace();
  const viewLocationId =
    activeLocation?.id ?? primaryLocationId(config.locations);

  const [store, setStore] = useState<CalendarSettings>(() => defaultCalendarSettings());
  const [settingsLocationId, setSettingsLocationId] = useState(viewLocationId);
  const [isReady, setIsReady] = useState(false);
  const storeRef = useRef(store);

  useEffect(() => {
    setSettingsLocationId((prev) => {
      const ids = new Set(config.locations.map((l) => l.id));
      if (ids.has(prev)) return prev;
      return viewLocationId;
    });
  }, [config.locations, viewLocationId]);

  useEffect(() => {
    if (!hasMultipleLocations) return;
    setSettingsLocationId(viewLocationId);
  }, [viewLocationId, hasMultipleLocations]);

  const persist = useCallback((next: CalendarSettings) => {
    storeRef.current = next;
    setStore(next);
    saveCalendarSettings(next);
  }, []);

  useEffect(() => {
    const loaded = loadCalendarSettings();
    storeRef.current = loaded;
    setStore(loaded);
    setIsReady(true);
  }, []);

  const viewResolved = useMemo(
    () => resolveLocationCalendarSettings(store, viewLocationId),
    [store, viewLocationId],
  );

  const settingsResolved = useMemo(
    () => resolveLocationCalendarSettings(store, settingsLocationId),
    [store, settingsLocationId],
  );

  const colors = useMemo(
    () => expandPaletteToTheme(viewResolved.colorPalette),
    [viewResolved.colorPalette],
  );

  const settingsColors = useMemo(
    () => expandPaletteToTheme(settingsResolved.colorPalette),
    [settingsResolved.colorPalette],
  );

  const settingsUseCompanyDefault = useMemo(
    () =>
      !hasMultipleLocations || locationUsesCompanyDefault(store, settingsLocationId),
    [store, settingsLocationId, hasMultipleLocations],
  );

  const patchSettings = useCallback(
    (patch: Parameters<typeof patchLocationCalendarSettings>[2]) => {
      const targetId = hasMultipleLocations ? settingsLocationId : viewLocationId;
      persist(patchLocationCalendarSettings(storeRef.current, targetId, patch));
    },
    [hasMultipleLocations, settingsLocationId, viewLocationId, persist],
  );

  const setSettingsUseCompanyDefault = useCallback(
    (useDefault: boolean) => {
      if (!hasMultipleLocations) return;
      persist(setLocationUsesCompanyDefault(storeRef.current, settingsLocationId, useDefault));
      updateConfig({
        ...config,
        calendar: setMetricsUseCompanyDefault(config.calendar, settingsLocationId, useDefault),
      });
    },
    [hasMultipleLocations, settingsLocationId, persist, config, updateConfig],
  );

  const applySettingsToAllLocations = useCallback(() => {
    persist(applyLocationSettingsToAll(storeRef.current, settingsLocationId));
    updateConfig({
      ...config,
      calendar: applyMetricsToAllLocations(config.calendar, settingsLocationId),
    });
  }, [settingsLocationId, persist, config, updateConfig]);

  const addClosedDay = useCallback(
    (entry: Omit<ClosedDayEntry, "id">) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const withoutDate = target.closedDays.filter((e) => e.date !== entry.date);
      const next = [...withoutDate, { ...entry, id: generateClosedDayId() }].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      patchSettings({ closedDays: next });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const updateClosedDay = useCallback(
    (id: string, patch: Partial<Pick<ClosedDayEntry, "date" | "label">>) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const next = target.closedDays.map((e) => (e.id === id ? { ...e, ...patch } : e));
      patchSettings({ closedDays: next });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const removeClosedDay = useCallback(
    (id: string) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const removed = target.closedDays.find((e) => e.id === id);
      const next = target.closedDays.filter((e) => e.id !== id);
      const nextFederal = removed
        ? target.federalHolidayBookedDates.filter((d) => d !== removed.date)
        : target.federalHolidayBookedDates;
      patchSettings({ closedDays: next, federalHolidayBookedDates: nextFederal });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const removeClosedDayForDate = useCallback(
    (dateKey: string) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const next = target.closedDays.filter((e) => e.date !== dateKey);
      const nextFederal = target.federalHolidayBookedDates.filter((d) => d !== dateKey);
      patchSettings({ closedDays: next, federalHolidayBookedDates: nextFederal });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const setFederalHolidayBooked = useCallback(
    (dateKey: string, booked: boolean) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const next = booked
        ? target.federalHolidayBookedDates.includes(dateKey)
          ? target.federalHolidayBookedDates
          : [...target.federalHolidayBookedDates, dateKey]
        : target.federalHolidayBookedDates.filter((d) => d !== dateKey);
      patchSettings({ federalHolidayBookedDates: next });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const updatePaletteColor = useCallback(
    (key: keyof CalendarColorPalette, value: string) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const next = {
        ...target.colorPalette,
        [key]: normalizeHex(value, target.colorPalette[key]),
      };
      patchSettings({ colorPalette: next });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const resetColors = useCallback(() => {
    patchSettings({ colorPalette: defaultCalendarPalette() });
  }, [patchSettings]);

  const updateDayShareSettings = useCallback(
    (patch: Partial<DayShareSettings>) => {
      const target = hasMultipleLocations ? settingsResolved : viewResolved;
      const next = normalizeDayShareSettings({ ...target.dayShareSettings, ...patch });
      patchSettings({ dayShareSettings: next });
    },
    [hasMultipleLocations, settingsResolved, viewResolved, patchSettings],
  );

  const value = useMemo<CalendarSettingsContextValue>(
    () => ({
      closedDays: viewResolved.closedDays,
      federalHolidayBookedDates: viewResolved.federalHolidayBookedDates,
      colorPalette: viewResolved.colorPalette,
      colors,
      settingsClosedDays: settingsResolved.closedDays,
      settingsFederalHolidayBookedDates: settingsResolved.federalHolidayBookedDates,
      settingsColorPalette: settingsResolved.colorPalette,
      settingsColors,
      isReady,
      viewLocationId,
      settingsLocationId,
      setSettingsLocationId,
      settingsUseCompanyDefault,
      setSettingsUseCompanyDefault,
      applySettingsToAllLocations,
      addClosedDay,
      updateClosedDay,
      removeClosedDay,
      removeClosedDayForDate,
      setFederalHolidayBooked,
      updatePaletteColor,
      resetColors,
      dayShareSettings: viewResolved.dayShareSettings,
      settingsDayShareSettings: settingsResolved.dayShareSettings,
      updateDayShareSettings,
    }),
    [
      viewResolved,
      settingsResolved,
      colors,
      settingsColors,
      isReady,
      viewLocationId,
      settingsLocationId,
      settingsUseCompanyDefault,
      setSettingsUseCompanyDefault,
      applySettingsToAllLocations,
      addClosedDay,
      updateClosedDay,
      removeClosedDay,
      removeClosedDayForDate,
      setFederalHolidayBooked,
      updatePaletteColor,
      resetColors,
      updateDayShareSettings,
    ],
  );

  return (
    <CalendarSettingsContext.Provider value={value}>{children}</CalendarSettingsContext.Provider>
  );
}

export function useCalendarSettings() {
  const ctx = useContext(CalendarSettingsContext);
  if (!ctx) {
    throw new Error("useCalendarSettings must be used within CalendarSettingsProvider");
  }
  return ctx;
}
