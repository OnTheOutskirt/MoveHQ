"use client";

import { MoveLifecycleStepper } from "@/components/moves/detail/MoveLifecycleStepper";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

/** Slim pipeline strip — prefer embedding via {@link MoveDetailOverviewCard}. */
type MoveDetailPipelineSectionProps = {
  move: MoveRecord;
  className?: string;
};

export function MoveDetailPipelineSection({ move, className }: MoveDetailPipelineSectionProps) {
  return (
    <div className={cn("border-t border-slate-100 pt-3", className)}>
      <MoveLifecycleStepper move={move} />
    </div>
  );
}
