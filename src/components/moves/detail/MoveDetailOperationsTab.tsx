"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { MoveClaimsSection } from "@/components/moves/detail/MoveClaimsSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import { MoveJobDaysOpsGrid } from "@/components/moves/detail/MoveJobDaysOpsGrid";
import {
  OPERATIONS_SECTION_IDS,
  OPERATIONS_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailOperationsTabProps = {
  move: MoveRecord;
};

export function MoveDetailOperationsTab({ move }: MoveDetailOperationsTabProps) {
  return (
    <MoveDetailTabSections sections={OPERATIONS_SECTIONS} ariaLabel="Operations sections">
      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.moveDays}>
        <DetailSection
          title="Move days"
          description="Crew, trucks, and day paperwork — trucks reflect dispatch assignments when set."
        >
          <MoveJobDaysOpsGrid move={move} />
        </DetailSection>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.claims}>
        <DetailSection title="Claims (move-wide)">
          <MoveClaimsSection move={move} />
        </DetailSection>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={OPERATIONS_SECTION_IDS.dispatch}>
        <DetailSection title="Crew & trucks (dispatch board)">
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-500">
            Link to dispatch calendar for live assignments — coming soon
          </div>
        </DetailSection>
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}
