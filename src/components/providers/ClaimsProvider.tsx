"use client";

import { defaultClaimsStore } from "@/lib/operations/claims-defaults";
import {
  createClaimFromInput,
  loadClaimsStore,
  saveClaimsStore,
} from "@/lib/operations/claims-storage";
import { syncClaimWorkflow } from "@/lib/operations/claims-workflow";
import type { MoveClaim, NewMoveClaim } from "@/lib/operations/claims-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ClaimsContextValue = {
  isReady: boolean;
  claims: MoveClaim[];
  addClaim: (input: NewMoveClaim) => MoveClaim;
  updateClaim: (id: string, patch: Partial<MoveClaim>) => void;
  removeClaim: (id: string) => void;
  getClaimById: (id: string) => MoveClaim | undefined;
  importClaims: (claims: MoveClaim[]) => void;
};

const ClaimsContext = createContext<ClaimsContextValue | null>(null);

export function ClaimsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState(defaultClaimsStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setStore(loadClaimsStore());
    setIsReady(true);
  }, []);

  const addClaim = useCallback((input: NewMoveClaim) => {
    const claim = createClaimFromInput(input);
    setStore((prev) => {
      const next = { claims: [claim, ...prev.claims] };
      saveClaimsStore(next);
      return next;
    });
    return claim;
  }, []);

  const updateClaim = useCallback((id: string, patch: Partial<MoveClaim>) => {
    setStore((prev) => {
      const next = {
        claims: prev.claims.map((c) => {
          if (c.id !== id) return c;
          const merged = { ...c, ...patch };
          const synced = syncClaimWorkflow(merged);
          return { ...merged, ...synced };
        }),
      };
      saveClaimsStore(next);
      return next;
    });
  }, []);

  const removeClaim = useCallback((id: string) => {
    setStore((prev) => {
      const next = { claims: prev.claims.filter((c) => c.id !== id) };
      saveClaimsStore(next);
      return next;
    });
  }, []);

  const getClaimById = useCallback(
    (id: string) => store.claims.find((c) => c.id === id),
    [store.claims],
  );

  const importClaims = useCallback((claims: MoveClaim[]) => {
    if (claims.length === 0) return;
    setStore((prev) => {
      const byId = new Map(claims.map((c) => [c.id, c] as const));
      const merged = prev.claims.map((c) => byId.get(c.id) ?? c);
      const existingIds = new Set(prev.claims.map((c) => c.id));
      const newOnes = claims.filter((c) => !existingIds.has(c.id));
      const next = { claims: [...newOnes, ...merged] };
      saveClaimsStore(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      claims: store.claims,
      addClaim,
      updateClaim,
      removeClaim,
      getClaimById,
      importClaims,
    }),
    [isReady, store.claims, addClaim, updateClaim, removeClaim, getClaimById, importClaims],
  );

  return <ClaimsContext.Provider value={value}>{children}</ClaimsContext.Provider>;
}

export function useClaims() {
  const ctx = useContext(ClaimsContext);
  if (!ctx) throw new Error("useClaims must be used within ClaimsProvider");
  return ctx;
}
