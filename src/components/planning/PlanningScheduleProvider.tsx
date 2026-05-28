"use client";

import {
  GANTT_BARS,
  PLAN_END,
  PLAN_START,
  TIMELINE_TABLE,
} from "@/lib/planning/roadmap-data";
import {
  mergeGanttBars,
  mergeTimelineRows,
  planRangeFromBars,
  readScheduleOverrides,
  setTimelineRowDates,
  writeScheduleOverrides,
  type ScheduleOverrides,
} from "@/lib/planning/planning-schedule";
import type { GanttBar, TimelineRow } from "@/lib/planning/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PlanningScheduleContextValue = {
  timelineRows: TimelineRow[];
  ganttBars: GanttBar[];
  planStart: string;
  planEnd: string;
  updateTimelineRow: (rowId: string, start: string, end: string) => void;
};

const PlanningScheduleContext = createContext<PlanningScheduleContextValue | null>(null);

export function PlanningScheduleProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<ScheduleOverrides>({});

  useEffect(() => {
    setOverrides(readScheduleOverrides());
  }, []);

  const timelineRows = useMemo(
    () => mergeTimelineRows(TIMELINE_TABLE, overrides),
    [overrides],
  );

  const ganttBars = useMemo(
    () => mergeGanttBars(GANTT_BARS, timelineRows, overrides),
    [timelineRows, overrides],
  );

  const { start: planStart, end: planEnd } = useMemo(() => {
    const fromBars = planRangeFromBars(ganttBars);
    return {
      start: fromBars.start < PLAN_START ? PLAN_START : fromBars.start,
      end: fromBars.end > PLAN_END ? fromBars.end : PLAN_END,
    };
  }, [ganttBars]);

  const updateTimelineRow = useCallback((rowId: string, start: string, end: string) => {
    if (!start || !end || start > end) return;
    setOverrides((prev) => {
      const next = setTimelineRowDates(prev, rowId, start, end);
      writeScheduleOverrides(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ timelineRows, ganttBars, planStart, planEnd, updateTimelineRow }),
    [timelineRows, ganttBars, planStart, planEnd, updateTimelineRow],
  );

  return (
    <PlanningScheduleContext.Provider value={value}>{children}</PlanningScheduleContext.Provider>
  );
}

export function usePlanningSchedule() {
  const ctx = useContext(PlanningScheduleContext);
  if (!ctx) {
    throw new Error("usePlanningSchedule must be used within PlanningScheduleProvider");
  }
  return ctx;
}
