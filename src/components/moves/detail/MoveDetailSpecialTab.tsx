"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
  ManualReviewBanner,
} from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";
import { liabilityCoverageLabel, resolveValuationSelection } from "@/lib/settings/document-valuation";

type MoveDetailSpecialTabProps = {
  move: MoveRecord;
  /** Liability is shown on Quote & Contract instead. */
  showLiability?: boolean;
};

export function MoveDetailSpecialTab({ move, showLiability = true }: MoveDetailSpecialTabProps) {
  const { intake } = move;
  const liabilityLabel = liabilityCoverageLabel(resolveValuationSelection(move));

  return (
    <div className="space-y-4">
      <ManualReviewBanner reasons={intake.manualReviewReasons} />

      <DetailSection title="Specialty items">
        <DetailFieldGrid>
          <DetailField
            label="Includes specialty items?"
            value={intake.hasSpecialtyItems ? "Yes — manual review" : "No"}
            fullWidth
          />
        </DetailFieldGrid>
        {intake.specialtyNotes ? (
          <p className="mt-2 text-sm text-slate-600">{intake.specialtyNotes}</p>
        ) : null}
      </DetailSection>

      <DetailSection title="High-value items">
        <DetailFieldGrid>
          <DetailField
            label="Extraordinary value items?"
            value={intake.hasHighValueItems ? "Yes — coverage discussion needed" : "No"}
            fullWidth
          />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Timing complexity">
        <DetailFieldGrid>
          <DetailField
            label="Complex timing factors?"
            value={intake.hasTimingComplexity ? "Yes — scheduling review" : "No"}
            fullWidth
          />
        </DetailFieldGrid>
        {intake.timingNotes ? (
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{intake.timingNotes}</p>
        ) : null}
      </DetailSection>

      {showLiability ? (
        <DetailSection title="Valuation & liability">
          <DetailFieldGrid>
            <DetailField label="Coverage" value={liabilityLabel} fullWidth />
            {intake.declaredValue != null ? (
              <DetailField
                label="Declared shipment value"
                value={`$${intake.declaredValue.toLocaleString()}`}
              />
            ) : null}
            {intake.liabilityPremium != null && intake.liabilityPremium > 0 ? (
              <DetailField
                label="Full value premium (1.5%)"
                value={`$${intake.liabilityPremium.toLocaleString()}`}
              />
            ) : null}
          </DetailFieldGrid>
          <p className="mt-3 text-xs text-slate-500">
            Formal signed agreement on Bill of Lading at time of service. Internal record only here.
          </p>
        </DetailSection>
      ) : null}

      {intake.additionalNotes ? (
        <DetailSection title="Additional notes">
          <p className="whitespace-pre-wrap text-sm text-slate-700">{intake.additionalNotes}</p>
        </DetailSection>
      ) : null}
    </div>
  );
}
