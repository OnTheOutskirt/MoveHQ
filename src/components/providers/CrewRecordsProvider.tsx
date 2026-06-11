"use client";

import { defaultCrewRecordsStore } from "@/lib/operations/crew-records-defaults";
import {
  generateCrewRecordId,
  loadCrewRecordsStore,
  saveCrewRecordsStore,
  type NewCrewIssue,
  type NewDriverReview,
  type NewSkipperRating,
} from "@/lib/operations/crew-records-storage";
import type {
  CrewIssue,
  CrewRecordsStore,
  DriverReview,
  SkipperRating,
} from "@/lib/operations/crew-records-types";
import { computeDriverRating } from "@/lib/operations/driver-violations";
import { computeSkipperRating } from "@/lib/operations/skipper-violations";
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
  driverReviews: DriverReview[];
  addIssue: (input: NewCrewIssue) => CrewIssue;
  updateIssue: (id: string, patch: Partial<CrewIssue>) => void;
  deleteIssue: (id: string) => void;
  addSkipperRating: (input: NewSkipperRating) => SkipperRating;
  updateSkipperRating: (id: string, patch: Partial<Omit<SkipperRating, "id" | "createdAt">>) => void;
  deleteSkipperRating: (id: string) => void;
  addDriverReview: (input: NewDriverReview) => DriverReview;
  updateDriverReview: (id: string, patch: Partial<Omit<DriverReview, "id" | "createdAt">>) => void;
  deleteDriverReview: (id: string) => void;
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

  const deleteIssue = useCallback((id: string) => {
    setStore((prev) => {
      const next = { ...prev, issues: prev.issues.filter((i) => i.id !== id) };
      saveCrewRecordsStore(next);
      return next;
    });
  }, []);

  const addSkipperRating = useCallback((input: NewSkipperRating) => {
    const violations = input.violations ?? [];
    const rating: SkipperRating = {
      ...input,
      violations,
      rating: computeSkipperRating(violations),
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

  const updateSkipperRating = useCallback(
    (id: string, patch: Partial<Omit<SkipperRating, "id" | "createdAt">>) => {
      setStore((prev) => {
        const next = {
          ...prev,
          skipperRatings: prev.skipperRatings.map((r) => {
            if (r.id !== id) return r;
            const merged = { ...r, ...patch };
            const violations = merged.violations ?? [];
            return { ...merged, violations, rating: computeSkipperRating(violations) };
          }),
        };
        saveCrewRecordsStore(next);
        return next;
      });
    },
    [],
  );

  const deleteSkipperRating = useCallback((id: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        skipperRatings: prev.skipperRatings.filter((r) => r.id !== id),
      };
      saveCrewRecordsStore(next);
      return next;
    });
  }, []);

  const addDriverReview = useCallback((input: NewDriverReview) => {
    const violations = input.violations ?? [];
    const review: DriverReview = {
      ...input,
      violations,
      rating: computeDriverRating(violations),
      id: generateCrewRecordId("drv"),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => {
      const next = { ...prev, driverReviews: [review, ...prev.driverReviews] };
      saveCrewRecordsStore(next);
      return next;
    });
    return review;
  }, []);

  const updateDriverReview = useCallback(
    (id: string, patch: Partial<Omit<DriverReview, "id" | "createdAt">>) => {
      setStore((prev) => {
        const next = {
          ...prev,
          driverReviews: prev.driverReviews.map((r) => {
            if (r.id !== id) return r;
            const merged = { ...r, ...patch };
            const violations = merged.violations ?? [];
            return { ...merged, violations, rating: computeDriverRating(violations) };
          }),
        };
        saveCrewRecordsStore(next);
        return next;
      });
    },
    [],
  );

  const deleteDriverReview = useCallback((id: string) => {
    setStore((prev) => {
      const next = {
        ...prev,
        driverReviews: prev.driverReviews.filter((r) => r.id !== id),
      };
      saveCrewRecordsStore(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isReady,
      issues: store.issues,
      skipperRatings: store.skipperRatings,
      driverReviews: store.driverReviews,
      addIssue,
      updateIssue,
      deleteIssue,
      addSkipperRating,
      updateSkipperRating,
      deleteSkipperRating,
      addDriverReview,
      updateDriverReview,
      deleteDriverReview,
    }),
    [
      isReady,
      store.issues,
      store.skipperRatings,
      store.driverReviews,
      addIssue,
      updateIssue,
      deleteIssue,
      addSkipperRating,
      updateSkipperRating,
      deleteSkipperRating,
      addDriverReview,
      updateDriverReview,
      deleteDriverReview,
    ],
  );

  return <CrewRecordsContext.Provider value={value}>{children}</CrewRecordsContext.Provider>;
}

export function useCrewRecords() {
  const ctx = useContext(CrewRecordsContext);
  if (!ctx) throw new Error("useCrewRecords must be used within CrewRecordsProvider");
  return ctx;
}
