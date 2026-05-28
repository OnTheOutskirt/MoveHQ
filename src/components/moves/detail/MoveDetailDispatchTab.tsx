"use client";

import { MoveDetailJobDaysTab } from "@/components/moves/detail/MoveDetailJobDaysTab";
import { DetailSection } from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailDispatchTabProps = {
  move: MoveRecord;
};

export function MoveDetailDispatchTab({ move }: MoveDetailDispatchTabProps) {
  return (
    <div className="space-y-6">
      <DetailSection
        title="Job days"
        description="Operational days for this move — pack, load, deliver, or multi-day routes"
      >
        <MoveDetailJobDaysTab move={move} />
      </DetailSection>

      <DetailSection title="Crew & trucks" description="Assignments from dispatch">
        <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-sm text-slate-500">
          Crew and truck assignments — coming soon
        </div>
      </DetailSection>
    </div>
  );
}
