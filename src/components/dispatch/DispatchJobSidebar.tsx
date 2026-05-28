"use client";

import { DayBeforeConfirmationBlock } from "@/components/dispatch/DayBeforeConfirmationBlock";
import { findDispatchJob, useDispatch } from "@/components/dispatch/DispatchProvider";
import { getSlotCrewId, jobCrewSlots } from "@/lib/dispatch/crew-slots";
import {
  resolveDayBeforeConfirmation,
  type DayBeforeConfirmationStatus,
} from "@/lib/dispatch/day-before-confirmation";
import { readConfirmationOverride } from "@/lib/dispatch/confirmation-storage";
import { formatFtaBooking } from "@/lib/dispatch/fta";
import { jobNotePreview } from "@/lib/dispatch/job-notes";
import { useFleet } from "@/components/providers/FleetProvider";
import { formatTruckInline } from "@/lib/operations/fleet";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { useMoves } from "@/components/moves/MovesProvider";
import { StickyNote } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DispatchJobSidebarProps = {
  jobId: string | null;
  onClose: () => void;
};

export function DispatchJobSidebar({ jobId, onClose }: DispatchJobSidebarProps) {
  const { day, getAssignmentForJob, setDispatchNotes, setJobNote } = useDispatch();
  const { getMoveById } = useMoves();

  const { activeCrewForDispatch, activeTrucksForDispatch } = useFleet();
  const crewRoster = activeCrewForDispatch();
  const truckRoster = activeTrucksForDispatch();
  const job = jobId ? findDispatchJob(day, jobId) : undefined;
  const open = Boolean(job);
  const assignment = job ? getAssignmentForJob(job) : null;
  const move = job?.moveId ? getMoveById(job.moveId) : undefined;
  const jobDay = move?.jobDays.find((d) => d.id === job?.jobDayId);

  const [confirmationOverride, setConfirmationOverride] =
    useState<DayBeforeConfirmationStatus | null>(null);

  useEffect(() => {
    if (!jobId) {
      setConfirmationOverride(null);
      return;
    }
    setConfirmationOverride(readConfirmationOverride(jobId));
  }, [jobId]);

  const dayBeforeConfirmation = useMemo(() => {
    if (!job) return null;
    return resolveDayBeforeConfirmation(job.date, {
      move,
      jobDayId: job.jobDayId,
      jobId: job.id,
      override: confirmationOverride,
    });
  }, [job, move, confirmationOverride]);

  const noteText = job && assignment ? jobNotePreview(job, assignment) : "";

  const crewSlots = job ? jobCrewSlots(job) : [];
  const filledSlots = crewSlots
    .map((slot) => {
      const id = assignment ? getSlotCrewId(assignment, slot) : null;
      if (!id) return null;
      const member = crewRoster.find((c) => c.id === id);
      return member ? { slot, member } : null;
    })
    .filter(Boolean);

  const truckLabels =
    assignment?.truckIds
      .map((id) => {
        const truck = truckRoster.find((t) => t.id === id);
        return truck ? formatTruckInline(truck) : id;
      })
      .join(", ") ?? "";

  return (
    <DetailSidebar
      open={open}
      onClose={onClose}
      title={job?.customerName ?? "Job"}
      description={job ? `${job.label} · ${job.date}` : undefined}
      widthClassName="max-w-xl"
    >
      {job && assignment ? (
        <div className="space-y-4">
          {job.moveId ? (
            <Link
              href={`/moves/${job.moveId}`}
              className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open move record →
            </Link>
          ) : null}

          {dayBeforeConfirmation ? (
            <DayBeforeConfirmationBlock
              jobId={job.id}
              confirmation={dayBeforeConfirmation}
              onOverrideChange={setConfirmationOverride}
            />
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
              <StatCell label="Arrival" value={job.arrivalWindow ?? "—"} />
              <StatCell label="Duration" value={job.durationLabel ?? "—"} />
              <StatCell label="Crew" value={String(job.crewSizeNeeded)} />
              <StatCell label="Trucks" value={String(job.trucksNeeded)} />
            </dl>
          </section>

          {(job.originSummary || job.destinationSummary) && (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCell label="Origin" value={job.originSummary ?? "—"} multiline />
              <StatCell label="Destination" value={job.destinationSummary ?? "—"} multiline />
            </dl>
          )}

          {job.services?.length || (job.accessNotes && job.accessNotes !== noteText) ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {job.services?.length ? (
                <StatCell label="Services" value={job.services.join(", ")} multiline />
              ) : null}
              {job.accessNotes && job.accessNotes !== noteText ? (
                <StatCell label="Access" value={job.accessNotes} multiline />
              ) : null}
            </dl>
          ) : null}

          {noteText ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
                <StickyNote className="h-3 w-3" />
                Job note
              </p>
              <p className="mt-0.5 line-clamp-3 text-sm text-amber-950">{noteText}</p>
            </div>
          ) : null}

          {job.ftaBooking ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-900">
                FTA · {job.ftaLabel ?? "booking"}
              </p>
              <p className="mt-0.5 text-sm text-emerald-950">{formatFtaBooking(job.ftaBooking)}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Crew slots
              </p>
              {filledSlots.length > 0 ? (
                <ul className="mt-1.5 grid gap-1 sm:grid-cols-1">
                  {filledSlots.map((entry) =>
                    entry ? (
                      <li
                        key={`${entry.slot.kind}-${"index" in entry.slot ? entry.slot.index : 0}`}
                        className="flex gap-2 text-sm text-slate-800"
                      >
                        <span className="w-14 shrink-0 text-[11px] font-medium text-slate-500">
                          {entry.slot.label}
                        </span>
                        <span className="min-w-0 truncate">{entry.member.name}</span>
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : (
                <p className="mt-1 text-sm text-slate-500">None assigned</p>
              )}
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Trucks
              </p>
              {truckLabels ? (
                <p className="mt-1.5 text-sm text-slate-800">{truckLabels}</p>
              ) : (
                <p className="mt-1 text-sm text-slate-500">None assigned</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Job note
              </label>
              <textarea
                value={assignment.jobNote}
                onChange={(e) => setJobNote(job.id, e.target.value)}
                rows={2}
                placeholder="Pin for dispatch card"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Dispatch notes
              </label>
              <textarea
                value={
                  assignment.dispatchNotes ?? job.dispatchNotes ?? jobDay?.dispatchNotes ?? ""
                }
                onChange={(e) => setDispatchNotes(job.id, e.target.value)}
                rows={2}
                placeholder="Gate, parking, lead instructions…"
                className="mt-1 w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          {jobDay?.customerNotes ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Customer notes
              </p>
              <p className="mt-1 line-clamp-4 text-sm text-slate-700">{jobDay.customerNotes}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </DetailSidebar>
  );
}

function StatCell({
  label,
  value,
  multiline,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd
        className={
          multiline
            ? "mt-0.5 text-sm leading-snug text-slate-800"
            : "mt-0.5 truncate text-sm font-medium text-slate-900"
        }
      >
        {value}
      </dd>
    </div>
  );
}
