"use client";

import { MoveDetailLiabilityTab } from "@/components/moves/detail/MoveDetailLiabilityTab";
import { MoveDetailPaymentTab } from "@/components/moves/detail/MoveDetailPaymentTab";
import { MoveDetailQuoteTab } from "@/components/moves/detail/MoveDetailQuoteTab";
import { DetailSection } from "@/components/moves/detail/DetailSection";
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

/** Pricing, liability coverage, payments, and signed agreements. */
export function MoveDetailQuoteContractTab({ move }: MoveDetailQuoteContractTabProps) {
  return (
    <MoveDetailTabSections
      sections={QUOTE_CONTRACT_SECTIONS}
      ariaLabel="Quote and contract sections"
    >
      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.pricing}>
        <MoveDetailQuoteTab move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.liability}>
        <MoveDetailLiabilityTab move={move} />
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.contracts}>
        <DetailSection title="Contracts & documents">
          <div className="grid gap-3 sm:grid-cols-2">
            {["Estimate / proposal", "Bill of Lading", "Signed contract"].map((doc) => (
              <div
                key={doc}
                className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500"
              >
                {doc} — coming soon
              </div>
            ))}
          </div>
        </DetailSection>
      </MoveDetailSectionAnchor>

      <MoveDetailSectionAnchor id={QUOTE_CONTRACT_SECTION_IDS.payment}>
        <MoveDetailPaymentTab move={move} />
      </MoveDetailSectionAnchor>
    </MoveDetailTabSections>
  );
}
