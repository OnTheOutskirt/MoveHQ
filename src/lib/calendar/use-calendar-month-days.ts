"use client";

import { useCalendarPlacements } from "@/components/providers/CalendarPlacementProvider";
import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { useFleet } from "@/components/providers/FleetProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import { mergePlacementsIntoDays } from "@/lib/calendar/placement";
import { buildMockMonth } from "@/lib/calendar/mock-data";
import type { CalendarDayData } from "@/lib/calendar/types";
import { computeOpenSlotsForDay } from "@/lib/day-share/compute-open-slots";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { useEffect, useMemo, useState } from "react";

/** Build move-calendar day cells for a month (same data as the main calendar page). */
export function useCalendarMonthDays(anchor: Date) {
  const { today, openDays } = useBusinessCalendar();
  const {
    closedDays,
    federalHolidayBookedDates,
    isReady,
    dayShareSettings,
  } = useCalendarSettings();
  const { isReady: fleetReady, getTruckCapacityForDate } = useFleet();
  const { moves } = useMoves();
  const { placements, isReady: placementsReady } = useCalendarPlacements();
  const [baseDays, setBaseDays] = useState<Record<string, CalendarDayData>>({});

  function withFleetTruckCapacity(map: Record<string, CalendarDayData>) {
    if (!fleetReady) return map;
    const next = { ...map };
    for (const key of Object.keys(next)) {
      if (next[key].isClosed) continue;
      next[key] = {
        ...next[key],
        trucksCapacity: getTruckCapacityForDate(key),
      };
    }
    return next;
  }

  useEffect(() => {
    if (!isReady) return;
    setBaseDays(
      withFleetTruckCapacity(
        buildMockMonth(anchor, today, closedDays, federalHolidayBookedDates, openDays),
      ),
    );
  }, [
    isReady,
    fleetReady,
    anchor,
    today,
    closedDays,
    federalHolidayBookedDates,
    getTruckCapacityForDate,
    openDays,
  ]);

  const days = useMemo(() => {
    const withPlacements = placementsReady
      ? mergePlacementsIntoDays(baseDays, placements)
      : baseDays;
    const next = { ...withPlacements };
    for (const key of Object.keys(next)) {
      const day = next[key];
      if (!day || day.isClosed) continue;
      const computed = computeOpenSlotsForDay(moves, key, dayShareSettings);
      if (computed.length > 0) {
        next[key] = { ...day, ftas: computed };
      }
    }
    return next;
  }, [baseDays, placements, placementsReady, moves, dayShareSettings]);

  return { days, today, isReady: isReady && fleetReady && placementsReady };
}
