"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  countProgress,
  readProgress,
  setItemProgress,
  type ProgressMap,
} from "@/lib/planning/planning-progress";
import { allMeetingNotesItemIds } from "@/lib/planning/meeting-notes";
import { allV1ItemIds, allV2ItemIds } from "@/lib/planning/roadmap-data";

type ProgressStats = { done: number; total: number; pct: number };

type PlanningProgressContextValue = {
  /** Raw checkbox state (for per-section stats). */
  progress: ProgressMap;
  toggle: (id: string) => void;
  setDone: (id: string, done: boolean) => void;
  v1Stats: ProgressStats;
  v2Stats: ProgressStats;
  meetingNotesStats: ProgressStats;
  isDone: (id: string) => boolean;
};

const PlanningProgressContext = createContext<PlanningProgressContextValue | null>(null);

export function PlanningProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    setProgress(readProgress());
  }, []);

  const toggle = useCallback((id: string) => {
    setProgress((prev) => {
      const next = setItemProgress(id, !prev[id]);
      return next;
    });
  }, []);

  const setDone = useCallback((id: string, done: boolean) => {
    setProgress(() => setItemProgress(id, done));
  }, []);

  const isDone = useCallback((id: string) => Boolean(progress[id]), [progress]);

  const v1Ids = useMemo(() => allV1ItemIds(), []);
  const v2Ids = useMemo(() => allV2ItemIds(), []);
  const meetingNotesIds = useMemo(() => allMeetingNotesItemIds(), []);

  function toStats(ids: string[]): ProgressStats {
    const { done, total } = countProgress(ids, progress);
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  const v1Stats = useMemo(() => toStats(v1Ids), [progress, v1Ids]);
  const v2Stats = useMemo(() => toStats(v2Ids), [progress, v2Ids]);
  const meetingNotesStats = useMemo(() => toStats(meetingNotesIds), [progress, meetingNotesIds]);

  const value = useMemo(
    () => ({ progress, toggle, setDone, v1Stats, v2Stats, meetingNotesStats, isDone }),
    [progress, toggle, setDone, v1Stats, v2Stats, meetingNotesStats, isDone],
  );

  return (
    <PlanningProgressContext.Provider value={value}>{children}</PlanningProgressContext.Provider>
  );
}

export function usePlanningProgress() {
  const ctx = useContext(PlanningProgressContext);
  if (!ctx) {
    throw new Error("usePlanningProgress must be used within PlanningProgressProvider");
  }
  return ctx;
}
