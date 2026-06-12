"use client";

import {
  generateTesterFeedbackId,
  loadTesterFeedback,
  saveTesterFeedback,
  TESTER_FEEDBACK_STORAGE_KEY,
  type NewTesterFeedback,
  type TesterFeedback,
  type TesterFeedbackStatus,
} from "@/lib/planning/tester-feedback";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type TesterFeedbackContextValue = {
  isReady: boolean;
  items: TesterFeedback[];
  submitFeedback: (input: NewTesterFeedback) => TesterFeedback;
  updateFeedbackStatus: (id: string, status: TesterFeedbackStatus) => void;
  removeFeedback: (id: string) => void;
};

const TesterFeedbackContext = createContext<TesterFeedbackContextValue | null>(null);

export function TesterFeedbackProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<TesterFeedback[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const loaded = loadTesterFeedback();
    setItems(loaded);
    saveTesterFeedback(loaded);
    setIsReady(true);

    function onStorage(event: StorageEvent) {
      if (event.key !== TESTER_FEEDBACK_STORAGE_KEY) return;
      setItems(loadTesterFeedback());
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const submitFeedback = useCallback((input: NewTesterFeedback) => {
    const now = new Date().toISOString();
    const item: TesterFeedback = {
      ...input,
      id: generateTesterFeedbackId(),
      status: "open",
      createdAt: now,
      updatedAt: now,
    };
    setItems((prev) => {
      const next = [item, ...prev];
      saveTesterFeedback(next);
      return next;
    });
    return item;
  }, []);

  const updateFeedbackStatus = useCallback((id: string, status: TesterFeedbackStatus) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id ? { ...item, status, updatedAt: new Date().toISOString() } : item,
      );
      saveTesterFeedback(next);
      return next;
    });
  }, []);

  const removeFeedback = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveTesterFeedback(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      items,
      submitFeedback,
      updateFeedbackStatus,
      removeFeedback,
    }),
    [isReady, items, submitFeedback, updateFeedbackStatus, removeFeedback],
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
