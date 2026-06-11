"use client";

import { useCalendarSettings } from "@/components/providers/CalendarSettingsProvider";
import { collectDispatchDay } from "@/lib/dispatch/collect-day-jobs";
import { crewOffIdsFromCalendarNames } from "@/lib/dispatch/mock-roster";
import { useFleet } from "@/components/providers/FleetProvider";
import { buildMockDay } from "@/lib/calendar/mock-data";
import { parseDateKey } from "@/lib/calendar/date-utils";
import {
  ensureDriverMoverLengths,
  setSlotCrew,
  shouldCombineSkipperDriver,
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
  resetDayScheduleInStore,
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
  buildDispatchPublishSnapshot,
  dispatchMatchesPublishSnapshot,
} from "@/lib/dispatch/publish-snapshot";
import {
  clearPublishRecord,
  getPublishRecord,
  readDispatchPublishStore,
  setPublishRecord,
  writeDispatchPublishStore,
  type DispatchPublishRecord,
} from "@/lib/dispatch/publish-storage";
import {
  assignmentHasDispatchChanges,
  emptyJobResourcesPatch,
} from "@/lib/dispatch/assignment-utils";
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
  patchJob: (jobId: string, patch: Partial<DispatchJobAssignment>) => void;
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
  hasUnpublishedChanges: boolean;
  publishToCrewApp: () => void;
  unpublishFromCrewApp: () => void;
  pairWithJob: (anchorJobId: string, partnerJobId: string) => void;
  pairWithJobClearingPartner: (anchorJobId: string, partnerJobId: string) => void;
  unpairJob: (anchorJobId: string, partnerJobId: string) => void;
  setScheduleStart: (jobId: string, minutes: number | null) => void;
  hasCustomSchedule: boolean;
  resetDaySchedule: () => void;
};

const DispatchContext = createContext<DispatchContextValue | null>(null);

type DispatchProviderProps = {
  children: ReactNode;
  initialDateKey: string;
};

export function DispatchProvider({ children, initialDateKey }: DispatchProviderProps) {
  const { moves } = useMoves();
  const { activeCrewForDispatch } = useFleet();
  const { dayShareSettings } = useCalendarSettings();
  const [dateKey, setDateKey] = useState(initialDateKey);
  const [assignments, setAssignments] = useState<DispatchAssignmentStore>({});
  const [publishStore, setPublishStore] = useState(() => readDispatchPublishStore());

  useEffect(() => {
    setAssignments(readDispatchAssignments());
    setPublishStore(readDispatchPublishStore());
  }, []);

  const day = useMemo(() => {
    const snapshot = collectDispatchDay(moves, dateKey, new Date(), dayShareSettings);
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
  }, [moves, dateKey, activeCrewForDispatch, dayShareSettings]);

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
      const roster = activeCrewForDispatch();
      const member = crewId ? roster.find((c) => c.id === crewId) : undefined;
      const current = ensureDriverMoverLengths(effective, raw);
      const combine = crewId
        ? shouldCombineSkipperDriver(member, slot, current)
        : false;
      const targetSlot: CrewSlotRef = combine ? { kind: "skipper" } : slot;

      const working = ensureDriverMoverLengths(effective, {
        ...current,
        skipperAlsoDriver: combine ? true : current.skipperAlsoDriver,
      });
      const next = setSlotCrew(effective, working, targetSlot, crewId);
      patchJob(jobId, {
        skipperId: next.skipperId,
        driverIds: next.driverIds,
        moverIds: next.moverIds,
        ...(combine ? { skipperAlsoDriver: true } : {}),
      });
    },
    [activeCrewForDispatch, findJob, getAssignmentRaw, patchJob],
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

  const hasUnpublishedChanges = useMemo(() => {
    if (!publishRecord) return true;
    return !dispatchMatchesPublishSnapshot(
      publishRecord.snapshot,
      dateKey,
      day.jobs,
      assignments,
    );
  }, [publishRecord, dateKey, day.jobs, assignments]);

  const publishToCrewApp = useCallback(() => {
    const snapshot = buildDispatchPublishSnapshot(dateKey, day.jobs, assignments);
    const next = setPublishRecord(publishStore, dateKey, day.jobs.length, snapshot);
    setPublishStore(next);
    writeDispatchPublishStore(next);
  }, [publishStore, dateKey, day.jobs, assignments]);

  const unpublishFromCrewApp = useCallback(() => {
    const next = clearPublishRecord(publishStore, dateKey);
    setPublishStore(next);
    writeDispatchPublishStore(next);
  }, [publishStore, dateKey]);

  const pairWithJob = useCallback(
    (anchorJobId: string, partnerJobId: string) => {
      const current = getAssignmentRaw(anchorJobId);
      const existing = current.pairedJobIds ?? [];
      if (existing.includes(partnerJobId)) return;
      patchJob(anchorJobId, { pairedJobIds: [...existing, partnerJobId] });
    },
    [getAssignmentRaw, patchJob],
  );

  const pairWithJobClearingPartner = useCallback(
    (anchorJobId: string, partnerJobId: string) => {
      patchJob(partnerJobId, {
        ...emptyJobResourcesPatch(),
        scheduleStartOverrideMinutes: null,
      });
      pairWithJob(anchorJobId, partnerJobId);
    },
    [patchJob, pairWithJob],
  );

  const setScheduleStart = useCallback(
    (jobId: string, minutes: number | null) => {
      patchJob(jobId, { scheduleStartOverrideMinutes: minutes });
    },
    [patchJob],
  );

  const unpairJob = useCallback(
    (anchorJobId: string, partnerJobId: string) => {
      const current = getAssignmentRaw(anchorJobId);
      patchJob(anchorJobId, {
        pairedJobIds: (current.pairedJobIds ?? []).filter((id) => id !== partnerJobId),
      });
    },
    [getAssignmentRaw, patchJob],
  );

  const hasCustomSchedule = useMemo(() => {
    for (const job of day.jobs) {
      const assignment = getJobAssignment(assignments, dateKey, job.id);
      if (assignmentHasDispatchChanges(job, assignment)) return true;
    }
    return false;
  }, [day.jobs, assignments, dateKey]);

  const resetDaySchedule = useCallback(() => {
    const next = resetDayScheduleInStore(
      assignments,
      dateKey,
      day.jobs.map((j) => j.id),
    );
    persist(next);
  }, [assignments, dateKey, day.jobs, persist]);

  const value = useMemo(
    () => ({
      dateKey,
      setDateKey,
      day,
      assignments,
      getAssignment,
      getAssignmentForJob,
      assignCrewSlot,
      patchJob,
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
      hasUnpublishedChanges,
      publishToCrewApp,
      unpublishFromCrewApp,
      pairWithJob,
      pairWithJobClearingPartner,
      unpairJob,
      setScheduleStart,
      hasCustomSchedule,
      resetDaySchedule,
    }),
    [
      dateKey,
      day,
      assignments,
      getAssignment,
      getAssignmentForJob,
      assignCrewSlot,
      patchJob,
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
      hasUnpublishedChanges,
      publishToCrewApp,
      unpublishFromCrewApp,
      pairWithJob,
      pairWithJobClearingPartner,
      unpairJob,
      setScheduleStart,
      hasCustomSchedule,
      resetDaySchedule,
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
