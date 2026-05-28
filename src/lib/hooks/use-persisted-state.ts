"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Persist state in localStorage (per key). Hydrates after mount to avoid SSR mismatch.
 */
export function usePersistedState<T>(storageKey: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw !== null) {
        setValue(JSON.parse(raw) as T);
      }
    } catch {
      /* use default */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [storageKey, value, hydrated]);

  const setPersisted = useCallback((next: T | ((prev: T) => T)) => {
    setValue(next);
  }, []);

  return [value, setPersisted, hydrated] as const;
}
