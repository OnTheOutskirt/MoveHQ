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
  filledDriverNamesFromAssignment,
  getSlotCrewId,
  jobCrewSlots,
} from "@/lib/dispatch/crew-slots";
import { useTerminology } from "@/lib/terminology/use-terminology";
import {
  formatDispatchScheduleLine,
  formatDispatchSlotCount,
} from "@/lib/dispatch/job-card-display";
import { effectiveDispatchJob, effectiveRequirements } from "@/lib/dispatch/job-requirements";
import {
  DISPATCH_JOB_PAIR_DRAG_TYPE,
  encodeJobPairDrag,
  formatJobPairingLabel,
  parseJobPairDrag,
  validateJobPairing,
} from "@/lib/dispatch/job-pairing";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatFtaBooking, isAfternoonDispatchJob } from "@/lib/dispatch/fta";
import { pmJobRowClass } from "@/lib/dispatch/pm-job-styles";
import { jobHasVisibleNote } from "@/lib/dispatch/job-notes";
import { useFleet } from "@/components/providers/FleetProvider";
import type { DispatchJob } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { DispatchJobRouteLine } from "@/components/dispatch/DispatchJobRouteLine";
import { GripVertical, StickyNote, Truck, Users, X } from "lucide-react";
import { useMemo, useState } from "react";

type DispatchJobCardProps = {
  job: DispatchJob;
  selected: boolean;
  onSelect: () => void;
};

