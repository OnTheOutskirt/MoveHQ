"use client";

import { defaultCrewRecordsStore } from "@/lib/operations/crew-records-defaults";
import {
  generateCrewRecordId,
  loadCrewRecordsStore,
  saveCrewRecordsStore,
  type NewCrewIssue,
  type NewSkipperRating,
} from "@/lib/operations/crew-records-storage";
import type { CrewIssue, CrewRecordsStore, SkipperRating } from "@/lib/operations/crew-records-types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CrewRecordsContextValue = {
  isReady: boolean;
  issues: CrewIssue[];
  skipperRatings: SkipperRating[];
  addIssue: (input: NewCrewIssue) => CrewIssue;
  updateIssue: (id: string, patch: Partial<CrewIssue>) => void;
  addSkipperRating: (input: NewSkipperRating) => SkipperRating;
};

const CrewRecordsContext = createContext<CrewRecordsContextValue | null>(null);

export function CrewRecordsProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<CrewRecordsStore>(defaultCrewRecordsStore);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setStore(loadCrewRecordsStore());
    setIsReady(true);
  }, []);

  const addIssue = useCallback((input: NewCrewIssue) => {
    const issue: CrewIssue = {
      ...input,
      id: generateCrewRecordId("issue"),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => {
      const next = { ...prev, issues: [issue, ...prev.issues] };
      saveCrewRecordsStore(next);
      return next;
    });
    return issue;
  }, []);

  const updateIssue = useCallback((id: string, patch: Partial<CrewIssue>) => {
    setStore((prev) => {
      const next = {
        ...prev,
        issues: prev.issues.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      };
      saveCrewRecordsStore(next);
      return next;
    });
  }, []);

  const addSkipperRating = useCallback((input: NewSkipperRating) => {
    const rating: SkipperRating = {
      ...input,
      id: generateCrewRecordId("rate"),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => {
      const next = { ...prev, skipperRatings: [rating, ...prev.skipperRatings] };
      saveCrewRecordsStore(next);
      return next;
    });
    return rating;
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      issues: store.issues,
      skipperRatings: store.skipperRatings,
      addIssue,
      updateIssue,
      addSkipperRating,
    }),
    [isReady, store.issues, store.skipperRatings, addIssue, updateIssue, addSkipperRating],
  );

  return <CrewRecordsContext.Provider value={value}>{children}</CrewRecordsContext.Provider>;
}

export function useCrewRecords() {
  const ctx = useContext(CrewRecordsContext);
  if (!ctx) throw new Error("useCrewRecords must be used within CrewRecordsProvider");
  return ctx;
}
