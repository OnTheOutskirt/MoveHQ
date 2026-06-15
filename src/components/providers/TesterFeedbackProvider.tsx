"use client";

import {
  createTesterFeedback,
  deleteTesterFeedback,
  fetchTesterFeedback,
  patchTesterFeedbackStatus,
} from "@/lib/planning/tester-feedback-api";
import {
  loadTesterFeedback,
  saveTesterFeedback,
  type NewTesterFeedback,
  type TesterFeedback,
  type TesterFeedbackStatus,
} from "@/lib/planning/tester-feedback";
import type { TesterFeedbackStorageMode } from "@/lib/planning/tester-feedback-server";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type TesterFeedbackContextValue = {
  isReady: boolean;
  storage: TesterFeedbackStorageMode | null;
  syncError: string | null;
  items: TesterFeedback[];
  refreshFeedback: () => Promise<void>;
  submitFeedback: (input: NewTesterFeedback) => Promise<TesterFeedback>;
  updateFeedbackStatus: (id: string, status: TesterFeedbackStatus) => Promise<void>;
  removeFeedback: (id: string) => Promise<void>;
};

const TesterFeedbackContext = createContext<TesterFeedbackContextValue | null>(null);

const REFRESH_INTERVAL_MS = 30_000;

function sortItems(items: TesterFeedback[]): TesterFeedback[] {
  return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function applyItems(
  items: TesterFeedback[],
  setItems: (items: TesterFeedback[]) => void,
): TesterFeedback[] {
  const next = sortItems(items);
  setItems(next);
  saveTesterFeedback(next);
  return next;
}

export function TesterFeedbackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TesterFeedback[]>(() => loadTesterFeedback());
  const [isReady, setIsReady] = useState(false);
  const [storage, setStorage] = useState<TesterFeedbackStorageMode | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const migratingRef = useRef(false);

  const refreshFeedback = useCallback(async () => {
    const { items: remoteItems, storage: remoteStorage } = await fetchTesterFeedback();
    setStorage(remoteStorage);

    const localItems = loadTesterFeedback();
    const remoteIds = new Set(remoteItems.map((item) => item.id));
    const missingLocal = localItems.filter((item) => !remoteIds.has(item.id));

    if (missingLocal.length > 0 && !migratingRef.current) {
      migratingRef.current = true;
      try {
        const uploaded = await Promise.all(missingLocal.map((item) => createTesterFeedback(item)));
        applyItems([...uploaded, ...remoteItems], setItems);
        return;
      } catch (error) {
        console.error("Failed to migrate local tester feedback", error);
      } finally {
        migratingRef.current = false;
      }
    }

    applyItems(remoteItems, setItems);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      try {
        await refreshFeedback();
        if (!cancelled) setSyncError(null);
      } catch (error) {
        console.error("Failed to load tester feedback", error);
        if (!cancelled) {
          setSyncError(error instanceof Error ? error.message : "Could not sync tester feedback.");
          applyItems(loadTesterFeedback(), setItems);
        }
      } finally {
        if (!cancelled) setIsReady(true);
      }
    }

    void initialLoad();

    function onFocus() {
      void refreshFeedback().catch((error) => {
        console.error("Failed to refresh tester feedback", error);
      });
    }

    const intervalId = window.setInterval(() => {
      void refreshFeedback().catch((error) => {
        console.error("Failed to refresh tester feedback", error);
      });
    }, REFRESH_INTERVAL_MS);

    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshFeedback]);

  const submitFeedback = useCallback(async (input: NewTesterFeedback) => {
    const item = await createTesterFeedback(input);
    setItems((prev) => {
      const next = sortItems([item, ...prev]);
      saveTesterFeedback(next);
      return next;
    });
    setSyncError(null);
    return item;
  }, []);

  const updateFeedbackStatus = useCallback(async (id: string, status: TesterFeedbackStatus) => {
    let previous: TesterFeedback[] = [];
    setItems((prev) => {
      previous = prev;
      const next = sortItems(
        prev.map((item) =>
          item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
        ),
      );
      saveTesterFeedback(next);
      return next;
    });

    try {
      const updated = await patchTesterFeedbackStatus(id, status);
      setItems((prev) => {
        const next = sortItems(prev.map((item) => (item.id === id ? updated : item)));
        saveTesterFeedback(next);
        return next;
      });
      setSyncError(null);
    } catch (error) {
      setItems(() => {
        saveTesterFeedback(previous);
        return previous;
      });
      throw error;
    }
  }, []);

  const removeFeedback = useCallback(async (id: string) => {
    let previous: TesterFeedback[] = [];
    setItems((prev) => {
      previous = prev;
      const next = sortItems(prev.filter((item) => item.id !== id));
      saveTesterFeedback(next);
      return next;
    });

    try {
      await deleteTesterFeedback(id);
      setSyncError(null);
    } catch (error) {
      setItems(() => {
        saveTesterFeedback(previous);
        return previous;
      });
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      storage,
      syncError,
      items,
      refreshFeedback,
      submitFeedback,
      updateFeedbackStatus,
      removeFeedback,
    }),
    [
      isReady,
      storage,
      syncError,
      items,
      refreshFeedback,
      submitFeedback,
      updateFeedbackStatus,
      removeFeedback,
    ],
  );

  return (
    <TesterFeedbackContext.Provider value={value}>{children}</TesterFeedbackContext.Provider>
  );
}

export function useTesterFeedback() {
  const ctx = useContext(TesterFeedbackContext);
  if (!ctx) throw new Error("useTesterFeedback must be used within TesterFeedbackProvider");
  return ctx;
}
