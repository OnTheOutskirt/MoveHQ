"use client";

import { CrewRoleSlot } from "@/components/dispatch/CrewRoleSlot";
import {
  DayBeforeConfirmationPill,
  useDayBeforeConfirmationForJob,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import {
  DISPATCH_TRUCK_DRAG_TYPE,
  parseTruckDragPayload,
} from "@/components/dispatch/DispatchTrucksPanel";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { useMoves } from "@/components/moves/MovesProvider";
import {
  countFilledCrewSlots,
  countFilledRoleSlots,
  driversNeededForJob,
  getSlotCrewId,
  skippersNeededForJob,
} from "@/lib/dispatch/crew-slots";
import { useTerminology } from "@/lib/terminology/use-terminology";
import {
  formatDispatchScheduleLine,
  formatDispatchSlotCount,
} from "@/lib/dispatch/job-card-display";
import { effectiveDispatchJob, effectiveRequirements } from "@/lib/dispatch/job-requirements";
import { formatFtaBooking } from "@/lib/dispatch/fta";
import { jobHasVisibleNote } from "@/lib/dispatch/job-notes";
import { useFleet } from "@/components/providers/FleetProvider";
import { formatTruckInline } from "@/lib/operations/fleet";
import type { DispatchJob } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { MapPin, StickyNote, Truck, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

type DispatchJobCardProps = {
  job: DispatchJob;
  selected: boolean;
  onSelect: () => void;
};

export function DispatchJobCard({ job, selected, onSelect }: DispatchJobCardProps) {
  const {
    dateKey,
    getAssignmentForJob,
    getAssignment,
    assignCrewSlot,
    assignTruck,
    unassignTruck,
  } = useDispatch();
  const { getMoveById } = useMoves();
  const move = job.moveId ? getMoveById(job.moveId) : undefined;
  const { confirmation: dayBeforeConfirmation } = useDayBeforeConfirmationForJob(job, move);
  const assignment = getAssignmentForJob(job);
  const rawAssignment = getAssignment(job.id);
  const effectiveJob = useMemo(
    () => effectiveDispatchJob(job, rawAssignment),
    [job, rawAssignment],
  );
  const requirements = useMemo(
    () => (rawAssignment ? effectiveRequirements(job, rawAssignment) : null),
    [job, rawAssignment],
  );
  const [truckDragOver, setTruckDragOver] = useState(false);
  const { initial, slotsForJob } = useTerminology();

  const slots = useMemo(() => slotsForJob(effectiveJob), [slotsForJob, effectiveJob]);
  const { filled, required } = countFilledCrewSlots(effectiveJob, assignment);
  const scheduleLine = formatDispatchScheduleLine(job);

  const { activeTrucksForDispatch } = useFleet();
  const truckRoster = activeTrucksForDispatch(dateKey);
  const assignedTrucks = assignment.truckIds
    .map((id) => truckRoster.find((t) => t.id === id))
    .filter(Boolean);

  const hasNote = jobHasVisibleNote(job, assignment);
  const roleFilled = countFilledRoleSlots(effectiveJob, assignment);
  const skippersNeeded = skippersNeededForJob(effectiveJob);
  const driversNeeded = driversNeededForJob(effectiveJob);
  const trucksNeeded = effectiveJob.trucksNeeded;
  const jobShort =
    filled < required ||
    roleFilled.skippers < skippersNeeded ||
    roleFilled.drivers < driversNeeded ||
    assignedTrucks.length < trucksNeeded;

  function handleTruckDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTruckDragOver(false);
    const truckRaw = e.dataTransfer.getData(DISPATCH_TRUCK_DRAG_TYPE);
    const truckId = parseTruckDragPayload(truckRaw);
    if (truckId) assignTruck(job.id, truckId);
  }

  return (
    <article
      className={cn(
        "rounded-xl border bg-white shadow-sm transition-shadow",
        selected ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-200",
        job.isFtaJob && "border-l-4 border-l-emerald-400",
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="border-b border-slate-100 px-3 py-2.5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-slate-900">{job.customerName}</h3>
              {hasNote ? (
                <StickyNote
                  className="h-3.5 w-3.5 shrink-0 text-amber-500"
                  aria-label="Has note"
                />
              ) : null}
            </div>
            <p className="text-xs text-slate-500">{job.label}</p>
            {scheduleLine ? (
              <p className="mt-0.5 truncate text-[11px] text-slate-600">{scheduleLine}</p>
            ) : null}
            {job.ftaBooking ? (
              <p className="mt-1 text-[10px] font-medium text-emerald-800">
                FTA · {formatFtaBooking(job.ftaBooking)}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-1">
            {job.isFtaJob && job.ftaLabel ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800">
                {job.ftaLabel}
              </span>
            ) : null}
            {dayBeforeConfirmation ? (
              <DayBeforeConfirmationPill
                jobId={job.id}
                confirmation={dayBeforeConfirmation}
                compact
              />
            ) : null}
          </div>
        </div>

        {(job.originSummary || job.destinationSummary) && (
          <p className="mt-1.5 flex items-start gap-1 text-[11px] text-slate-600">
            <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
            <span className="line-clamp-2">
              {job.originSummary}
              {job.originSummary && job.destinationSummary ? " → " : ""}
              {job.destinationSummary}
            </span>
          </p>
        )}
      </div>

      <div className="space-y-2.5 px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
        {jobShort ? (
          <p className="flex flex-wrap gap-x-2 gap-y-0.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-medium text-amber-900">
            <span className={filled < required ? "text-amber-900" : "text-amber-800/70"}>
              Crew {filled}/{required}
            </span>
            <span
              className={
                roleFilled.skippers < skippersNeeded ? "text-amber-900" : "text-amber-800/70"
              }
            >
              {initial("skipper")} {roleFilled.skippers}/{skippersNeeded}
            </span>
            <span
              className={
                roleFilled.drivers < driversNeeded ? "text-amber-900" : "text-amber-800/70"
              }
            >
              {initial("driver")} {roleFilled.drivers}/{driversNeeded}
            </span>
            <span
              className={
                assignedTrucks.length < trucksNeeded ? "text-amber-900" : "text-amber-800/70"
              }
            >
              T {assignedTrucks.length}/{trucksNeeded}
            </span>
          </p>
        ) : null}
        <div>
          <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Users className="h-3 w-3" />
            Crew slots
            <span
              className={cn(
                "tabular-nums",
                filled < required ? "text-amber-700" : "text-slate-500",
              )}
            >
              {formatDispatchSlotCount(
                filled,
                required,
                job.crewSizeNeeded,
                requirements?.crewOverridden ?? false,
              )}
            </span>
          </p>
          <div className="flex flex-wrap items-stretch gap-1.5">
            {slots.map((slot) => (
              <CrewRoleSlot
                key={
                  slot.kind === "skipper"
                    ? "skipper"
                    : `${slot.kind}-${slot.index}`
                }
                compact
                label={slot.label}
                slot={slot}
                crewId={getSlotCrewId(assignment, slot)}
                onAssign={(crewId) => assignCrewSlot(job.id, slot, crewId)}
                onClear={() => assignCrewSlot(job.id, slot, null)}
              />
            ))}
          </div>
        </div>

        <div>
          <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Truck className="h-3 w-3" />
            Trucks
            <span
              className={cn(
                "tabular-nums",
                assignedTrucks.length < effectiveJob.trucksNeeded
                  ? "text-amber-700"
                  : "text-slate-500",
              )}
            >
              {formatDispatchSlotCount(
                assignedTrucks.length,
                effectiveJob.trucksNeeded,
                job.trucksNeeded,
                requirements?.trucksOverridden ?? false,
              )}
            </span>
          </p>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = "move";
              setTruckDragOver(true);
            }}
            onDragLeave={() => setTruckDragOver(false)}
            onDrop={handleTruckDrop}
            className={cn(
              "min-h-[2.25rem] rounded-lg border border-dashed px-2 py-1.5",
              truckDragOver ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-slate-50/50",
            )}
          >
            {assignedTrucks.length === 0 ? (
              <p className="text-[11px] text-slate-400">Drop trucks here</p>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {assignedTrucks.map((truck) =>
                  truck ? (
                    <li key={truck.id}>
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-0.5 text-[10px] font-medium text-slate-800">
                        <span className="max-w-[9rem] truncate">{formatTruckInline(truck)}</span>
                        <button
                          type="button"
                          onClick={() => unassignTruck(job.id, truck.id)}
                          className="rounded p-0.5 text-slate-400 hover:bg-slate-100"
                          aria-label={`Remove ${truck.label}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
