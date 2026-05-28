"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import {
  packingDensityLabel,
  packingServiceLabel,
} from "@/lib/moves/intake-display";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailPackingTabProps = {
  move: MoveRecord;
};

const PARTIAL_ROOM_LABELS: Record<string, string> = {
  kitchen: "Kitchen",
  "china-cabinet": "China cabinet",
  curio: "Curio cabinet",
  buffet: "Buffet",
  "dry-bar": "Dry bar / bar cart",
  collectibles: "Collectibles / display shelves",
  "decor-some": "Décor & wall art — some",
  "decor-heavy": "Décor & wall art — heavy",
  "primary-bath": "Primary bathroom",
  bedrooms: "Bedrooms / closets",
  office: "Office / books",
  garage: "Garage",
};

export function MoveDetailPackingTab({ move }: MoveDetailPackingTabProps) {
  const { intake } = move;
  const boxLabel =
    intake.customBoxCount != null
      ? `${intake.customBoxCount} boxes (client provided)`
      : intake.estimatedBoxCount != null
        ? `~${intake.estimatedBoxCount} boxes (estimated)`
        : "—";

  return (
    <div className="space-y-4">
      <DetailSection title="Home size & belongings">
        <DetailFieldGrid>
          <DetailField label="Home size" value={intake.homeSizeLabel} fullWidth />
          <DetailField label="Belongings density" value={packingDensityLabel(intake.packingDensity)} />
          <DetailField label="Boxes / totes on truck" value={boxLabel} />
        </DetailFieldGrid>
      </DetailSection>

      <DetailSection title="Packing services">
        <DetailFieldGrid>
          <DetailField label="Service" value={packingServiceLabel(intake.packingService)} fullWidth />
          {intake.packingService === "partial" && intake.partialPackRooms.length > 0 ? (
            <DetailField
              label="Areas to pack"
              value={intake.partialPackRooms
                .map((r) => PARTIAL_ROOM_LABELS[r] ?? r)
                .join(", ")}
              fullWidth
            />
          ) : null}
          {intake.partialPackOther ? (
            <DetailField label="Other areas" value={intake.partialPackOther} fullWidth />
          ) : null}
          {intake.packingService === "full" || intake.packingService === "partial" ? (
            <DetailField
              label="Box estimate acknowledged"
              value={intake.boxApprovalAcknowledged ? "Yes" : "No"}
            />
          ) : null}
        </DetailFieldGrid>
        {intake.packingService === "self-move" ? (
          <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            Furniture-only job — client moves own boxes. Estimator uses 0 cu ft for box allocation on
            truck.
          </p>
        ) : null}
      </DetailSection>
    </div>
  );
}