export function DispatchJobCard({ job, selected, onSelect }: DispatchJobCardProps) {
  const {
    dateKey,
    day,
    getAssignmentForJob,
    getAssignment,
    assignCrewSlot,
    assignTruck,
    unassignTruck,
    patchJob,
    pairWithJob,
    unpairJob,
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
  const [jobPairDragOver, setJobPairDragOver] = useState(false);
  const [pairConfirm, setPairConfirm] = useState<{
    partnerJobId: string;
    message: string;
    crewSizeMismatch?: boolean;
  } | null>(null);
  const { terminology } = useTerminology();
  const isPmJob = isAfternoonDispatchJob(job);

  const pairedJobs = useMemo(() => {
    const ids = assignment.pairedJobIds ?? [];
    return ids
      .map((id) => day.jobs.find((j) => j.id === id))
      .filter((j): j is DispatchJob => Boolean(j));
  }, [assignment.pairedJobIds, day.jobs]);

  const slots = useMemo(
    () =>
      jobCrewSlots(effectiveJob, terminology, {
        skipperAlsoDriver: assignment.skipperAlsoDriver,
      }),
    [effectiveJob, terminology, assignment.skipperAlsoDriver],
  );
  const { filled, required } = countFilledCrewSlots(effectiveJob, assignment);
  const scheduleLine = formatDispatchScheduleLine(job);

  const { activeCrewForDispatch, activeTrucksForDispatch } = useFleet();
  const crewRoster = activeCrewForDispatch();
  const filledDriverNames = useMemo(
    () => filledDriverNamesFromAssignment(assignment, crewRoster),
    [assignment, crewRoster],
  );
  const truckRoster = activeTrucksForDispatch(dateKey);
  const assignedTrucks = assignment.truckIds
    .map((id) => truckRoster.find((t) => t.id === id))
    .filter(Boolean);

  const hasNote = jobHasVisibleNote(job, assignment);
  const canAcceptPair = job.isFtaJob && job.ftaBooking;
  const canDragForPair = job.isFtaJob && job.ftaBooking;

  function applyJobPair(partnerJobId: string) {
    pairWithJob(job.id, partnerJobId);
    setPairConfirm(null);
    setJobPairDragOver(false);
  }

  function handleJobPairDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setJobPairDragOver(false);
    if (!canAcceptPair) return;
    const partnerId = parseJobPairDrag(e.dataTransfer.getData(DISPATCH_JOB_PAIR_DRAG_TYPE));
    if (!partnerId) return;
    const incoming = day.jobs.find((j) => j.id === partnerId);
    if (!incoming) return;
    const result = validateJobPairing(job, pairedJobs, incoming, getAssignment);
    if (result.ok) {
      applyJobPair(partnerId);
      return;
    }
    setPairConfirm({
      partnerJobId: partnerId,
      message: result.crewSizeMismatch
        ? (result.message ?? "Crew sizes must match before pairing.")
        : (result.message ?? "These jobs may not fill a crew-day together."),
      crewSizeMismatch: Boolean(result.crewSizeMismatch),
    });
  }

  function handleTruckDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTruckDragOver(false);
    const truckRaw = e.dataTransfer.getData(DISPATCH_TRUCK_DRAG_TYPE);
    const truckId = parseTruckDragPayload(truckRaw);
    if (truckId) assignTruck(job.id, truckId);
  }

  return (
    <>
      <article
        className={cn(
          "rounded-xl border bg-white shadow-sm transition-shadow",
          selected ? "border-brand-400 ring-2 ring-brand-100" : "border-slate-200",
          isPmJob && "border-l-4 border-l-indigo-400",
          jobPairDragOver && canAcceptPair && (isPmJob ? "ring-2 ring-indigo-200" : "ring-2 ring-brand-200"),
        )}
        onClick={onSelect}
        onDragOver={(e) => {
          if (canAcceptPair && e.dataTransfer.types.includes(DISPATCH_JOB_PAIR_DRAG_TYPE)) {
            e.preventDefault();
            setJobPairDragOver(true);
          }
        }}
        onDragLeave={() => setJobPairDragOver(false)}
        onDrop={handleJobPairDrop}
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
                {canDragForPair ? (
                  <span
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      e.dataTransfer.setData(
                        DISPATCH_JOB_PAIR_DRAG_TYPE,
                        encodeJobPairDrag(job.id),
                      );
                      e.dataTransfer.effectAllowed = "link";
                    }}
                    className="cursor-grab text-slate-300 hover:text-slate-500 active:cursor-grabbing"
                    title="Drag to pair with another job this day"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <GripVertical className="h-4 w-4" />
                  </span>
                ) : null}
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
                <p
                  className={cn(
                    "mt-1 text-[10px] font-medium",
                    isPmJob ? "text-indigo-800" : "text-slate-600",
                  )}
                >
                  {formatFtaBooking(job.ftaBooking)}
                </p>
              ) : null}
              {pairedJobs.length > 0 ? (
                <ul className="mt-1.5 space-y-0.5">
                  {pairedJobs.map((paired) => (
                    <li
                      key={paired.id}
                      className={cn(
                        "flex items-center justify-between gap-1 text-[10px]",
                        isPmJob ? pmJobRowClass.pairedName : "text-brand-800",
                      )}
                    >
                      <span>
                        + {paired.customerName}
                        {paired.ftaBooking
                          ? ` · ${formatJobPairingLabel(paired.ftaBooking)}`
                          : ""}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          unpairJob(job.id, paired.id);
                        }}
                        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        aria-label={`Unpair ${paired.customerName}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : canAcceptPair ? (
                <p className="mt-1 text-[10px] text-slate-400">
                  Drag another {job.ftaBooking?.crewSize}-person job here to pair
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-1">
              {job.isFtaJob && job.ftaLabel ? (
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] font-bold",
                    isPmJob ? "bg-indigo-100 text-indigo-800" : "bg-slate-100 text-slate-700",
                  )}
                >
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

          <DispatchJobRouteLine job={job} className="mt-1.5" />
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
                  skipperAlsoDriver={assignment.skipperAlsoDriver}
                  filledDriverNames={
                    slot.kind === "skipper" ? filledDriverNames : undefined
                  }
                  onToggleSkipperDriver={
                    slot.kind === "skipper"
                      ? () => {
                          if (!assignment.skipperAlsoDriver) {
                            patchJob(job.id, {
                              skipperAlsoDriver: true,
                              driverIds: assignment.driverIds.map(() => null),
                            });
                          } else {
                            patchJob(job.id, { skipperAlsoDriver: false });
                          }
                        }
                      : undefined
                  }
                  onAssign={(crewId) => assignCrewSlot(job.id, slot, crewId)}
                  onClear={() => assignCrewSlot(job.id, slot, null)}
                />
              ))}
            </div>
          </div>

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setTruckDragOver(true);
            }}
            onDragLeave={() => setTruckDragOver(false)}
            onDrop={handleTruckDrop}
            className={cn(
              "rounded-lg border border-dashed px-2 py-1.5 transition-colors",
              truckDragOver ? "border-brand-300 bg-brand-50" : "border-slate-200",
            )}
          >
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Truck className="h-3 w-3" />
              Trucks
            </p>
            {assignedTrucks.length === 0 ? (
              <p className="text-[10px] text-slate-400">Drop trucks from the left panel</p>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {assignedTrucks.map((truck) =>
                  truck ? (
                    <li key={truck.id}>
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-0.5 text-[10px] font-medium text-slate-800">
                        <span className="max-w-[9rem] truncate">{truck.label}</span>
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
      </article>

      <ConfirmDialog
        open={pairConfirm != null}
        onClose={() => setPairConfirm(null)}
        onConfirm={() => {
          if (pairConfirm && !pairConfirm.crewSizeMismatch) {
            applyJobPair(pairConfirm.partnerJobId);
          }
        }}
        title={
          pairConfirm?.crewSizeMismatch ? "Crew size doesn't match" : "Pair these jobs?"
        }
        description={
          pairConfirm
            ? pairConfirm.crewSizeMismatch
              ? pairConfirm.message
              : `${pairConfirm.message} Pair anyway?`
            : ""
        }
        confirmLabel={pairConfirm?.crewSizeMismatch ? "OK" : "Pair anyway"}
        alertOnly={pairConfirm?.crewSizeMismatch}
      />
    </>
  );
}
