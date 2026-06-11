"use client";

import {
  DayBeforeConfirmationPill,
  useDayBeforeConfirmationForJob,
} from "@/components/dispatch/DayBeforeConfirmationPill";
import { DispatchJobRouteLine } from "@/components/dispatch/DispatchJobRouteLine";
import { useMoves } from "@/components/moves/MovesProvider";
import type { DispatchScheduleBlock } from "@/lib/dispatch/schedule-grid";
import { formatDispatchBlockTimeRange } from "@/lib/dispatch/schedule-grid";
import type { DayBeforeConfirmation } from "@/lib/dispatch/day-before-confirmation";
import { isAfternoonDispatchJob } from "@/lib/dispatch/fta";
import { pmJobBlockClass } from "@/lib/dispatch/pm-job-styles";
import type { DispatchJob } from "@/lib/dispatch/types";
import { cn } from "@/lib/utils";

type DispatchScheduleJobBlockProps = {
  job: DispatchJob;
  block: DispatchScheduleBlock;
  selected: boolean;
  paired?: boolean;
  dragging?: boolean;
  dayBeforeConfirmation?: DayBeforeConfirmation | null;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
};

function showConfirmationOnBlock(confirmation: DayBeforeConfirmation | null | undefined): boolean {
  return Boolean(confirmation && confirmation.status !== "not_due");
}

export function DispatchScheduleJobBlock({
  job,
  block,
  selected,
  paired = false,
  dragging = false,
  dayBeforeConfirmation,
  onPointerDown,
}: DispatchScheduleJobBlockProps) {
  const arrivalLine = job.arrivalWindow?.trim()
    ? `Arrive ${job.arrivalWindow.trim()}`
    : null;
  const durationLine = job.durationLabel?.trim() || null;
  const timeRange = formatDispatchBlockTimeRange(block);
  const showPill = showConfirmationOnBlock(dayBeforeConfirmation);
  const pmStyled = paired || isAfternoonDispatchJob(job);

  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        "absolute top-1 bottom-1 z-[1] flex min-h-[3.75rem] cursor-grab flex-col justify-center gap-0.5 rounded-lg border px-2 py-1 text-left shadow-sm transition-shadow active:cursor-grabbing",
        selected && pmStyled
          ? pmJobBlockClass.selected
          : selected
            ? "border-brand-400 bg-brand-50 ring-1 ring-brand-200"
            : pmStyled
              ? pmJobBlockClass.base
              : "border-slate-200 bg-slate-50 hover:border-brand-200 hover:bg-brand-50",
        dragging && "z-[3] opacity-90 ring-2 ring-brand-300",
      )}
      style={{
        left: `${block.leftPercent}%`,
        width: `${block.widthPercent}%`,
      }}
    >
      {showPill && dayBeforeConfirmation ? (
        <div
          className="self-start"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <DayBeforeConfirmationPill
            jobId={job.id}
            confirmation={dayBeforeConfirmation}
            compact
          />
        </div>
      ) : null}
      <p className="min-w-0 truncate text-[12px] font-semibold leading-tight text-slate-900">
        {job.customerName}
      </p>
      <DispatchJobRouteLine job={job} compact />
      {arrivalLine ? (
        <p className="truncate text-[10px] leading-tight text-slate-600">{arrivalLine}</p>
      ) : null}
      {durationLine ? (
        <p className="truncate text-[10px] leading-tight font-medium text-slate-600">
          {durationLine}
        </p>
      ) : null}
      <p className="truncate text-[10px] leading-tight tabular-nums text-slate-500">{timeRange}</p>
    </div>
  );
}

type DispatchScheduleJobBlockEntryProps = Omit<
  DispatchScheduleJobBlockProps,
  "dayBeforeConfirmation"
>;

/** Loads day-before confirmation per job (hooks cannot run in a parent map). */
export function DispatchScheduleJobBlockEntry(props: DispatchScheduleJobBlockEntryProps) {
  const { getMoveById } = useMoves();
  const move = props.job.moveId ? getMoveById(props.job.moveId) : undefined;
  const { confirmation } = useDayBeforeConfirmationForJob(props.job, move);

  return <DispatchScheduleJobBlock {...props} dayBeforeConfirmation={confirmation} />;
}
