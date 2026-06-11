"use client";

import { useCrewRecords } from "@/components/providers/CrewRecordsProvider";
import { useClaims } from "@/components/providers/ClaimsProvider";
import { defaultSkipperCrewId } from "@/lib/crew-app/field-capture-crew-map";
import { routeFieldCapture } from "@/lib/crew-app/field-capture-routing";
import type { JobFieldMediaEntry } from "@/lib/crew-app/field-capture-types";
import {
  END_OF_DAY_CHECKLIST_ITEMS,
  readJobFieldState,
  writeJobFieldState,
  type JobFieldState,
} from "@/lib/crew-app/job-field-storage";
import type { CrewAppJob } from "@/lib/crew-app/types";
import { useCallback } from "react";

export function useFieldCaptureActions() {
  const crewRecords = useCrewRecords();
  const claims = useClaims();

  const persistAndRoute = useCallback(
    (
      job: CrewAppJob,
      entry: JobFieldMediaEntry,
      fieldState?: JobFieldState,
    ): JobFieldMediaEntry => {
      const state = fieldState ?? readJobFieldState(job.id);
      const pending = { ...entry, syncStatus: "pending" as const };
      const withPending: JobFieldState = {
        ...state,
        jobMedia: [pending, ...state.jobMedia.filter((m) => m.id !== entry.id)],
      };
      writeJobFieldState(job.id, withPending);

      if (!crewRecords.isReady || !claims.isReady) {
        return pending;
      }

      try {
        const result = routeFieldCapture(
          { media: pending, jobId: job.id, customerName: job.customerName },
          {
            addSkipperRating: crewRecords.addSkipperRating,
            updateSkipperRating: crewRecords.updateSkipperRating,
            findSkipperRating: (skipperId, jobRef, date) =>
              crewRecords.skipperRatings.find(
                (r) => r.skipperId === skipperId && r.jobRef === jobRef && r.date === date,
              ),
            addClaim: claims.addClaim,
            updateClaim: claims.updateClaim,
            findOpenClaimForMove: (moveId) =>
              claims.claims.find(
                (c) =>
                  c.moveId === moveId &&
                  c.status !== "completed" &&
                  c.status !== "denied",
              ),
          },
        );
        const synced: JobFieldState = {
          ...withPending,
          jobMedia: withPending.jobMedia.map((m) =>
            m.id === entry.id ? result.media : m,
          ),
        };
        let finalState = synced;
        if (
          result.media.category === "claim_damage" ||
          result.media.category === "pre_existing_damage"
        ) {
          const damageItem = "Damage photos uploaded (if any)" as const;
          if (END_OF_DAY_CHECKLIST_ITEMS.includes(damageItem)) {
            finalState = {
              ...synced,
              endOfDayChecklist: {
                ...synced.endOfDayChecklist,
                [damageItem]: true,
              },
            };
          }
        }
        writeJobFieldState(job.id, finalState);
        return result.media;
      } catch {
        const failed: JobFieldState = {
          ...withPending,
          jobMedia: withPending.jobMedia.map((m) =>
            m.id === entry.id ? { ...m, syncStatus: "failed" as const } : m,
          ),
        };
        writeJobFieldState(job.id, failed);
        return { ...pending, syncStatus: "failed" };
      }
    },
    [crewRecords, claims],
  );

  const retryPendingForJob = useCallback(
    (job: CrewAppJob) => {
      const state = readJobFieldState(job.id);
      const pending = state.jobMedia.filter(
        (m) => m.syncStatus === "pending" || m.syncStatus === "failed",
      );
      for (const entry of pending) {
        persistAndRoute(job, entry, readJobFieldState(job.id));
      }
    },
    [persistAndRoute],
  );

  const defaultAssigneeId = useCallback(
    (job: CrewAppJob) => defaultSkipperCrewId(job),
    [],
  );

  return {
    persistAndRoute,
    retryPendingForJob,
    defaultAssigneeId,
    isReady: crewRecords.isReady && claims.isReady,
  };
}
