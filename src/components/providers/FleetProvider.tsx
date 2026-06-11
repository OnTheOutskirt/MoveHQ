"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import type { CrewRole } from "@/lib/dispatch/types";
import type { DispatchCrewMember, DispatchTruck } from "@/lib/dispatch/types";
import { useSettings } from "@/components/providers/SettingsProvider";
import { applyCrewToTeamMember } from "@/lib/operations/crew-sync";
import { roleSingular } from "@/lib/terminology/labels";
import { normalizeTerminology } from "@/lib/terminology/normalize";
import type { JobTitle } from "@/lib/team/types";
import { defaultFleetStore } from "@/lib/operations/fleet-defaults";
import {
  activeCrewFromList,
  dispatchTrucksForDate,
  truckCapacityBreakdownForDate,
  truckCapacityForDate,
  type TruckCapacityBreakdown,
} from "@/lib/operations/fleet";
import { toDateKey } from "@/lib/calendar/date-utils";
import { generateFleetId, loadFleetStore, saveFleetStore } from "@/lib/operations/fleet-storage";
import type {
  CrewWorkSchedule,
  FleetCrewMember,
  FleetStore,
  FleetTruck,
  TimeOffRequest,
  TruckMaintenanceRecord,
  TruckOutage,
  TemporaryTruckFormInput,
  TemporaryTruckRental,
  TruckFormInput,
  WeekdayId,
} from "@/lib/operations/fleet-types";
import { DEFAULT_WORK_DAYS, temporaryRentalFromFormInput, truckFromFormInput } from "@/lib/operations/fleet-types";
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
  temporaryRentals: TemporaryTruckRental[];
  schedules: CrewWorkSchedule[];
  timeOffRequests: TimeOffRequest[];
  truckOutages: TruckOutage[];
  maintenance: TruckMaintenanceRecord[];
  activeCrewForDispatch: () => DispatchCrewMember[];
  activeTrucksForDispatch: (dateKey?: string) => DispatchTruck[];
  getTruckCapacityForDate: (dateKey: string) => number;
  getTruckCapacityBreakdownForDate: (dateKey: string) => TruckCapacityBreakdown;
  updateCrewMember: (
    id: string,
    patch: Partial<
      Pick<
        FleetCrewMember,
        "name" | "roles" | "active" | "teamMemberId" | "headshotDataUrl" | "bio" | "showOnCustomerPortal"
      >
    >,
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
  addTruck: (input: TruckFormInput) => FleetTruck;
  updateTruck: (id: string, patch: Partial<TruckFormInput>) => void;
  addTemporaryRental: (input: TemporaryTruckFormInput) => TemporaryTruckRental;
  updateTemporaryRental: (id: string, patch: Partial<TemporaryTruckFormInput>) => void;
  removeTemporaryRental: (id: string) => void;
  addTruckOutage: (input: Omit<TruckOutage, "id">) => TruckOutage;
  removeTruckOutage: (id: string) => void;
};

const FleetContext = createContext<FleetContextValue | null>(null);

