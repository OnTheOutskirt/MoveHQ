"use client";

import {
  EQUIPMENT_CATALOG_UPDATED_EVENT,
  loadEquipmentCatalog,
  saveEquipmentCatalog,
} from "@/lib/moves/equipment-catalog-storage";
import { setEquipmentCatalogRuntime } from "@/lib/moves/equipment-catalog-runtime";
import type { EquipmentCatalogItem } from "@/lib/moves/equipment-catalog-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type EquipmentCatalogContextValue = {
  catalog: EquipmentCatalogItem[];
  isReady: boolean;
  replaceCatalog: (next: EquipmentCatalogItem[]) => void;
};

const EquipmentCatalogContext = createContext<EquipmentCatalogContextValue | null>(null);

export function EquipmentCatalogProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<EquipmentCatalogItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  const apply = useCallback((next: EquipmentCatalogItem[]) => {
    setEquipmentCatalogRuntime(next);
    setCatalog(next);
    saveEquipmentCatalog(next);
  }, []);

  useEffect(() => {
    const loaded = loadEquipmentCatalog();
    setEquipmentCatalogRuntime(loaded);
    setCatalog(loaded);
    setIsReady(true);
  }, []);

  useEffect(() => {
    function onExternalUpdate() {
      const loaded = loadEquipmentCatalog();
      setEquipmentCatalogRuntime(loaded);
      setCatalog(loaded);
    }
    window.addEventListener(EQUIPMENT_CATALOG_UPDATED_EVENT, onExternalUpdate);
    return () => window.removeEventListener(EQUIPMENT_CATALOG_UPDATED_EVENT, onExternalUpdate);
  }, []);

  const value = useMemo(
    () => ({
      catalog,
      isReady,
      replaceCatalog: apply,
    }),
    [catalog, isReady, apply],
  );

  return (
    <EquipmentCatalogContext.Provider value={value}>{children}</EquipmentCatalogContext.Provider>
  );
}

export function useEquipmentCatalog(): EquipmentCatalogContextValue {
  const ctx = useContext(EquipmentCatalogContext);
  if (!ctx) {
    throw new Error("useEquipmentCatalog must be used within EquipmentCatalogProvider");
  }
  return ctx;
}
