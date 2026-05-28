"use client";

import {
  DetailField,
  DetailFieldGrid,
  DetailSection,
} from "@/components/moves/detail/DetailSection";
import { formatMoveDate, formatQuote } from "@/lib/moves/format";
import { leadSourceLabel } from "@/lib/moves/lead-referral";
import { moveStatusLabel } from "@/lib/moves/status";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailQuoteTabProps = {
  move: MoveRecord;
};

type QuoteLine = { label: string; amount: number };

function mockQuoteLines(move: MoveRecord): QuoteLine[] | null {
  if (move.quoteAmount == null || move.quoteType !== "flat") return null;
  const { intake } = move;
  const labor = Math.round(move.quoteAmount * 0.72);
  const truck = Math.round(move.quoteAmount * 0.12);
  const lines: QuoteLine[] = [
    { label: "Labor", amount: labor },
    { label: "Truck fee", amount: truck },
  ];
  if (intake.wardrobe.jonahCount > 0) {
    const per = intake.wardrobe.jonahType === "keep" ? 20 : 10;
    lines.push({
      label: `Wardrobe rental (${intake.wardrobe.jonahCount} boxes)`,
      amount: intake.wardrobe.jonahCount * per,
    });
  }
  if (intake.packingService === "full" || intake.packingService === "partial") {
    lines.push({ label: "Packing materials", amount: Math.round(move.quoteAmount * 0.06) });
  }
  if (intake.liabilityPremium && intake.liabilityPremium > 0) {
    lines.push({ label: "Full Value Protection", amount: intake.liabilityPremium });
  }
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  if (subtotal < move.quoteAmount) {
    lines.push({ label: "Other / rounding", amount: move.quoteAmount - subtotal });
  }
  return lines;
}

export function MoveDetailQuoteTab({ move }: MoveDetailQuoteTabProps) {
  const { intake } = move;
  const lines = mockQuoteLines(move);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <DetailSection title="Flat rate total">
          <p className="text-3xl font-semibold tabular-nums text-slate-900">
            {formatQuote(move.quoteAmount, move.quoteType)}
          </p>
          {lines ? (
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              {lines.map((line) => (
                <li key={line.label} className="flex justify-between gap-4">
                  <span className="text-slate-600">{line.label}</span>
                  <span className="font-medium tabular-nums text-slate-900">
                    ${line.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No flat-rate breakdown yet — run estimate after intake is complete.
            </p>
          )}
        </DetailSection>

        <DetailSection title="Sales">
          <DetailFieldGrid>
            <DetailField label="Stage" value={moveStatusLabel(move.status)} />
            <DetailField label="Lead source" value={leadSourceLabel(move.leadChannel)} />
            <DetailField label="Salesperson" value={move.assignedRep} />
            <DetailField
              label="Follow-up due"
              value={move.followUpDue ? formatMoveDate(move.followUpDue) : "—"}
            />
          </DetailFieldGrid>
        </DetailSection>
      </div>

    </div>
  );
}
