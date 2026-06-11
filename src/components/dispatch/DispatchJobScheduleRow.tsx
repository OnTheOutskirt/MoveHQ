"use client";

import { CrewRoleSlot } from "@/components/dispatch/CrewRoleSlot";
import {
  DISPATCH_TRUCK_DRAG_TYPE,
  parseTruckDragPayload,
} from "@/components/dispatch/DispatchTrucksPanel";
import { DispatchScheduleDragTooltip } from "@/components/dispatch/DispatchScheduleDragTooltip";
import { DispatchScheduleGridLines } from "@/components/dispatch/DispatchScheduleGridLines";
import { DispatchScheduleJobBlockEntry } from "@/components/dispatch/DispatchScheduleJobBlock";
import { useDispatch } from "@/components/dispatch/DispatchProvider";
import { assignmentHasCrewOrTrucks } from "@/lib/dispatch/assignment-utils";
import {
  countFilledCrewSlots,
  filledDriverNamesFromAssignment,
  getSlotCrewId,
  jobCrewSlots,
} from "@/lib/dispatch/crew-slots";
import { useFleet } from "@/components/providers/FleetProvider";
import { useTerminology } from "@/lib/terminology/use-terminology";
import { formatDispatchSlotCount } from "@/lib/dispatch/job-card-display";
import { effectiveDispatchJob, effectiveRequirements } from "@/lib/dispatch/job-requirements";
import { isAfternoonDispatchJob } from "@/lib/dispatch/fta";
import { pmJobRowClass } from "@/lib/dispatch/pm-job-styles";
import { validateJobPairing } from "@/lib/dispatch/job-pairing";
import {
  formatScheduleTime,
  percentToSnappedScheduleMinutes,
  resolveDispatchScheduleBlock,
  type DispatchScheduleBlock,
} from "@/lib/dispatch/schedule-grid";
import type { DispatchJob } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";
import { Truck, Unlink, Users, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

type PendingTimePayload = {
  jobId: string;
  minutes: number;
  label: string;
};

type PendingPairPayload = {
  anchorId: string;
  partnerId: string;
  message: string;
  needsResourceConfirm: boolean;
  crewSizeMismatch?: boolean;
};

type PendingUnpairPayload = {
  anchorId: string;
  partnerId: string;
  partnerName: string;
};

type DispatchJobScheduleRowProps = {
  job: DispatchJob;
  pairedJobs: DispatchJob[];
  selectedJobId: string | null;
  pairDropActive?: boolean;
  onSelectJob: (jobId: string) => void;
  onPairHoverChange: (targetJobId: string | null) => void;
  onRequestTimeChange: (payload: PendingTimePayload) => void;
  onRequestPair: (payload: PendingPairPayload) => void;
  onRequestUnpair: (payload: PendingUnpairPayload) => void;
};

type RowBlock = {
  job: DispatchJob;
  block: DispatchScheduleBlock;
  isPaired: boolean;
  draggable: boolean;
};

function jobIdFromPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  return el?.closest("[data-dispatch-row-id]")?.getAttribute("data-dispatch-row-id") ?? null;
}

