"use client";

import { MoveLifecycleStepper } from "@/components/moves/detail/MoveLifecycleStepper";
import type { MoveRecord } from "@/lib/moves/types";
import { cn } from "@/lib/utils";

/** @deprecated Use MoveLifecycleStepper — kept for any legacy imports. */
type MoveLifecyclePipelineProps = {
  move: MoveRecord;
  className?: string;
};

export function MoveLifecyclePipeline({ move, className }: MoveLifecyclePipelineProps) {
  return <MoveLifecycleStepper move={move} className={className} />;
}
