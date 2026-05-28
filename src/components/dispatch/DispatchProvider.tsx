"use client";

import { collectDispatchDay } from "@/lib/dispatch/collect-day-jobs";
import { crewOffIdsFromCalendarNames } from "@/lib/dispatch/mock-roster";
import { useFleet } from "@/components/providers/FleetProvider";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey } from "@/lib/calendar/date-utils";
import {
  ensureDriverMoverLengths,
  setSlotCrew,
  type CrewSlotRef,
} from "@/lib/dispatch/crew-slots";
import {
  clampCrew,
  clampTrucks,
  effectiveDispatchJob,
  effectiveRequirements,
  trimAssignmentToRequirements,
} from "@/lib/dispatch/job-requirements";
import {
  getJobAssignment,
  readDispatchAssignments,
  setJobAssignment,
  writeDispatchAssignments,
  type DispatchAssignmentStore,
} from "@/lib/dispatch/storage";
import {
  evaluateDayRequirements,
  type DispatchDayRequirements,
} from "@/lib/dispatch/day-requirements";
import {
  evaluateDispatchSchedule,
  collectAssignedIds,
  type DispatchScheduleStatus,
} from "@/lib/dispatch/schedule-status";
import {
  getPublishRecord,
  readDispatchPublishStore,
  setPublishRecord,
  writeDispatchPublishStore,
  type DispatchPublishRecord,
} from "@/lib/dispatch/publish-storage";
import type { DispatchDaySnapshot, DispatchJob, DispatchJobAssignment } from "@/lib/dispatch/types";
import { useMoves } from "@/components/moves/MovesProvider";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type DispatchContextValue = {
  dateKey: string;
  setDateKey: (key: string) => void;
  day: DispatchDaySnapshot;
  assignments: DispatchAssignmentStore;
  getAssignment: (jobId: string) => DispatchJobAssignment;
  getAssignmentForJob: (job: DispatchJob) => DispatchJobAssignment;
  assignCrewSlot: (jobId: string, slot: CrewSlotRef, crewId: string | null) => void;
  setTrucks: (jobId: string, truckIds: string[]) => void;
  assignTruck: (jobId: string, truckId: string) => void;
  unassignTruck: (jobId: string, truckId: string) => void;
  setDispatchNotes: (jobId: string, notes: string) => void;
  setJobNote: (jobId: string, note: string) => void;
  setCrewSizeNeeded: (jobId: string, size: number) => void;
  setTrucksNeeded: (jobId: string, count: number) => void;
  resetCrewSizeToPlanned: (jobId: string) => void;
  resetTrucksToPlanned: (jobId: string) => void;
  crewOffIds: string[];
  crewOff: DispatchDaySnapshot["crewOff"];
  assignedCrewIds: Set<string>;
  assignedTruckIds: Set<string>;
  scheduleStatus: DispatchScheduleStatus;
  dayRequirements: DispatchDayRequirements;
  publishRecord: DispatchPublishRecord | null;
  publishToCrewApp: () => void;
};

const DispatchContext = createContext<DispatchContextValue | null>(null);

type DispatchProviderProps = {
  children: ReactNode;
  initialDateKey: string;
};

