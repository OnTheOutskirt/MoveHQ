"use client";

import { MoveWaitingSubstagePicker } from "@/components/moves/detail/MoveWaitingSubstagePicker";
import { moveDetailStageDisplayLabel, pipelineStageConfig } from "@/lib/moves/move-pipeline";
import { Badge } from "@/components/ui/Badge";
import { formatMoveDate } from "@/lib/moves/format";
import { moveDisplayTitle } from "@/lib/moves/get-move-contact";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";
import { ArrowRight, MapPin } from "lucide-react";
import type { ReactNode } from "react";

type MoveDetailOverviewBarProps = {
  move: MoveRecord;
  className?: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-0.5 text-sm font-medium text-slate-900">{children}</div>
    </div>
  );
}

export function MoveDetailOverviewBar({ move, className }: MoveDetailOverviewBarProps) {
  return (
    <header
      className={cn("shrink-0 border-b border-slate-200 bg-white px-4 py-4 lg:px-5", className)}
    >
      <div className="grid gap-4 lg:grid-cols-12 lg:items-end">
        <Field label="Move">
          <h1 className="text-lg font-semibold leading-snug tracking-tight text-slate-900 lg:text-xl">
            {moveDisplayTitle(move)}
          </h1>
        </Field>

        <Field label="Move date">
          {formatMoveDate(move.intake.moveDate || move.preferredDate)}
        </Field>

        <Field label="Assigned to">{move.assignedRep}</Field>

        <Field label="Pipeline">
          <Badge className={pipelineStageConfig[move.pipelineStage].badge}>
            {moveDetailStageDisplayLabel(move)}
          </Badge>
        </Field>

        <Field label="Move type">
          <Badge variant="default">{move.moveType}</Badge>
        </Field>

        <div className="lg:col-span-12">
          <MoveWaitingSubstagePicker move={move} variant="inline" />
        </div>

        <div className="min-w-0 lg:col-span-12 xl:col-span-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Route
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-800">
            <span className="inline-flex min-w-0 items-start gap-1">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{move.originAddress}</span>
            </span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="inline-flex min-w-0 items-start gap-1">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{move.destinationAddress}</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
