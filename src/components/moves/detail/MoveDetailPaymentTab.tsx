"use client";

import { DetailSection } from "@/components/moves/detail/DetailSection";
import { useSettings } from "@/components/providers/SettingsProvider";
import { computeMoveDeposit } from "@/lib/moves/move-deposit";
import { formatQuote } from "@/lib/moves/format";
import type { MoveRecord } from "@/lib/moves/types";

type MoveDetailPaymentTabProps = {
  move: MoveRecord;
};

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function MoveDetailPaymentTab({ move }: MoveDetailPaymentTabProps) {
  const { settings } = useSettings();
  const deposit = computeMoveDeposit(
    move,
    settings.defaults,
    settings.fieldCatalog.discountReasons,
  );

  return (
    <DetailSection title="Payment" description="Deposits, balances, and payment method">
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Quote total
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {formatQuote(move.quoteAmount, move.quoteType)}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-brand-50/50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800">
            Deposit due
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {formatMoney(deposit.depositDue)}
          </p>
          <p className="text-xs text-slate-500">{deposit.depositLabel}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Received
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">
            {formatMoney(deposit.depositReceived)}
          </p>
          <p className="text-xs text-slate-500">
            Balance {formatMoney(deposit.balanceDue)}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Deposit is collected when the customer signs the contract — use Send contract from the quote
        section or quick actions.
      </p>

      <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-500">
        Card, ACH, and check recording — coming soon
      </div>
    </DetailSection>
  );
}
