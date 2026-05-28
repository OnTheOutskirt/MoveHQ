"use client";

import {
  DayBeforeConfirmationPill,
  useDayBeforeConfirmationForJob,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import { DispatchRequirementsEditor } from "@/components/dispatch/DispatchRequirementsEditor";
import { findDispatchJob, useDispatch } from "@/components/dispatch/DispatchProvider";
import { getSlotCrewId } from "@/lib/dispatch/crew-slots";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { effectiveDispatchJob, effectiveRequirements } from "@/lib/dispatch/job-requirements";
import { formatFtaBooking } from "@/lib/dispatch/fta";
import { useFleet } from "@/components/providers/FleetProvider";
import { formatTruckInline } from "@/lib/operations/fleet";
import { DetailSidebar } from "@/components/ui/DetailSidebar";
import { useMoves } from "@/components/moves/MovesProvider";
import { salesMovePath } from "@/lib/navigation/routes";
import { ClipboardList, StickyNote } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";

type DispatchJobSidebarProps = {
  jobId: string | null;
  onClose: () => void;
};

export function DispatchJobSidebar({ jobId, onClose }: DispatchJobSidebarProps) {
  const {
    dateKey,
    day,
    getAssignment,
    getAssignmentForJob,
    setDispatchNotes,
    setJobNote,
    setCrewSizeNeeded,
    setTrucksNeeded,
    resetCrewSizeToPlanned,
    resetTrucksToPlanned,
  } = useDispatch();
  const { getMoveById } = useMoves();

  const { activeCrewForDispatch, activeTrucksForDispatch } = useFleet();
  const crewRoster = activeCrewForDispatch();
  const truckRoster = activeTrucksForDispatch(dateKey);
  const job = jobId ? findDispatchJob(day, jobId) : undefined;
  const open = Boolean(job);
  const assignment = job ? getAssignmentForJob(job) : null;
  const rawAssignment = job ? getAssignment(job.id) : null;
  const effectiveJob = job && rawAssignment ? effectiveDispatchJob(job, rawAssignment) : null;
  const requirements = job && rawAssignment ? effectiveRequirements(job, rawAssignment) : null;
  const move = job?.moveId ? getMoveById(job.moveId) : undefined;
  const jobDay = move?.jobDays.find((d) => d.id === job?.jobDayId);

  const { confirmation: dayBeforeConfirmation } = useDayBeforeConfirmationForJob(job, move);

  const { slotsForJob } = useTerminology();

  const crewSlots = effectiveJob ? slotsForJob(effectiveJob) : [];
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
      headerExtra={
        job && dayBeforeConfirmation ? (
          <DayBeforeConfirmationPill jobId={job.id} confirmation={dayBeforeConfirmation} />
        ) : null
      }
      widthClassName="max-w-xl"
    >
      {job && assignment ? (
        <div className="space-y-4">
          {job.moveId ? (
            <Link
              href={salesMovePath(job.moveId)}
              className="inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              Open move record →
            </Link>
          ) : null}

          <section className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-3">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
              <StatCell label="Departure" value={job.departureWindow ?? "—"} />
              <StatCell label="Arrival" value={job.arrivalWindow ?? "—"} />
              <StatCell label="Duration" value={job.durationLabel ?? "—"} />
              <StatCell
                label="Crew"
                value={
                  requirements?.crewOverridden
                    ? `${requirements.crewSizeNeeded} (planned ${job.crewSizeNeeded})`
                    : String(job.crewSizeNeeded)
                }
              />
              <StatCell
                label="Trucks"
                value={
                  requirements?.trucksOverridden
                    ? `${requirements.trucksNeeded} (planned ${job.trucksNeeded})`
                    : String(job.trucksNeeded)
                }
              />
            </dl>
            {rawAssignment ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Adjust crew & trucks
                </p>
                <DispatchRequirementsEditor
                  job={job}
                  assignment={rawAssignment}
                  onCrewSizeChange={(size) => setCrewSizeNeeded(job.id, size)}
                  onTrucksNeededChange={(count) => setTrucksNeeded(job.id, count)}
                  onResetCrew={() => resetCrewSizeToPlanned(job.id)}
                  onResetTrucks={() => resetTrucksToPlanned(job.id)}
                />
              </div>
            ) : null}
          </section>

          {(job.originSummary || job.destinationSummary) && (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <StatCell label="Origin" value={job.originSummary ?? "—"} multiline />
              <StatCell label="Destination" value={job.destinationSummary ?? "—"} multiline />
            </dl>
          )}

          {job.services?.length || job.accessNotes ? (
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {job.services?.length ? (
                <StatCell label="Services" value={job.services.join(", ")} multiline />
              ) : null}
              {job.accessNotes ? (
                <StatCell label="Access" value={job.accessNotes} multiline />
              ) : null}
            </dl>
          ) : null}

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <label
              htmlFor={`dispatch-job-note-${job.id}`}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900"
            >
              <StickyNote className="h-3 w-3" aria-hidden />
              Job note
            </label>
            <textarea
              id={`dispatch-job-note-${job.id}`}
              value={assignment.jobNote}
              onChange={(e) => setJobNote(job.id, e.target.value)}
              rows={2}
              placeholder="Pin for dispatch card"
              className="mt-1 w-full resize-y rounded-md border-0 bg-transparent px-0 py-0 text-sm leading-snug text-amber-950 placeholder:text-amber-800/40 focus:outline-none focus:ring-0"
            />
            {!assignment.jobNote.trim() && job.pinnedNote?.trim() ? (
              <p className="mt-1 text-xs text-amber-800/80">From move: {job.pinnedNote}</p>
            ) : null}
          </div>

          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
            <label
              htmlFor={`dispatch-ops-note-${job.id}`}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900"
            >
              <ClipboardList className="h-3 w-3" aria-hidden />
              Dispatch notes
            </label>
            <textarea
              id={`dispatch-ops-note-${job.id}`}
              value={
                assignment.dispatchNotes ?? job.dispatchNotes ?? jobDay?.dispatchNotes ?? ""
              }
              onChange={(e) => setDispatchNotes(job.id, e.target.value)}
              rows={2}
              placeholder="Gate, parking, lead instructions…"
              className="mt-1 w-full resize-y rounded-md border-0 bg-transparent px-0 py-0 text-sm leading-snug text-sky-950 placeholder:text-sky-800/40 focus:outline-none focus:ring-0"
            />
          </div>

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