export function DispatchProvider({ children, initialDateKey }: DispatchProviderProps) {
  const { moves } = useMoves();
  const { activeCrewForDispatch } = useFleet();
  const [dateKey, setDateKey] = useState(initialDateKey);
  const [assignments, setAssignments] = useState<DispatchAssignmentStore>({});
  const [publishStore, setPublishStore] = useState(() => readDispatchPublishStore());

  useEffect(() => {
    setAssignments(readDispatchAssignments());
    setPublishStore(readDispatchPublishStore());
  }, []);

  const day = useMemo(() => {
    const snapshot = collectDispatchDay(moves, dateKey);
    const calendarDay = buildMockDay(parseDateKey(dateKey));
    const crewOffIds = crewOffIdsFromCalendarNames(
      calendarDay.crewOff,
      activeCrewForDispatch(),
    );
    return {
      ...snapshot,
      crewOffIds,
      crewOff: calendarDay.crewOff,
    };
  }, [moves, dateKey, activeCrewForDispatch]);

  const persist = useCallback((next: DispatchAssignmentStore) => {
    setAssignments(next);
    writeDispatchAssignments(next);
  }, []);

  const findJob = useCallback(
    (jobId: string) => day.jobs.find((j) => j.id === jobId),
    [day.jobs],
  );

  const getAssignmentRaw = useCallback(
    (jobId: string) => getJobAssignment(assignments, dateKey, jobId),
    [assignments, dateKey],
  );

  const getAssignmentForJob = useCallback(
    (job: DispatchJob) => {
      const raw = getAssignmentRaw(job.id);
      const effective = effectiveDispatchJob(job, raw);
      return ensureDriverMoverLengths(effective, raw);
    },
    [getAssignmentRaw],
  );

  const getAssignment = useCallback(
    (jobId: string) => {
      const job = findJob(jobId);
      if (!job) return getAssignmentRaw(jobId);
      return getAssignmentForJob(job);
    },
    [findJob, getAssignmentRaw, getAssignmentForJob],
  );

  const patchJob = useCallback(
    (jobId: string, patch: Partial<DispatchJobAssignment>) => {
      persist(setJobAssignment(assignments, dateKey, jobId, patch));
    },
    [assignments, dateKey, persist],
  );

  const applyRequirementOverrides = useCallback(
    (
      jobId: string,
      overrides: {
        crewSizeOverride?: number | null;
        trucksNeededOverride?: number | null;
      },
    ) => {
      const job = findJob(jobId);
      if (!job) return;
      const current = getAssignmentRaw(jobId);
      const merged: DispatchJobAssignment = {
        ...current,
        crewSizeOverride:
          overrides.crewSizeOverride !== undefined
            ? overrides.crewSizeOverride
            : current.crewSizeOverride ?? null,
        trucksNeededOverride:
          overrides.trucksNeededOverride !== undefined
            ? overrides.trucksNeededOverride
            : current.trucksNeededOverride ?? null,
      };
      const { crewSizeNeeded, trucksNeeded } = effectiveRequirements(job, merged);
      const trim = trimAssignmentToRequirements(job, current, crewSizeNeeded, trucksNeeded);
      patchJob(jobId, {
        ...trim,
        crewSizeOverride: merged.crewSizeOverride ?? null,
        trucksNeededOverride: merged.trucksNeededOverride ?? null,
      });
    },
    [findJob, getAssignmentRaw, patchJob],
  );

  const assignCrewSlot = useCallback(
    (jobId: string, slot: CrewSlotRef, crewId: string | null) => {
      const job = findJob(jobId);
      if (!job) return;
      const raw = getAssignmentRaw(jobId);
      const effective = effectiveDispatchJob(job, raw);
      const current = ensureDriverMoverLengths(effective, raw);
      const next = setSlotCrew(effective, current, slot, crewId);
      patchJob(jobId, {
        skipperId: next.skipperId,
        driverIds: next.driverIds,
        moverIds: next.moverIds,
      });
    },
    [findJob, getAssignmentRaw, patchJob],
  );

  const setTrucks = useCallback(
    (jobId: string, truckIds: string[]) => {
      const job = findJob(jobId);
      if (!job) return;
      const raw = getAssignmentRaw(jobId);
      const { trucksNeeded } = effectiveRequirements(job, raw);
      patchJob(jobId, { truckIds: truckIds.slice(0, trucksNeeded) });
    },
    [findJob, getAssignmentRaw, patchJob],
  );

  const assignTruck = useCallback(
    (jobId: string, truckId: string) => {
      const job = findJob(jobId);
      if (!job) return;
      const current = getAssignmentRaw(jobId);
      if (current.truckIds.includes(truckId)) return;
      const { trucksNeeded } = effectiveRequirements(job, current);
      if (current.truckIds.length >= trucksNeeded) return;
      patchJob(jobId, { truckIds: [...current.truckIds, truckId] });
    },
    [findJob, getAssignmentRaw, patchJob],
  );

  const unassignTruck = useCallback(
    (jobId: string, truckId: string) => {
      const current = getAssignmentRaw(jobId);
      patchJob(jobId, { truckIds: current.truckIds.filter((id) => id !== truckId) });
    },
    [getAssignmentRaw, patchJob],
  );

  const setDispatchNotes = useCallback(
    (jobId: string, notes: string) => {
      patchJob(jobId, { dispatchNotes: notes });
    },
    [patchJob],
  );

  const setJobNote = useCallback(
    (jobId: string, note: string) => {
      patchJob(jobId, { jobNote: note });
    },
    [patchJob],
  );

  const setCrewSizeNeeded = useCallback(
    (jobId: string, size: number) => {
      applyRequirementOverrides(jobId, { crewSizeOverride: clampCrew(size) });
    },
    [applyRequirementOverrides],
  );

  const setTrucksNeeded = useCallback(
    (jobId: string, count: number) => {
      applyRequirementOverrides(jobId, { trucksNeededOverride: clampTrucks(count) });
    },
    [applyRequirementOverrides],
  );

  const resetCrewSizeToPlanned = useCallback(
    (jobId: string) => {
      applyRequirementOverrides(jobId, { crewSizeOverride: null });
    },
    [applyRequirementOverrides],
  );

  const resetTrucksToPlanned = useCallback(
    (jobId: string) => {
      applyRequirementOverrides(jobId, { trucksNeededOverride: null });
    },
    [applyRequirementOverrides],
  );

  const getAssignmentForSchedule = useCallback(
    (jobId: string) => getAssignment(jobId),
    [getAssignment],
  );

  const { crewIds: assignedCrewIds, truckIds: assignedTruckIds } = useMemo(
    () => collectAssignedIds(day.jobs, getAssignmentForSchedule),
    [day.jobs, getAssignmentForSchedule],
  );

  const scheduleStatus = useMemo(
    () => evaluateDispatchSchedule(day, getAssignmentForSchedule),
    [day, getAssignmentForSchedule],
  );

  const dayRequirements = useMemo(
    () => evaluateDayRequirements(day, getAssignmentForSchedule),
    [day, getAssignmentForSchedule],
  );

  const publishRecord = useMemo(
    () => getPublishRecord(publishStore, dateKey),
    [publishStore, dateKey],
  );

  const publishToCrewApp = useCallback(() => {
    const next = setPublishRecord(publishStore, dateKey, day.jobs.length);
    setPublishStore(next);
    writeDispatchPublishStore(next);
  }, [publishStore, dateKey, day.jobs.length]);

  const value = useMemo(
    () => ({
      dateKey,
      setDateKey,
      day,
      assignments,
      getAssignment,
      getAssignmentForJob,
      assignCrewSlot,
      setTrucks,
      assignTruck,
      unassignTruck,
      setDispatchNotes,
      setJobNote,
      setCrewSizeNeeded,
      setTrucksNeeded,
      resetCrewSizeToPlanned,
      resetTrucksToPlanned,
      crewOffIds: day.crewOffIds,
      crewOff: day.crewOff,
      assignedCrewIds,
      assignedTruckIds,
      scheduleStatus,
      dayRequirements,
      publishRecord,
      publishToCrewApp,
    }),
    [
      dateKey,
      day,
      assignments,
      getAssignment,
      getAssignmentForJob,
      assignCrewSlot,
      setTrucks,
      assignTruck,
      unassignTruck,
      setDispatchNotes,
      setJobNote,
      setCrewSizeNeeded,
      setTrucksNeeded,
      resetCrewSizeToPlanned,
      resetTrucksToPlanned,
      assignedCrewIds,
      assignedTruckIds,
      scheduleStatus,
      dayRequirements,
      publishRecord,
      publishToCrewApp,
    ],
  );

  return <DispatchContext.Provider value={value}>{children}</DispatchContext.Provider>;
}

export function useDispatch() {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error("useDispatch must be used within DispatchProvider");
  return ctx;
}

export function findDispatchJob(day: DispatchDaySnapshot, jobId: string): DispatchJob | undefined {
  return day.jobs.find((j) => j.id === jobId);
}
