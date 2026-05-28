"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import type { CrewRole } from "@/lib/dispatch/types";
import type { DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";
import { applyCrewToTeamMember } from "@/lib/operations/crew-sync";
import { defaultFleetStore } from "@/lib/operations/fleet-defaults";
import {
  activeCrewFromList,
  activeTrucksFromList,
} from "@/lib/operations/fleet";
import { generateFleetId, loadFleetStore, saveFleetStore } from "@/lib/operations/fleet-storage";
import type {
  CrewWorkSchedule,
  FleetCrewMember,
  FleetStore,
  FleetTruck,
  TimeOffRequest,
  TruckMaintenanceRecord,
  TruckOutage,
  WeekdayId,
} from "@/lib/operations/fleet-types";
import { DEFAULT_WORK_DAYS } from "@/lib/operations/fleet-types";
import { createEmptyMember } from "@/lib/team/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type FleetContextValue = {
  isReady: boolean;
  crew: FleetCrewMember[];
  trucks: FleetTruck[];
  schedules: CrewWorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  truckOutages: TruckOutage[];
  maintenance: TruckMaintenanceRecord[];
  activeCrewForDispatch: () => DispatchCrewMember[];
  activeTrucksForDispatch: () => DispatchTruck[];
  updateCrewMember: (
    id: string,
    patch: Partial<Pick<FleetCrewMember, "name" | "roles" | "active" | "teamMemberId">>,
  ) => void;
  addCrewMember: (input: {
    name: string;
    roles: CrewRole[];
    active?: boolean;
    linkTeamMember?: boolean;
  }) => FleetCrewMember;
  setWorkSchedule: (crewId: string, workDays: WeekdayId[]) => void;
  getWorkSchedule: (crewId: string) => WeekdayId[];
  addTimeOffRequest: (
    input: Omit<TimeOffRequest, "id" | "submittedAt" | "status"> & { status?: TimeOffRequest["status"] },
  ) => TimeOffRequest;
  updateTimeOffRequest: (id: string, patch: Partial<TimeOffRequest>) => void;
  addTruck: (input: { label: string; type: string; active?: boolean }) => FleetTruck;
  updateTruck: (
    id: string,
    patch: Partial<Pick<FleetTruck, "label" | "type" | "active">>,
  ) => void;
  addTruckOutage: (input: Omit<TruckOutage, "id">) => TruckOutage;
  removeTruckOutage: (id: string) => void;
};

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const { getMember, updateMember, addMember } = useTeamMembers();
  const [store, setStore] = useState<FleetStore>(defaultFleetStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setStore(loadFleetStore());
    setIsReady(true);
  }, []);

  const persist = useCallback((next: FleetStore) => {
    setStore(next);
    saveFleetStore(next);
  }, []);

  const syncCrewToTeam = useCallback(
    (crew: FleetCrewMember) => {
      if (!crew.teamMemberId) return;
      const member = getMember(crew.teamMemberId);
      if (!member) return;
      updateMember(crew.teamMemberId, applyCrewToTeamMember(member, crew.roles, crew.active));
    },
    [getMember, updateMember],
  );

  const updateCrewMember = useCallback(
    (id: string, patch: Partial<Pick<FleetCrewMember, "name" | "roles" | "active" | "teamMemberId">>) => {
      setStore((prev) => {
        const crew = prev.crew.map((c) => (c.id === id ? { ...c, ...patch } : c));
        const updated = crew.find((c) => c.id === id);
        const next = { ...prev, crew };
        saveFleetStore(next);
        if (updated) syncCrewToTeam(updated);
        return next;
      });
    },
    [syncCrewToTeam],
  );

  const addCrewMember = useCallback(
    (input: {
      name: string;
      roles: CrewRole[];
      active?: boolean;
      linkTeamMember?: boolean;
    }) => {
      let teamMemberId: string | undefined;
      if (input.linkTeamMember) {
        const parts = input.name.trim().split(/\s+/);
        const firstName = parts[0] ?? "";
        const lastName = parts.slice(1).join(" ") || "";
        const tm = addMember({
          ...createEmptyMember(),
          firstName,
          lastName,
          jobTitles: input.roles.includes("skipper")
            ? ["Mover", "Skipper"]
            : input.roles.includes("driver")
              ? ["Mover", "Driver"]
              : ["Mover"],
          permissionLevel: "crew",
          hasCrewAppAccess: true,
          hasSoftwareAccess: false,
          status: input.active === false ? "inactive" : "active",
        });
        teamMemberId = tm.id;
      }

      const record: FleetCrewMember = {
        id: generateFleetId("crew"),
        name: input.name.trim(),
        roles: input.roles.length ? input.roles : ["mover"],
        active: input.active !== false,
        teamMemberId,
      };

      setStore((prev) => {
        const next: FleetStore = {
          ...prev,
          crew: [...prev.crew, record],
          schedules: [...prev.schedules, { crewId: record.id, workDays: [...DEFAULT_WORK_DAYS] }],
        };
        saveFleetStore(next);
        return next;
      });

      if (teamMemberId) syncCrewToTeam(record);
      return record;
    },
    [addMember, syncCrewToTeam],
  );

  const setWorkSchedule = useCallback((crewId: string, workDays: WeekdayId[]) => {
    setStore((prev) => {
      const exists = prev.schedules.some((s) => s.crewId === crewId);
      const schedules = exists
        ? prev.schedules.map((s) => (s.crewId === crewId ? { ...s, workDays } : s))
        : [...prev.schedules, { crewId, workDays }];
      const next = { ...prev, schedules };
      saveFleetStore(next);
      return next;
    });
  }, []);

  const getWorkSchedule = useCallback(
    (crewId: string) => {
      return store.schedules.find((s) => s.crewId === crewId)?.workDays ?? [...DEFAULT_WORK_DAYS];
    },
    [store.schedules],
  );

  const addTimeOffRequest = useCallback(
    (
      input: Omit<TimeOffRequest, "id" | "submittedAt" | "status"> & {
        status?: TimeOffRequest["status"];
      },
    ) => {
      const record: TimeOffRequest = {
        ...input,
        id: generateFleetId("off"),
        submittedAt: new Date().toISOString(),
        status: input.status ?? "pending",
      };
      setStore((prev) => {
        const next = { ...prev, timeOffRequests: [...prev.timeOffRequests, record] };
        saveFleetStore(next);
        return next;
      });
      return record;
    },
    [],
  );

  const updateTimeOffRequest = useCallback((id: string, patch: Partial<TimeOffRequest>) => {
    setStore((prev) => {
      const timeOffRequests = prev.timeOffRequests.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      );
      const next = { ...prev, timeOffRequests };
      saveFleetStore(next);
      return next;
    });
  }, []);

  const addTruck = useCallback(
    (input: { label: string; type: string; active?: boolean }) => {
      const record: FleetTruck = {
        id: generateFleetId("truck"),
        label: input.label.trim(),
        type: input.type,
        active: input.active !== false,
      };
      setStore((prev) => {
        const next = { ...prev, trucks: [...prev.trucks, record] };
        saveFleetStore(next);
        return next;
      });
      return record;
    },
    [],
  );

  const updateTruck = useCallback(
    (id: string, patch: Partial<Pick<FleetTruck, "label" | "type" | "active">>) => {
      setStore((prev) => {
        const next = {
          ...prev,
          trucks: prev.trucks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        };
        saveFleetStore(next);
        return next;
      });
    },
    [],
  );

  const addTruckOutage = useCallback((input: Omit<TruckOutage, "id">) => {
    const record: TruckOutage = { ...input, id: generateFleetId("out") };
    setStore((prev) => {
      const next = { ...prev, truckOutages: [...prev.truckOutages, record] };
      saveFleetStore(next);
      return next;
    });
    return record;
  }, []);

  const removeTruckOutage = useCallback((id: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        truckOutages: prev.truckOutages.filter((o) => o.id !== id),
      };
      saveFleetStore(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      crew: store.crew,
      trucks: store.trucks,
      schedules: store.schedules,
      timeOffRequests: store.timeOffRequests,
      truckOutages: store.truckOutages,
      maintenance: store.maintenance,
      activeCrewForDispatch: () => activeCrewFromList(store.crew),
      activeTrucksForDispatch: () => activeTrucksFromList(store.trucks),
      updateCrewMember,
      addCrewMember,
      setWorkSchedule,
      getWorkSchedule,
      addTimeOffRequest,
      updateTimeOffRequest,
      addTruck,
      updateTruck,
      addTruckOutage,
      removeTruckOutage,
    }),
    [
      isReady,
      store,
      updateCrewMember,
      addCrewMember,
      setWorkSchedule,
      getWorkSchedule,
      addTimeOffRequest,
      updateTimeOffRequest,
      addTruck,
      updateTruck,
      addTruckOutage,
      removeTruckOutage,
    ],
  );

  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet must be used within FleetProvider");
  return ctx;
}
