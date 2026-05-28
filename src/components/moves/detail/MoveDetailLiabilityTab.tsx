"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
  ManualReviewBanner,
} from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailLiabilityTabProps = {
  move: MoveRecord;
};

export function MoveDetailLiabilityTab({ move }: MoveDetailLiabilityTabProps) {
  const { intake } = move;
  const liabilityLabel =
    intake.liabilityCoverage === "full"
      ? "Full Value Protection"
      : intake.liabilityCoverage === "released"
        ? "Released Value ($0.60/lb)"
        : "—";

  return (
    <div className="space-y-4">
      <ManualReviewBanner reasons={intake.manualReviewReasons} />

      <DetailSection title="Valuation & liability coverage">
        <DetailFieldGrid>
          <DetailField label="Coverage selected" value={liabilityLabel} fullWidth />
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
          Formal signed agreement on Bill of Lading at time of service. Released value is included at
          no charge; full value is an upgrade based on declared shipment value ($5k–$100k).
        </p>
      </DetailSection>

      <DetailSection title="Special circumstances">
        <DetailFieldGrid>
          <DetailField
            label="Specialty items"
            value={intake.hasSpecialtyItems ? "Yes — manual review" : "No"}
          />
          <DetailField
            label="High-value items"
            value={intake.hasHighValueItems ? "Yes — coverage discussion" : "No"}
          />
          <DetailField
            label="Timing complexity"
            value={intake.hasTimingComplexity ? "Yes — scheduling review" : "No"}
            fullWidth
          />
        </DetailFieldGrid>
        {intake.timingNotes ? (
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">{intake.timingNotes}</p>
        ) : null}
        {intake.additionalNotes ? (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Additional notes
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {intake.additionalNotes}
            </p>
          </div>
        ) : null}
      </DetailSection>
    </div>
  );
}
