"use client";

import { useState } from "react";
import { ManualReviewBanner } from "@/components/moves/detail/DetailSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import {
  MoveJobDaysHorizontalTimeline,
  type MoveJobDayEditorState,
} from "@/components/moves/detail/MoveJobDaysHorizontalTimeline";
import { ScopeLocationsSummary } from "@/components/moves/detail/scope/ScopeLocationsSummary";
import {
  ScopeInventorySection,
  ScopeServicesSection,
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
  const [jobDayEditor, setJobDayEditor] = useState<MoveJobDayEditorState>({ open: false });

  function openJobDay(dayId: string) {
    setJobDayEditor({ open: true, dayId, duplicateFromDayId: null });
  }

  return (
    <MoveDetailTabSections sections={MOVE_PLAN_SECTIONS} ariaLabel="Move scope sections">
      <MoveDetailSectionAnchor id={MOVE_PLAN_SECTION_IDS.jobDays}>
        <MoveJobDaysHorizontalTimeline
          move={move}
          editor={jobDayEditor}
          onEditorChange={setJobDayEditor}
        />
      </MoveDetailSectionAnchor>

      <ManualReviewBanner reasons={move.intake.manualReviewReasons} />

      <ScopeServicesSection move={move} />
      <ScopeSpecialtySection move={move} />
      <ScopeInventorySection move={move} />
      <ScopeLocationsSummary move={move} onEditJobDay={openJobDay} />
    </MoveDetailTabSections>
  );
}
