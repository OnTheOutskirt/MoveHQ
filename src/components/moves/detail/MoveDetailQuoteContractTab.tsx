"use client";

import { MoveDetailValuationSection } from "@/components/moves/detail/MoveDetailValuationSection";
import { MoveQuoteBuilderSection } from "@/components/moves/detail/MoveQuoteBuilderSection";
import { MoveDetailSectionAnchor } from "@/components/moves/detail/MoveDetailSectionAnchor";
import { MoveDetailTabSections } from "@/components/moves/detail/MoveDetailTabSections";
import {
  QUOTE_CONTRACT_SECTION_IDS,
  QUOTE_CONTRACT_SECTIONS,
} from "@/lib/moves/move-detail-sections";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailQuoteContractTabProps = {
  move: MoveRecord;
};

/** Quote builder and liability — aligned with customer document templates. */
export function MoveDetailQuoteContractTab({ move }: MoveDetailQuoteContractTabProps) {
  return (
    <MoveDetailTabSections
      sections={QUOTE_CONTRACT_SECTIONS}
      ariaLabel="Quote and contract sections"
    >
      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.quote}>
        <MoveQuoteBuilderSection move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.liability}>
        <MoveDetailValuationSection move={move} />
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}