export function FleetProvider({ children }: { children: ReactNode }) {
  const { getMember, updateMember, addMember } = useTeamMembers();
  const { settings } = useSettings();
  const terminology = normalizeTerminology(settings.terminology);
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
      updateMember(
        crew.teamMemberId,
        applyCrewToTeamMember(member, crew.roles, crew.active, terminology),
      );
    },
    [getMember, updateMember, terminology],
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
            ? ([
                roleSingular(terminology, "mover"),
                roleSingular(terminology, "skipper"),
              ] as JobTitle[])
            : input.roles.includes("driver")
              ? ([
                  roleSingular(terminology, "mover"),
                  roleSingular(terminology, "driver"),
                ] as JobTitle[])
              : ([roleSingular(terminology, "mover")] as JobTitle[]),
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
    [addMember, syncCrewToTeam, terminology],
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
      const prior = prev.timeOffRequests.find((r) => r.id === id);
      const timeOffRequests = prev.timeOffRequests.map((r) =>
        r.id === id ? { ...r, ...patch } : r,
      );
      const updated = timeOffRequests.find((r) => r.id === id);
      const next = { ...prev, timeOffRequests };
      saveFleetStore(next);
      if (
        updated &&
        prior &&
        patch.status &&
        patch.status !== prior.status &&
        (patch.status === "approved" || patch.status === "denied")
      ) {
        void import("@/lib/crew-app/crew-inbox-storage").then(({ notifyCrewTimeOffDecision }) => {
          const status = patch.status as "approved" | "denied";
          notifyCrewTimeOffDecision(
            updated.crewId,
            {
              id: updated.id,
              startDate: updated.startDate,
              endDate: updated.endDate,
              note: updated.reason,
              status: "pending",
              submittedAt: updated.submittedAt,
            },
            status,
          );
        });
      }
      return next;
    });
  }, []);

  const addTruck = useCallback((input: TruckFormInput) => {
    const record = truckFromFormInput(generateFleetId("truck"), input);
    setStore((prev) => {
      const next = { ...prev, trucks: [...prev.trucks, record] };
      saveFleetStore(next);
      return next;
    });
    return record;
  }, []);

  const updateTruck = useCallback((id: string, patch: Partial<TruckFormInput>) => {
    setStore((prev) => {
      const next = {
        ...prev,
        trucks: prev.trucks.map((t) => {
          if (t.id !== id) return t;
          const merged: TruckFormInput = {
            label: patch.label ?? t.label,
            vehicleType: patch.vehicleType ?? t.vehicleType,
            lengthFt: patch.lengthFt !== undefined ? patch.lengthFt : t.lengthFt,
            cabSize: patch.cabSize !== undefined ? patch.cabSize : t.cabSize,
            hasLiftgate: patch.hasLiftgate !== undefined ? patch.hasLiftgate : t.hasLiftgate,
            active: patch.active !== undefined ? patch.active : t.active,
            make: patch.make !== undefined ? patch.make : t.make,
            model: patch.model !== undefined ? patch.model : t.model,
            year: patch.year !== undefined ? patch.year : t.year,
            vin: patch.vin !== undefined ? patch.vin : t.vin,
            plate: patch.plate !== undefined ? patch.plate : t.plate,
          };
          return truckFromFormInput(id, merged);
        }),
      };
      saveFleetStore(next);
      return next;
    });
  }, []);

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

  const addTemporaryRental = useCallback((input: TemporaryTruckFormInput) => {
    const record = temporaryRentalFromFormInput(generateFleetId("rental"), input);
    setStore((prev) => {
      const next = { ...prev, temporaryRentals: [...prev.temporaryRentals, record] };
      saveFleetStore(next);
      return next;
    });
    return record;
  }, []);

  const updateTemporaryRental = useCallback(
    (id: string, patch: Partial<TemporaryTruckFormInput>) => {
      setStore((prev) => {
        const next = {
          ...prev,
          temporaryRentals: prev.temporaryRentals.map((r) => {
            if (r.id !== id) return r;
            return temporaryRentalFromFormInput(id, {
              label: patch.label ?? r.label,
              vendor: patch.vendor ?? r.vendor,
              vehicleType: patch.vehicleType ?? r.vehicleType,
              lengthFt: patch.lengthFt !== undefined ? patch.lengthFt : r.lengthFt,
              cabSize: patch.cabSize !== undefined ? patch.cabSize : r.cabSize,
              hasLiftgate: patch.hasLiftgate !== undefined ? patch.hasLiftgate : r.hasLiftgate,
              startDate: patch.startDate ?? r.startDate,
              endDate: patch.endDate ?? r.endDate,
              notes: patch.notes !== undefined ? patch.notes : r.notes,
            });
          }),
        };
        saveFleetStore(next);
        return next;
      });
    },
    [],
  );

  const removeTemporaryRental = useCallback((id: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        temporaryRentals: prev.temporaryRentals.filter((r) => r.id !== id),
      };
      saveFleetStore(next);
      return next;
    });
  }, []);

  const getTruckCapacityForDate = useCallback(
    (dateKey: string) =>
      truckCapacityForDate(store.trucks, store.truckOutages, store.temporaryRentals, dateKey),
    [store.trucks, store.truckOutages, store.temporaryRentals],
  );

  const getTruckCapacityBreakdownForDate = useCallback(
    (dateKey: string) =>
      truckCapacityBreakdownForDate(
        store.trucks,
        store.truckOutages,
        store.temporaryRentals,
        dateKey,
      ),
    [store.trucks, store.truckOutages, store.temporaryRentals],
  );

  const activeTrucksForDispatchOnDate = useCallback(
    (dateKey?: string) => {
      const key = dateKey ?? toDateKey(new Date());
      return dispatchTrucksForDate(
        store.trucks,
        store.truckOutages,
        store.temporaryRentals,
        key,
      );
    },
    [store.trucks, store.truckOutages, store.temporaryRentals],
  );

  const value = useMemo(
    () => ({
      isReady,
      crew: store.crew,
      trucks: store.trucks,
      temporaryRentals: store.temporaryRentals,
      schedules: store.schedules,
      timeOffRequests: store.timeOffRequests,
      truckOutages: store.truckOutages,
      maintenance: store.maintenance,
      activeCrewForDispatch: () => activeCrewFromList(store.crew),
      activeTrucksForDispatch: activeTrucksForDispatchOnDate,
      getTruckCapacityForDate,
      getTruckCapacityBreakdownForDate,
      updateCrewMember,
      addCrewMember,
      setWorkSchedule,
      getWorkSchedule,
      addTimeOffRequest,
      updateTimeOffRequest,
      addTruck,
      updateTruck,
      addTemporaryRental,
      updateTemporaryRental,
      removeTemporaryRental,
      addTruckOutage,
      removeTruckOutage,
    }),
    [
      isReady,
      store,
      activeTrucksForDispatchOnDate,
      getTruckCapacityForDate,
      getTruckCapacityBreakdownForDate,
      updateCrewMember,
      addCrewMember,
      setWorkSchedule,
      getWorkSchedule,
      addTimeOffRequest,
      updateTimeOffRequest,
      addTruck,
      updateTruck,
      addTemporaryRental,
      updateTemporaryRental,
      removeTemporaryRental,
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
