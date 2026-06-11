"use client";

import { useFleet } from "@/components/providers/FleetProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { readDispatchAssignments } from "@/lib/dispatch/storage";
import { resolveJobDayDispatchDisplay, type JobDayDispatchDisplay } from "@/lib/moves/job-day-dispatch-display";
import type { MoveRecord } from "@/lib/moves/types";
import { useEffect, useMemo, useState } from "react";

export function useMoveJobDayDispatchMap(move: MoveRecord): Map<string, JobDayDispatchDisplay> {
  const { activeCrewForDispatch, activeTrucksForDispatch } = useFleet();
  const { settings } = useSettings();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    function refresh() {
      setRevision((n) => n + 1);
    }
    window.addEventListener("jm-dispatch-assignments", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("jm-dispatch-assignments", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return useMemo(() => {
    void revision;
    const store = readDispatchAssignments();
    const crewRoster = activeCrewForDispatch();
    const map = new Map<string, JobDayDispatchDisplay>();

    for (const day of move.jobDays) {
      const trucks = activeTrucksForDispatch(day.date);
      map.set(
        day.id,
        resolveJobDayDispatchDisplay(
          move,
          day,
          store,
          crewRoster,
          trucks,
          settings.terminology,
        ),
      );
    }

    return map;
  }, [
    move,
    revision,
    activeCrewForDispatch,
    activeTrucksForDispatch,
    settings.terminology,
  ]);
}
