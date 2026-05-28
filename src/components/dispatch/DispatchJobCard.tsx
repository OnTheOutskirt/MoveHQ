"use client";

import { CrewRoleSlot } from "@/components/dispatch/CrewRoleSlot";
import {
  DISPATCH_TRUCK_DRAG_TYPE,
  parseTruckDragPayload,
} from "@/components/dispatch/DispatchTrucksPanel";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { countFilledCrewSlots, getSlotCrewId, jobCrewSlots } from "@/lib/dispatch/crew-slots";
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
  const { getAssignmentForJob, assignCrewSlot, assignTruck, unassignTruck } = useDispatch();
  const assignment = getAssignmentForJob(job);
  const [truckDragOver, setTruckDragOver] = useState(false);

  const slots = useMemo(() => jobCrewSlots(job), [job]);
  const { filled, required } = countFilledCrewSlots(job, assignment);

  const { activeTrucksForDispatch } = useFleet();
  const truckRoster = activeTrucksForDispatch();
  const assignedTrucks = assignment.truckIds
    .map((id) => truckRoster.find((t) => t.id === id))
    .filter(Boolean);

  const hasNote = jobHasVisibleNote(job, assignment);

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
            <p className="text-xs text-slate-500">
              {job.label}
              {job.arrivalWindow ? ` · ${job.arrivalWindow}` : ""}
              {job.durationLabel ? ` · ${job.durationLabel}` : ""}
            </p>
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
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium capitalize text-slate-600">
              {job.status.replace("_", " ")}
            </span>
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
              ({filled}/{required})
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
                assignedTrucks.length < job.trucksNeeded
                  ? "text-amber-700"
                  : "text-slate-500",
              )}
            >
              ({assignedTrucks.length}/{job.trucksNeeded})
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
