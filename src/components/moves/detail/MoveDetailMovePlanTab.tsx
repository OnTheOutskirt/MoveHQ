"use client";

import { ManualReviewBanner } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import { MoveJobDaysHorizontalTimeline } from "@/components/moves/detail/MoveJobDaysHorizontalTimeline";
import {
  ScopeInventorySection,
  ScopeLocationsSection,
  ScopeMoveDetailsSection,
  ScopeSpecialtySection,
} from "@/components/moves/detail/scope/ScopeSections";
import {
  MOVE_PLAN_SECTION_IDS,
  MOVE_PLAN_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailMovePlanTabProps = {
  move: MoveRecord;
};

export function MoveDetailMovePlanTab({ move }: MoveDetailMovePlanTabProps) {
  return (
    <MoveDetailTabSections sections={MOVE_PLAN_SECTIONS} ariaLabel="Move scope sections">
      <MoveDetailSectionAnchor id={MOVE_PLAN_SECTION_IDS.jobDays}>
        <MoveJobDaysHorizontalTimeline move={move} />
      </MoveDetailSectionAnchor>

      <ManualReviewBanner reasons={move.intake.manualReviewReasons} />

      <ScopeMoveDetailsSection move={move} />
      <ScopeLocationsSection move={move} />
      <ScopeInventorySection move={move} />
      <ScopeSpecialtySection move={move} />
    </MoveDetailTabSections>
  );
}
