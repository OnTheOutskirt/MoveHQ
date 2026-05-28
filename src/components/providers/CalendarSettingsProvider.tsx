"use client";

import { expandPaletteToTheme } from "@/lib/calendar/settings/color-derive";
import {
  defaultCalendarPalette,
  normalizeHex,
  type CalendarColorPalette,
} from "@/lib/calendar/settings/color-palette";
import type { CalendarColorTheme } from "@/lib/calendar/settings/colors";
import {
  defaultCalendarSettings,
  generateClosedDayId,
  loadCalendarSettings,
  saveCalendarSettings,
} from "@/lib/calendar/settings/storage";
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
  closedDays: ClosedDayEntry[];
  federalHolidayBookedDates: string[];
  colorPalette: CalendarColorPalette;
  colors: CalendarColorTheme;
  isReady: boolean;
  addClosedDay: (entry: Omit<ClosedDayEntry, "id">) => void;
  updateClosedDay: (id: string, patch: Partial<Pick<ClosedDayEntry, "date" | "label">>) => void;
  removeClosedDay: (id: string) => void;
  removeClosedDayForDate: (dateKey: string) => void;
  setFederalHolidayBooked: (dateKey: string, booked: boolean) => void;
  updatePaletteColor: (key: keyof CalendarColorPalette, value: string) => void;
  resetColors: () => void;
};

const CalendarSettingsContext = createContext<CalendarSettingsContextValue | null>(null);

export function CalendarSettingsProvider({ children }: { children: React.ReactNode }) {
  const defaults = defaultCalendarSettings();
  const [closedDays, setClosedDays] = useState<ClosedDayEntry[]>(defaults.closedDays);
  const [federalHolidayBookedDates, setFederalHolidayBookedDates] = useState<string[]>(
    defaults.federalHolidayBookedDates,
  );
  const [colorPalette, setColorPalette] = useState<CalendarColorPalette>(defaults.colorPalette);
  const [isReady, setIsReady] = useState(false);

  const colors = useMemo(() => expandPaletteToTheme(colorPalette), [colorPalette]);

  const snapshotRef = useRef<CalendarSettings>(defaults);

  const syncSnapshot = useCallback((patch: Partial<CalendarSettings>) => {
    const next: CalendarSettings = {
      version: 2,
      closedDays: patch.closedDays ?? snapshotRef.current.closedDays,
      federalHolidayBookedDates:
        patch.federalHolidayBookedDates ?? snapshotRef.current.federalHolidayBookedDates,
      colorPalette: patch.colorPalette ?? snapshotRef.current.colorPalette,
    };
    snapshotRef.current = next;
    saveCalendarSettings(next);
  }, []);

  useEffect(() => {
    const loaded = loadCalendarSettings();
    setClosedDays(loaded.closedDays);
    setFederalHolidayBookedDates(loaded.federalHolidayBookedDates);
    setColorPalette(loaded.colorPalette);
    snapshotRef.current = loaded;
    saveCalendarSettings(loaded);
    setIsReady(true);
  }, []);

  const addClosedDay = useCallback(
    (entry: Omit<ClosedDayEntry, "id">) => {
      setClosedDays((prev) => {
        const withoutDate = prev.filter((e) => e.date !== entry.date);
        const next = [...withoutDate, { ...entry, id: generateClosedDayId() }].sort((a, b) =>
          a.date.localeCompare(b.date),
        );
        syncSnapshot({ closedDays: next });
        return next;
      });
    },
    [syncSnapshot],
  );

  const updateClosedDay = useCallback(
    (id: string, patch: Partial<Pick<ClosedDayEntry, "date" | "label">>) => {
      setClosedDays((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, ...patch } : e));
        syncSnapshot({ closedDays: next });
        return next;
      });
    },
    [syncSnapshot],
  );

  const removeClosedDay = useCallback(
    (id: string) => {
      setClosedDays((prev) => {
        const removed = prev.find((e) => e.id === id);
        const next = prev.filter((e) => e.id !== id);
        const nextFederal = removed
          ? federalHolidayBookedDates.filter((d) => d !== removed.date)
          : federalHolidayBookedDates;
        setFederalHolidayBookedDates(nextFederal);
        syncSnapshot({ closedDays: next, federalHolidayBookedDates: nextFederal });
        return next;
      });
    },
    [federalHolidayBookedDates, syncSnapshot],
  );

  const removeClosedDayForDate = useCallback(
    (dateKey: string) => {
      setClosedDays((prev) => {
        const next = prev.filter((e) => e.date !== dateKey);
        const nextFederal = federalHolidayBookedDates.filter((d) => d !== dateKey);
        setFederalHolidayBookedDates(nextFederal);
        syncSnapshot({ closedDays: next, federalHolidayBookedDates: nextFederal });
        return next;
      });
    },
    [federalHolidayBookedDates, syncSnapshot],
  );

  const setFederalHolidayBooked = useCallback(
    (dateKey: string, booked: boolean) => {
      setFederalHolidayBookedDates((prev) => {
        const next = booked
          ? prev.includes(dateKey)
            ? prev
            : [...prev, dateKey]
          : prev.filter((d) => d !== dateKey);
        syncSnapshot({ federalHolidayBookedDates: next });
        return next;
      });
    },
    [syncSnapshot],
  );

  const updatePaletteColor = useCallback(
    (key: keyof CalendarColorPalette, value: string) => {
      setColorPalette((prev) => {
        const next = {
          ...prev,
          [key]: normalizeHex(value, prev[key]),
        };
        syncSnapshot({ colorPalette: next });
        return next;
      });
    },
    [syncSnapshot],
  );

  const resetColors = useCallback(() => {
    const next = defaultCalendarPalette();
    setColorPalette(next);
    syncSnapshot({ colorPalette: next });
  }, [syncSnapshot]);

  const value = useMemo(
    () => ({
      closedDays,
      federalHolidayBookedDates,
      colorPalette,
      colors,
      isReady,
      addClosedDay,
      updateClosedDay,
      removeClosedDay,
      removeClosedDayForDate,
      setFederalHolidayBooked,
      updatePaletteColor,
      resetColors,
    }),
    [
      closedDays,
      federalHolidayBookedDates,
      colorPalette,
      colors,
      isReady,
      addClosedDay,
      updateClosedDay,
      removeClosedDay,
      removeClosedDayForDate,
      setFederalHolidayBooked,
      updatePaletteColor,
      resetColors,
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
