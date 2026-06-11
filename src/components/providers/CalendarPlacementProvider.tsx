"use client";

import { useSession } from "@/components/providers/SessionProvider";
import {
  addHoldPlacements,
  addWaitlistPlacement,
  removeMovePlacements,
  removePlacement,
  setMoveWaitlistPlacements,
} from "@/lib/calendar/placement";
import type { HoldDayDraft } from "@/lib/calendar/placement-types";
import {
  CALENDAR_PLACEMENT_STORAGE_KEY,
  loadCalendarPlacementStore,
  persistCalendarPlacementStore,
  placementStoreFingerprint,
} from "@/lib/calendar/placement-storage";
import type { CalendarPlacement, CalendarPlacementKind, CalendarPlacementStore } from "@/lib/calendar/placement-types";
import type { MoveRecord } from "@/lib/moves/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CalendarPlacementContextValue = {
  isReady: boolean;
  store: CalendarPlacementStore;
  placements: CalendarPlacement[];
  placeOnHold: (move: MoveRecord, drafts: HoldDayDraft[]) => void;
  placeOnWaitlist: (move: MoveRecord, date: string, movers: number, trucks: number) => void;
  setWaitlistDates: (move: MoveRecord, dates: string[]) => void;
  removePlacementById: (placementId: string) => void;
  clearMovePlacements: (moveId: string, kind?: CalendarPlacementKind) => void;
  getPlacementsForMove: (moveId: string) => CalendarPlacement[];
};

const CalendarPlacementContext = createContext<CalendarPlacementContextValue | null>(null);

export function CalendarPlacementProvider({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const [store, setStore] = useState<CalendarPlacementStore>(() => loadCalendarPlacementStore());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadCalendarPlacementStore();
    setStore((prev) =>
      placementStoreFingerprint(prev) === placementStoreFingerprint(loaded) ? prev : loaded,
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== CALENDAR_PLACEMENT_STORAGE_KEY) return;
      const loaded = loadCalendarPlacementStore();
      setStore((prev) =>
        placementStoreFingerprint(prev) === placementStoreFingerprint(loaded) ? prev : loaded,
      );
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const placeOnHold = useCallback(
    (move: MoveRecord, drafts: HoldDayDraft[]) => {
      setStore((prev) => {
        const next = addHoldPlacements(prev, move, drafts, user?.name);
        if (placementStoreFingerprint(prev) === placementStoreFingerprint(next)) return prev;
        persistCalendarPlacementStore(next);
        return next;
      });
    },
    [user?.name],
  );

  const placeOnWaitlist = useCallback(
    (move: MoveRecord, date: string, movers: number, trucks: number) => {
      setStore((prev) => {
        const next = addWaitlistPlacement(prev, move, date, movers, trucks, user?.name);
        if (placementStoreFingerprint(prev) === placementStoreFingerprint(next)) return prev;
        persistCalendarPlacementStore(next);
        return next;
      });
    },
    [user?.name],
  );

  const setWaitlistDates = useCallback(
    (move: MoveRecord, dates: string[]) => {
      setStore((prev) => {
        const next = setMoveWaitlistPlacements(prev, move, dates, user?.name);
        if (placementStoreFingerprint(prev) === placementStoreFingerprint(next)) return prev;
        persistCalendarPlacementStore(next);
        return next;
      });
    },
    [user?.name],
  );

  const removePlacementById = useCallback((placementId: string) => {
    setStore((prev) => {
      const next = removePlacement(prev, placementId);
      if (placementStoreFingerprint(prev) === placementStoreFingerprint(next)) return prev;
      persistCalendarPlacementStore(next);
      return next;
    });
  }, []);

  const clearMovePlacements = useCallback((moveId: string, kind?: CalendarPlacementKind) => {
    setStore((prev) => {
      const next = removeMovePlacements(prev, moveId, kind);
      if (placementStoreFingerprint(prev) === placementStoreFingerprint(next)) return prev;
      persistCalendarPlacementStore(next);
      return next;
    });
  }, []);

  const getPlacementsForMoveFn = useCallback(
    (moveId: string) => store.placements.filter((p) => p.moveId === moveId),
    [store.placements],
  );

  const value = useMemo<CalendarPlacementContextValue>(
    () => ({
      isReady: hydrated,
      store,
      placements: store.placements,
      placeOnHold,
      placeOnWaitlist,
      setWaitlistDates,
      removePlacementById,
      clearMovePlacements,
      getPlacementsForMove: getPlacementsForMoveFn,
    }),
    [
      hydrated,
      store,
      placeOnHold,
      placeOnWaitlist,
      setWaitlistDates,
      removePlacementById,
      clearMovePlacements,
      getPlacementsForMoveFn,
    ],
  );

  return (
    <CalendarPlacementContext.Provider value={value}>{children}</CalendarPlacementContext.Provider>
  );
}

export function useCalendarPlacements(): CalendarPlacementContextValue {
  const ctx = useContext(CalendarPlacementContext);
  if (!ctx) {
    throw new Error("useCalendarPlacements must be used within CalendarPlacementProvider");
  }
  return ctx;
}
