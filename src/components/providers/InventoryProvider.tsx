"use client";

import { useEquipmentCatalog } from "@/components/providers/EquipmentCatalogProvider";
import { useSession } from "@/components/providers/SessionProvider";
import { applyInventoryAdjustment, mergeStockLines } from "@/lib/operations/inventory";
import { buildDefaultInventoryStore } from "@/lib/operations/inventory-defaults";
import {
  INVENTORY_STORAGE_KEY,
  inventorySnapshot,
  loadInventoryStore,
  persistInventoryStore,
} from "@/lib/operations/inventory-storage";
import type {
  InventoryAdjustmentKind,
  InventoryStockLine,
  InventoryStore,
  InventoryTransaction,
} from "@/lib/operations/inventory-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type InventoryContextValue = {
  isReady: boolean;
  store: InventoryStore;
  stockLines: InventoryStockLine[];
  transactions: InventoryTransaction[];
  adjust: (input: {
    catalogId: string;
    kind: InventoryAdjustmentKind;
    amount: number;
    note?: string;
  }) => void;
};

const InventoryContext = createContext<InventoryContextValue | null>(null);

export function InventoryProvider({ children }: { children: ReactNode }) {
  const { catalog, isReady: catalogReady } = useEquipmentCatalog();
  const { user } = useSession();
  const [store, setStore] = useState<InventoryStore>(() => buildDefaultInventoryStore());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadInventoryStore();
    setStore((prev) =>
      inventorySnapshot(prev) === inventorySnapshot(loaded) ? prev : loaded,
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key !== INVENTORY_STORAGE_KEY) return;
      const loaded = loadInventoryStore();
      setStore((prev) =>
        inventorySnapshot(prev) === inventorySnapshot(loaded) ? prev : loaded,
      );
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const stockLines = useMemo(() => mergeStockLines(catalog, store), [catalog, store]);

  const adjust = useCallback(
    (input: {
      catalogId: string;
      kind: InventoryAdjustmentKind;
      amount: number;
      note?: string;
    }) => {
      setStore((prev) => {
        const next = applyInventoryAdjustment(prev, { ...input, by: user.name });
        persistInventoryStore(next);
        return next;
      });
    },
    [user.name],
  );

  const value = useMemo(
    () => ({
      isReady: catalogReady && hydrated,
      store,
      stockLines,
      transactions: store.transactions,
      adjust,
    }),
    [catalogReady, hydrated, store, stockLines, adjust],
  );

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventory() {
  const ctx = useContext(InventoryContext);
  if (!ctx) {
    throw new Error("useInventory must be used within InventoryProvider");
  }
  return ctx;
}
