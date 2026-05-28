"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailPaymentTabProps = {
  move: MoveRecord;
};

export function MoveDetailPaymentTab({ move }: MoveDetailPaymentTabProps) {
  return (
    <DetailSection title="Payment" description="Deposits, balances, and payment method">
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center text-sm text-slate-500">
        Payment tracking for {move.customerName} — coming soon
      </div>
    </DetailSection>
  );
}
