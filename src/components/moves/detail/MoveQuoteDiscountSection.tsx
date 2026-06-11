"use client";

import { useMoves } from "@/components/moves/MovesProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { Button } from "@/components/ui/Button";
import {
  computeQuoteDiscount,
  type MoveQuoteDiscount,
} from "@/lib/moves/quote-discount";
import { formatMoney } from "@/lib/settings/document-valuation";
import type { DiscountReasonEntry } from "@/lib/settings/field-catalog-types";
import type { MoveRecord } from "@/lib/moves/types";
import { Percent, Tag, X } from "lucide-react";
import { useMemo } from "react";

type MoveQuoteDiscountSectionProps = {
  move: MoveRecord;
  disabled?: boolean;
};

export function MoveQuoteDiscountSection({ move, disabled }: MoveQuoteDiscountSectionProps) {
  const { settings } = useSettings();
  const { updateMoveQuoteDiscount } = useMoves();
  const reasons = settings.fieldCatalog.discountReasons;
  const hasQuote = move.quoteAmount != null && move.quoteType != null;

  const discountPreview = useMemo(
    () => (hasQuote ? computeQuoteDiscount(move, reasons) : null),
    [hasQuote, move, reasons],
  );

  if (!hasQuote) return null;

  function applyReason(reason: DiscountReasonEntry) {
    const next: MoveQuoteDiscount = {
      reasonId: reason.id,
      kind: reason.kind,
      value: reason.defaultValue,
    };
    updateMoveQuoteDiscount(move.id, next);
  }

  function patchDiscount(patch: Partial<MoveQuoteDiscount>) {
    if (!move.quoteDiscount) return;
    updateMoveQuoteDiscount(move.id, { ...move.quoteDiscount, ...patch });
  }

  return (
    <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <Tag className="h-4 w-4 text-emerald-700" />
            Quote discount
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {move.quoteType === "hourly"
              ? "Percent off applies to the labor rate; dollar off applies to the estimated move total."
              : "Applies to the full flat rate quoted."}
          </p>
        </div>
        {move.quoteDiscount ? (
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 gap-1 text-xs"
            disabled={disabled}
            onClick={() => updateMoveQuoteDiscount(move.id, null)}
          >
            <X className="h-3.5 w-3.5" />
            Remove
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Reason
          </span>
          <select
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={move.quoteDiscount?.reasonId ?? ""}
            onChange={(e) => {
              const reason = reasons.find((r) => r.id === e.target.value);
              if (reason) applyReason(reason);
              else updateMoveQuoteDiscount(move.id, null);
            }}
          >
            <option value="">No discount</option>
            {reasons.map((reason) => (
              <option key={reason.id} value={reason.id}>
                {reason.label} (
                {reason.kind === "percent"
                  ? `${reason.defaultValue}%`
                  : `$${reason.defaultValue}`}
                )
              </option>
            ))}
          </select>
        </label>

        {move.quoteDiscount ? (
          <>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Discount type
              </span>
              <p className="mt-1 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
                {move.quoteDiscount.kind === "percent" ? (
                  <Percent className="h-4 w-4 text-slate-500" />
                ) : (
                  <Tag className="h-4 w-4 text-slate-500" />
                )}
                {move.quoteDiscount.kind === "percent" ? "Percentage" : "Dollar amount"}
              </p>
            </label>
            <label className="block">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Amount off
              </span>
              <div className="mt-1 flex items-center gap-1.5">
                {move.quoteDiscount.kind === "dollar" ? (
                  <span className="text-sm text-slate-500">$</span>
                ) : null}
                <input
                  type="number"
                  min={0}
                  max={move.quoteDiscount.kind === "percent" ? 100 : undefined}
                  disabled={disabled}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums"
                  value={move.quoteDiscount.value}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n)) return;
                    patchDiscount({ value: Math.max(0, n) });
                  }}
                />
                {move.quoteDiscount.kind === "percent" ? (
                  <span className="text-sm text-slate-500">%</span>
                ) : null}
              </div>
            </label>
          </>
        ) : null}
      </div>

      {discountPreview?.hasDiscount ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-white px-3 py-2.5 text-sm">
          <p className="font-medium text-emerald-900">{discountPreview.summary}</p>
          {move.quoteType === "flat" &&
          discountPreview.originalFlatTotal != null &&
          discountPreview.discountedFlatTotal != null ? (
            <p className="mt-1 tabular-nums text-slate-700">
              <span className="text-slate-400 line-through">
                {formatMoney(discountPreview.originalFlatTotal)}
              </span>
              {" → "}
              <span className="font-semibold text-emerald-800">
                {formatMoney(discountPreview.discountedFlatTotal)}
              </span>
            </p>
          ) : null}
          {move.quoteType === "hourly" &&
          discountPreview.kind === "percent" &&
          discountPreview.originalLaborRate != null &&
          discountPreview.discountedLaborRate != null ? (
            <p className="mt-1 tabular-nums text-slate-700">
              Labor rate{" "}
              <span className="text-slate-400 line-through">
                ${discountPreview.originalLaborRate}/hr
              </span>
              {" → "}
              <span className="font-semibold text-emerald-800">
                ${discountPreview.discountedLaborRate}/hr
              </span>
            </p>
          ) : null}
          {move.quoteType === "hourly" &&
          discountPreview.kind === "dollar" &&
          discountPreview.originalBallparkTotal != null &&
          discountPreview.discountedBallparkTotal != null ? (
            <p className="mt-1 tabular-nums text-slate-700">
              Est. total{" "}
              <span className="text-slate-400 line-through">
                {formatMoney(discountPreview.originalBallparkTotal)}
              </span>
              {" → "}
              <span className="font-semibold text-emerald-800">
                {formatMoney(discountPreview.discountedBallparkTotal)}
              </span>
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