export function DispatchJobScheduleRow({
  job,
  pairedJobs,
  selectedJobId,
  pairDropActive = false,
  onSelectJob,
  onPairHoverChange,
  onRequestTimeChange,
  onRequestPair,
  onRequestUnpair,
}: DispatchJobScheduleRowProps) {
  const {
    dateKey,
    day,
    getAssignmentForJob,
    getAssignment,
    assignCrewSlot,
    assignTruck,
    unassignTruck,
    patchJob,
  } = useDispatch();
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
  const { terminology } = useTerminology();
  const timelineRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    jobId: string;
    pointerId: number;
    startX: number;
    startY: number;
    mode: "time" | "pair" | null;
    originMinutes: number;
    durationMinutes: number;
    previewMinutes: number | null;
    isPairedBlock: boolean;
  } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [previewMinutes, setPreviewMinutes] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; lines: string[] } | null>(null);

  const slots = useMemo(
    () =>
      jobCrewSlots(effectiveJob, terminology, {
        skipperAlsoDriver: assignment.skipperAlsoDriver,
      }),
    [effectiveJob, terminology, assignment.skipperAlsoDriver],
  );
  const { filled, required } = countFilledCrewSlots(effectiveJob, assignment);

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
  const trucksNeeded = requirements?.trucksNeeded ?? effectiveJob.trucksNeeded;
  const trucksFilled = assignment.truckIds.length;

  const dayLabel =
    job.totalJobDays && job.totalJobDays > 1 && job.dayNumber
      ? `Day ${job.dayNumber}/${job.totalJobDays}`
      : null;

  const canAcceptPair = Boolean(
    job.isFtaJob && job.ftaBooking?.period === "morning" && job.dayFraction !== "long",
  );
  const isPmAnchor = isAfternoonDispatchJob(job);

  const rowBlocks = useMemo((): RowBlock[] => {
    const anchorBlock = resolveDispatchScheduleBlock(job, {
      scheduleStartOverrideMinutes: rawAssignment.scheduleStartOverrideMinutes,
    });
    const blocks: RowBlock[] = [
      {
        job,
        block: anchorBlock,
        isPaired: false,
        draggable: true,
      },
    ];
    let cursor = anchorBlock.startMinutes + anchorBlock.durationMinutes;
    for (const paired of pairedJobs) {
      const pairedAssignment = getAssignment(paired.id);
      const hasTimeOverride = pairedAssignment.scheduleStartOverrideMinutes != null;
      const pairedBlock = resolveDispatchScheduleBlock(
        paired,
        hasTimeOverride
          ? { scheduleStartOverrideMinutes: pairedAssignment.scheduleStartOverrideMinutes }
          : { chainedAfterMinutes: cursor },
      );
      blocks.push({
        job: paired,
        block: pairedBlock,
        isPaired: true,
        draggable: true,
      });
      cursor = hasTimeOverride
        ? pairedBlock.startMinutes + pairedBlock.durationMinutes
        : cursor + pairedBlock.durationMinutes;
    }
    return blocks;
  }, [job, pairedJobs, rawAssignment.scheduleStartOverrideMinutes, getAssignment]);

  const finishDrag = useCallback(() => {
    dragRef.current = null;
    setDragging(false);
    setPreviewMinutes(null);
    setTooltip(null);
    onPairHoverChange(null);
  }, [onPairHoverChange]);

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = clientX - drag.startX;
      const dy = clientY - drag.startY;
      const draggedJob = day.jobs.find((j) => j.id === drag.jobId);
      const isAfternoon = draggedJob?.ftaBooking?.period === "afternoon";

      if (!drag.mode) {
        if (
          !drag.isPairedBlock &&
          isAfternoon &&
          dy < -12 &&
          Math.abs(dy) > Math.abs(dx)
        ) {
          drag.mode = "pair";
        } else if (Math.abs(dx) > 4) {
          drag.mode = "time";
        }
      }

      if (drag.mode === "time" && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const percent = ((clientX - rect.left) / rect.width) * 100;
        const minutes = percentToSnappedScheduleMinutes(percent, drag.durationMinutes);
        drag.previewMinutes = minutes;
        setPreviewMinutes(minutes);
        setTooltip({
          x: clientX,
          y: clientY,
          lines: [
            `Start ${formatScheduleTime(minutes)}`,
            `End ${formatScheduleTime(minutes + drag.durationMinutes)}`,
          ],
        });
        onPairHoverChange(null);
        return;
      }

      if (drag.mode === "pair") {
        drag.previewMinutes = null;
        setPreviewMinutes(null);
        setTooltip({
          x: clientX,
          y: clientY,
          lines: ["Drop on a morning job to pair"],
        });
        const targetId = jobIdFromPoint(clientX, clientY);
        const targetEl = targetId
          ? document.querySelector(
              `[data-dispatch-row-id="${targetId}"][data-dispatch-pair-target="true"]`,
            )
          : null;
        onPairHoverChange(targetEl ? targetId : null);
      }
    },
    [day.jobs, onPairHoverChange],
  );

  const handleDragEnd = useCallback(
    (clientX: number, clientY: number) => {
      const drag = dragRef.current;
      if (!drag) {
        finishDrag();
        return;
      }

      const draggedJob = day.jobs.find((j) => j.id === drag.jobId);
      if (!draggedJob) {
        finishDrag();
        return;
      }

      const snappedMinutes = drag.previewMinutes;
      if (
        drag.mode === "time" &&
        snappedMinutes != null &&
        snappedMinutes !== drag.originMinutes
      ) {
        onRequestTimeChange({
          jobId: drag.jobId,
          minutes: snappedMinutes,
          label: formatScheduleTime(snappedMinutes),
        });
        finishDrag();
        return;
      }

      if (drag.mode === "pair") {
        const anchorId = jobIdFromPoint(clientX, clientY);
        const validTarget = anchorId
          ? document.querySelector(
              `[data-dispatch-row-id="${anchorId}"][data-dispatch-pair-target="true"]`,
            )
          : null;
        const anchorJob =
          validTarget && anchorId ? day.jobs.find((j) => j.id === anchorId) : undefined;
        if (anchorJob && anchorJob.id !== draggedJob.id) {
          const existingPartners = (getAssignment(anchorJob.id).pairedJobIds ?? [])
            .map((id) => day.jobs.find((j) => j.id === id))
            .filter((j): j is DispatchJob => Boolean(j));
          const result = validateJobPairing(
            anchorJob,
            existingPartners,
            draggedJob,
            getAssignment,
          );
          const partnerAssignment = getAssignment(draggedJob.id);
          onRequestPair({
            anchorId: anchorJob.id,
            partnerId: draggedJob.id,
            message: result.ok
              ? `Stack ${draggedJob.customerName} after ${anchorJob.customerName}.`
              : result.crewSizeMismatch
                ? (result.message ?? "Crew sizes must match before pairing.")
                : `${result.message ?? "These jobs may not pair."} Pair anyway?`,
            needsResourceConfirm: assignmentHasCrewOrTrucks(draggedJob, partnerAssignment),
            crewSizeMismatch: Boolean(result.crewSizeMismatch),
          });
        }
        finishDrag();
        return;
      }

      if (drag.mode == null) {
        onSelectJob(drag.jobId);
      }

      finishDrag();
    },
    [day.jobs, finishDrag, getAssignment, onRequestPair, onRequestTimeChange, onSelectJob],
  );

  function handleTruckDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setTruckDragOver(false);
    const truckId = parseTruckDragPayload(e.dataTransfer.getData(DISPATCH_TRUCK_DRAG_TYPE));
    if (truckId) assignTruck(job.id, truckId);
  }

  function handleBlockPointerDown(
    rowBlock: RowBlock,
    e: React.PointerEvent<HTMLDivElement>,
  ) {
    if (!rowBlock.draggable) return;
    e.preventDefault();
    e.stopPropagation();
    dragRef.current = {
      jobId: rowBlock.job.id,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      mode: null,
      originMinutes: rowBlock.block.startMinutes,
      durationMinutes: rowBlock.block.durationMinutes,
      previewMinutes: null,
      isPairedBlock: rowBlock.isPaired,
    };
    setDragging(true);

    function onWindowMove(ev: PointerEvent) {
      if (ev.pointerId !== e.pointerId) return;
      handleDragMove(ev.clientX, ev.clientY);
    }
    function onWindowUp(ev: PointerEvent) {
      if (ev.pointerId !== e.pointerId) return;
      handleDragEnd(ev.clientX, ev.clientY);
      window.removeEventListener("pointermove", onWindowMove);
      window.removeEventListener("pointerup", onWindowUp);
      window.removeEventListener("pointercancel", onWindowUp);
    }
    window.addEventListener("pointermove", onWindowMove);
    window.addEventListener("pointerup", onWindowUp);
    window.addEventListener("pointercancel", onWindowUp);
  }

  return (
    <div
      data-dispatch-row-id={job.id}
      data-dispatch-pair-target={canAcceptPair ? "true" : undefined}
      className={cn(
        "grid border-b border-slate-100 last:border-b-0",
        selectedJobId === job.id || pairedJobs.some((p) => p.id === selectedJobId)
          ? isPmAnchor || pairedJobs.some((p) => p.id === selectedJobId)
            ? pmJobRowClass.rowSelected
            : "bg-brand-50/40"
          : "bg-white",
        pairDropActive && pmJobRowClass.pairDropRow,
      )}
      style={{ gridTemplateColumns: "minmax(13rem, 16rem) minmax(0, 1fr)" }}
    >
      <div className="flex flex-col border-r border-slate-100">
        <button
          type="button"
          onClick={() => onSelectJob(job.id)}
          className={cn(
            "flex flex-col gap-0.5 px-3 py-1.5 text-left hover:bg-slate-50/80",
            selectedJobId === job.id &&
              (isPmAnchor ? pmJobRowClass.nameButtonSelected : "bg-brand-50/60"),
          )}
        >
          <p
            className={cn(
              "min-w-0 text-sm font-semibold leading-tight",
              isPmAnchor ? pmJobRowClass.name : "text-slate-900",
            )}
          >
            {job.customerName}
          </p>
          {dayLabel ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-700">
              {dayLabel}
            </p>
          ) : null}
        </button>

        {pairedJobs.length > 0 ? (
          <ul className="space-y-0.5 border-b border-slate-100 px-2 py-1">
            {pairedJobs.map((paired) => (
              <li
                key={paired.id}
                className={cn(
                  "flex items-center gap-0.5 rounded-md",
                  selectedJobId === paired.id && pmJobRowClass.pairedSelected,
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectJob(paired.id)}
                  className={cn(
                    "min-w-0 flex-1 truncate px-1 py-0.5 text-left text-[10px] font-medium",
                    pmJobRowClass.pairedName,
                  )}
                  title={`Select ${paired.customerName}`}
                >
                  + {paired.customerName}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onRequestUnpair({
                      anchorId: job.id,
                      partnerId: paired.id,
                      partnerName: paired.customerName,
                    })
                  }
                  className={cn("shrink-0 rounded p-0.5", pmJobRowClass.unpairButton)}
                  title="Move back to own row"
                  aria-label={`Unpair ${paired.customerName}`}
                >
                  <Unlink className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        <div
          className="space-y-1 border-t border-slate-100 px-3 py-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <div>
            <p className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Users className="h-3 w-3" />
              Crew
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
            <div className="flex flex-wrap items-stretch gap-1">
              {slots.map((slot) => (
                <CrewRoleSlot
                  key={slot.kind === "skipper" ? "skipper" : `${slot.kind}-${slot.index}`}
                  compact
                  tight
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
              "rounded-md border border-dashed px-1.5 py-1 transition-colors",
              truckDragOver ? "border-brand-300 bg-brand-50" : "border-slate-200",
            )}
          >
            <p className="mb-0.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              <Truck className="h-3 w-3" />
              Trucks
              <span
                className={cn(
                  "tabular-nums",
                  trucksFilled < trucksNeeded ? "text-amber-700" : "text-slate-500",
                )}
              >
                {formatDispatchSlotCount(
                  trucksFilled,
                  trucksNeeded,
                  job.trucksNeeded,
                  requirements?.trucksOverridden ?? false,
                )}
              </span>
            </p>
            {assignedTrucks.length === 0 ? (
              <p className="text-[10px] text-slate-400">Drop from Resources</p>
            ) : (
              <ul className="flex flex-wrap gap-1">
                {assignedTrucks.map((truck) =>
                  truck ? (
                    <li key={truck.id}>
                      <span className="inline-flex items-center gap-0.5 rounded-md border border-slate-200 bg-white py-0.5 pl-1.5 pr-0.5 text-[10px] font-medium text-slate-800">
                        <span className="max-w-[8rem] truncate">{truck.label}</span>
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

      <div ref={timelineRef} className="relative min-h-[4rem] px-1 py-1">
        <DispatchScheduleGridLines className="top-1 bottom-1" />

        {rowBlocks.map((rowBlock) => {
          const displayBlock =
            dragging &&
            previewMinutes != null &&
            rowBlock.job.id === dragRef.current?.jobId &&
            dragRef.current?.mode === "time"
              ? resolveDispatchScheduleBlock(rowBlock.job, {
                  scheduleStartOverrideMinutes: previewMinutes,
                })
              : rowBlock.block;

          return (
            <DispatchScheduleJobBlockEntry
              key={rowBlock.job.id}
              job={rowBlock.job}
              block={displayBlock}
              selected={selectedJobId === rowBlock.job.id}
              paired={rowBlock.isPaired}
              dragging={
                dragging && dragRef.current?.jobId === rowBlock.job.id && rowBlock.draggable
              }
              onPointerDown={(e) => handleBlockPointerDown(rowBlock, e)}
            />
          );
        })}
      </div>

      <DispatchScheduleDragTooltip
        open={Boolean(tooltip)}
        x={tooltip?.x ?? 0}
        y={tooltip?.y ?? 0}
        lines={tooltip?.lines ?? []}
      />
    </div>
  );
}
