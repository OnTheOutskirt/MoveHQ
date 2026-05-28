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
  getJobAssignment,
  readDispatchAssignments,
  setJobAssignment,
  writeDispatchAssignments,
  type DispatchAssignmentStore,
} from "@/lib/dispatch/storage";
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
  crewOffIds: string[];
  crewOff: DispatchDaySnapshot["crewOff"];
  assignedCrewIds: Set<string>;
  assignedTruckIds: Set<string>;
  scheduleStatus: DispatchScheduleStatus;
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
    (job: DispatchJob) => ensureDriverMoverLengths(job, getAssignmentRaw(job.id)),
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

  const assignCrewSlot = useCallback(
    (jobId: string, slot: CrewSlotRef, crewId: string | null) => {
      const job = findJob(jobId);
      if (!job) return;
      const current = getAssignmentForJob(job);
      const next = setSlotCrew(job, current, slot, crewId);
      patchJob(jobId, {
        skipperId: next.skipperId,
        driverIds: next.driverIds,
        moverIds: next.moverIds,
      });
    },
    [findJob, getAssignmentForJob, patchJob],
  );

  const setTrucks = useCallback(
    (jobId: string, truckIds: string[]) => {
      patchJob(jobId, { truckIds });
    },
    [patchJob],
  );

  const assignTruck = useCallback(
    (jobId: string, truckId: string) => {
      const current = getAssignmentRaw(jobId);
      if (current.truckIds.includes(truckId)) return;
      patchJob(jobId, { truckIds: [...current.truckIds, truckId] });
    },
    [getAssignmentRaw, patchJob],
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
      crewOffIds: day.crewOffIds,
      crewOff: day.crewOff,
      assignedCrewIds,
      assignedTruckIds,
      scheduleStatus,
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
      assignedCrewIds,
      assignedTruckIds,
      scheduleStatus,
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
