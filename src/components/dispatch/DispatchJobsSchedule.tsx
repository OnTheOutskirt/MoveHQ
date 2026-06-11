"use client";

import { DispatchJobScheduleRow } from "@/components/dispatch/DispatchJobScheduleRow";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  dispatchScheduleHourLabels,
  formatDispatchHourLabel,
  hourLabelPositionStyle,
} from "@/lib/dispatch/schedule-grid";
import type { DispatchJob } from "@/lib/dispatch/types";
import { useMemo, useState } from "react";

type DispatchJobsScheduleProps = {
  selectedJobId: string | null;
  onSelectJob: (jobId: string) => void;
};

type PendingTimeChange = {
  jobId: string;
  minutes: number;
  label: string;
};

type PendingPair = {
  anchorId: string;
  partnerId: string;
  message: string;
  needsResourceConfirm: boolean;
  crewSizeMismatch?: boolean;
};

type PendingUnpair = {
  anchorId: string;
  partnerId: string;
  partnerName: string;
};

export function DispatchJobsSchedule({ selectedJobId, onSelectJob }: DispatchJobsScheduleProps) {
  const { day, getAssignment, pairWithJobClearingPartner, setScheduleStart, unpairJob } =
    useDispatch();
  const hourLabels = dispatchScheduleHourLabels();
  const [pendingTime, setPendingTime] = useState<PendingTimeChange | null>(null);
  const [pendingPair, setPendingPair] = useState<PendingPair | null>(null);
  const [pendingUnpair, setPendingUnpair] = useState<PendingUnpair | null>(null);
  const [pairHoverTargetId, setPairHoverTargetId] = useState<string | null>(null);

  const pairedIdSet = useMemo(() => {
    const ids = new Set<string>();
    for (const job of day.jobs) {
      for (const partnerId of getAssignment(job.id).pairedJobIds ?? []) {
        ids.add(partnerId);
      }
    }
    return ids;
  }, [day.jobs, getAssignment]);

  const anchorJobs = useMemo(
    () => day.jobs.filter((job) => !pairedIdSet.has(job.id)),
    [day.jobs, pairedIdSet],
  );

  function pairedJobsFor(anchor: DispatchJob): DispatchJob[] {
    const ids = getAssignment(anchor.id).pairedJobIds ?? [];
    return ids
      .map((id) => day.jobs.find((j) => j.id === id))
      .filter((j): j is DispatchJob => Boolean(j));
  }

  if (day.jobs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
        <p className="text-sm text-slate-600">No jobs scheduled for this day.</p>
        <p className="mt-1 text-xs text-slate-400">Job days on booked moves appear here.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          className="grid shrink-0 border-b border-slate-200 bg-slate-50/80"
          style={{ gridTemplateColumns: "minmax(13rem, 16rem) minmax(0, 1fr)" }}
        >
          <div className="border-r border-slate-200 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Jobs</p>
          </div>
          <div className="relative h-8 px-1 py-1.5">
            {hourLabels.map((hour) => (
              <span
                key={hour}
                className="absolute top-1 text-[10px] font-medium tabular-nums text-slate-500"
                style={hourLabelPositionStyle(hour)}
              >
                {formatDispatchHourLabel(hour)}
              </span>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {anchorJobs.map((job) => (
            <DispatchJobScheduleRow
              key={job.id}
              job={job}
              pairedJobs={pairedJobsFor(job)}
              selectedJobId={selectedJobId}
              pairDropActive={pairHoverTargetId === job.id}
              onSelectJob={onSelectJob}
              onPairHoverChange={setPairHoverTargetId}
              onRequestTimeChange={(payload) => setPendingTime(payload)}
              onRequestPair={(payload) => {
                if (payload.crewSizeMismatch || payload.needsResourceConfirm) {
                  setPendingPair(payload);
                } else {
                  pairWithJobClearingPartner(payload.anchorId, payload.partnerId);
                  setPairHoverTargetId(null);
                }
              }}
              onRequestUnpair={(payload) => setPendingUnpair(payload)}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={pendingTime != null}
        onClose={() => setPendingTime(null)}
        onConfirm={() => {
          if (pendingTime) {
            setScheduleStart(pendingTime.jobId, pendingTime.minutes);
          }
          setPendingTime(null);
        }}
        title="Change job start time?"
        description={
          pendingTime
            ? `Move this job to start at ${pendingTime.label}? Crew and truck assignments stay as they are.`
            : ""
        }
        confirmLabel="Change time"
      />

      <ConfirmDialog
        open={pendingPair != null}
        onClose={() => {
          setPendingPair(null);
          setPairHoverTargetId(null);
        }}
        onConfirm={() => {
          if (pendingPair && !pendingPair.crewSizeMismatch) {
            pairWithJobClearingPartner(pendingPair.anchorId, pendingPair.partnerId);
          }
          setPendingPair(null);
          setPairHoverTargetId(null);
        }}
        title={
          pendingPair?.crewSizeMismatch
            ? "Crew size doesn't match"
            : "Pair these jobs?"
        }
        description={
          pendingPair
            ? pendingPair.crewSizeMismatch
              ? pendingPair.message
              : `${pendingPair.message}${
                  pendingPair.needsResourceConfirm
                    ? " Crew and trucks assigned to the afternoon job will return to Resources; the morning job keeps its assignments."
                    : " The afternoon job will stack after the morning job on the same crew-day."
                }`
            : ""
        }
        confirmLabel={pendingPair?.crewSizeMismatch ? "OK" : "Pair jobs"}
        alertOnly={pendingPair?.crewSizeMismatch}
      />

      <ConfirmDialog
        open={pendingUnpair != null}
        onClose={() => setPendingUnpair(null)}
        onConfirm={() => {
          if (pendingUnpair) {
            unpairJob(pendingUnpair.anchorId, pendingUnpair.partnerId);
            if (selectedJobId === pendingUnpair.partnerId) {
              onSelectJob(pendingUnpair.partnerId);
            }
          }
          setPendingUnpair(null);
        }}
        title="Move to own row?"
        description={
          pendingUnpair
            ? `${pendingUnpair.partnerName} will appear on its own schedule row again. Its time on the grid stays as scheduled.`
            : ""
        }
        confirmLabel="Move to own row"
      />
    </>
  );
}
