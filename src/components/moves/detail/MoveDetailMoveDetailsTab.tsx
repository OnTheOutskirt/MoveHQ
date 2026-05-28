"use client";

import { MoveDetailIntakeTab } from "@/components/moves/detail/MoveDetailIntakeTab";
import { MoveDetailPackingTab } from "@/components/moves/detail/MoveDetailPackingTab";
import { ManualReviewBanner } from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailMoveDetailsTabProps = {
  move: MoveRecord;
};

export function MoveDetailMoveDetailsTab({ move }: MoveDetailMoveDetailsTabProps) {
  return (
    <div className="space-y-6">
      <ManualReviewBanner reasons={move.intake.manualReviewReasons} />
      <MoveDetailIntakeTab move={move} />
      <MoveDetailPackingTab move={move} />
    </div>
  );
}
