"use client";

import { parseDateKey } from "@/lib/calendar/date-utils";
import { useClientReady } from "@/lib/hooks/use-client-ready";
import { buildRollingMockTimeEntries } from "@/lib/payroll/mock-time-entries";
import {
  mergeOfficeClockIntoEntries,
  subscribeOfficeClock,
} from "@/lib/payroll/office-time-clock-storage";
import { entriesForWeek } from "@/lib/payroll/time-entry-utils";
import type { TimeEntry } from "@/lib/payroll/types";
import { useBusinessCalendar } from "@/lib/settings/use-business-calendar";
import { useEffect, useMemo, useState } from "react";

/** Billable crew hours for the week containing `dateKey`, keyed by fleet crew id. */
export function useCrewWeeklyHours(dateKey: string): Map<string, number> {
  const { startOfWeek } = useBusinessCalendar();
  const clientReady = useClientReady();
  const [entries, setEntries] = useState<TimeEntry[]>(() => buildRollingMockTimeEntries());

  useEffect(() => {
    if (!clientReady) return;
    const sync = () => setEntries(mergeOfficeClockIntoEntries(buildRollingMockTimeEntries()));
    sync();
    const unsub = subscribeOfficeClock(sync);
    const intervalId = window.setInterval(sync, 30_000);
    return () => {
      unsub();
      window.clearInterval(intervalId);
    };
  }, [clientReady]);

  return useMemo(() => {
    const weekStart = startOfWeek(parseDateKey(dateKey));
    const weekEntries = entriesForWeek(entries, weekStart).filter((e) => e.workerType === "crew");
    const byPerson = new Map<string, number>();
    for (const entry of weekEntries) {
      byPerson.set(entry.personId, (byPerson.get(entry.personId) ?? 0) + entry.hours);
    }
    for (const [personId, hours] of byPerson) {
      byPerson.set(personId, Math.round(hours * 100) / 100);
    }
    return byPerson;
  }, [dateKey, entries, startOfWeek]);
}
