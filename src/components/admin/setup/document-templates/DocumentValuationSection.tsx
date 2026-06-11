"use client";

import {
  FULL_VALUE_MAX,
  FULL_VALUE_MIN,
  PACKING_MATERIAL_RATES,
  VALUATION_RELEASED,
  fullValuePremium,
  type ValuationOptionKey,
} from "@/lib/settings/document-valuation";
import type { DocumentSendKind } from "@/lib/moves/document-template-render";
import { cn } from "@/lib/utils";
import { AlertCircle, Shield, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export type ValuationSelectionState = {
  coverageKey: ValuationOptionKey;
  declaredValue: number;
  premium: number;
};

type DocumentValuationSectionProps = {
  kind: DocumentSendKind;
  accentColor: string;
  isRegulated: boolean;
  unregulatedDisplay: "hidden" | "notice";
  initialCoverageKey: string;
  initialDeclaredValue: number;
  initialPremium: number;
  packingOnQuote: boolean;
  onSelectionChange?: (selection: ValuationSelectionState) => void;
};

export function DocumentValuationSection({
  kind,
  accentColor,
  isRegulated,
  unregulatedDisplay,
  initialCoverageKey,
  initialDeclaredValue,
  initialPremium,
  packingOnQuote,
  onSelectionChange,
}: DocumentValuationSectionProps) {
  const isQuote = kind === "quote";
  const [coverage, setCoverage] = useState<ValuationOptionKey>(
    initialCoverageKey === "full" ? "full" : initialCoverageKey === "released" ? "released" : "released",
  );
  const [declaredValue, setDeclaredValue] = useState(initialDeclaredValue);
  const [editing, setEditing] = useState(isQuote);

  useEffect(() => {
    setCoverage(initialCoverageKey === "full" ? "full" : "released");
    setDeclaredValue(initialDeclaredValue);
    setEditing(isQuote);
  }, [initialCoverageKey, initialDeclaredValue, isQuote]);

  const premium = useMemo(
    () => (coverage === "full" ? fullValuePremium(declaredValue) : 0),
    [coverage, declaredValue],
  );

  useEffect(() => {
    if (!isRegulated || !onSelectionChange) return;
    if (coverage !== "released" && coverage !== "full") return;
    onSelectionChange({ coverageKey: coverage, declaredValue, premium });
  }, [coverage, declaredValue, premium, isRegulated, onSelectionChange]);

  if (!isRegulated) {
    if (unregulatedDisplay === "hidden") return null;
    return (
      <section className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5">
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <AlertCircle className="h-3.5 w-3.5" />
          Unregulated move
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          This is an <strong>unregulated move</strong>. Texas household goods valuation options do
          not apply — Jonah&apos;s Movers provides <strong>no liability coverage</strong> on this
          move beyond any separate written agreement.
        </p>
      </section>
    );
  }

  const showPicker = isQuote || editing;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
      <div
        className="border-b px-4 py-3"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${accentColor} 6%, white) 0%, white 100%)`,
        }}
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Shield className="h-4 w-4" style={{ color: accentColor }} />
          Valuation &amp; liability coverage
        </h2>
        {isQuote ? (
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            Choose how your belongings are protected. <strong>Released Value</strong> is the
            state-required minimum ($0.60/lb per article) and is included free.{" "}
            <strong>Full Value Protection</strong> lets you declare the total value of your shipment
            ($5k–$100k) for repair or replacement coverage — premium is 1.5% of declared value.
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-600">
            Coverage selected for this move. You may change it before signing if scope or declared
            value changed.
          </p>
        )}
      </div>

      <div className="space-y-3 p-4">
        {!showPicker && coverage === "full" ? (
          <SelectedSummary
            title="Full Value Protection"
            detail={`Declared shipment value: $${declaredValue.toLocaleString()} · Premium: $${premium.toLocaleString()}`}
            accentColor={accentColor}
          />
        ) : null}
        {!showPicker && coverage === "released" ? (
          <SelectedSummary
            title="Released Value ($0.60/lb)"
            detail="Included at no charge — Texas minimum liability"
            accentColor={accentColor}
          />
        ) : null}

        {!isQuote && !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-xs font-semibold"
            style={{ color: accentColor }}
          >
            Change coverage
          </button>
        ) : null}

        {showPicker ? (
          <>
            <label
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                coverage === "released"
                  ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <input
                type="radio"
                name="valuation"
                checked={coverage === "released"}
                onChange={() => setCoverage("released")}
                className="mt-1"
                style={{ accentColor }}
              />
              <span>
                <span className="block text-sm font-semibold text-slate-900">
                  {VALUATION_RELEASED.title}
                </span>
                <span className="block text-xs text-slate-600">{VALUATION_RELEASED.subtitle}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                  {VALUATION_RELEASED.description}
                </span>
                <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">
                  Included
                </span>
              </span>
            </label>

            <label
              className={cn(
                "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                coverage === "full"
                  ? "border-brand-300 bg-brand-50/50 ring-1 ring-brand-200"
                  : "border-slate-200 hover:border-slate-300",
              )}
            >
              <input
                type="radio"
                name="valuation"
                checked={coverage === "full"}
                onChange={() => setCoverage("full")}
                className="mt-1"
                style={{ accentColor }}
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-slate-900">
                  Full Value Protection
                </span>
                <span className="block text-xs text-slate-600">
                  Declare total value of your entire shipment
                </span>
                {isQuote ? (
                  <span className="mt-1 block text-xs leading-relaxed text-slate-500">
                    Covers repair, replacement, or reimbursement up to your declared value. Formal
                    agreement signed on the Bill of Lading at service.
                  </span>
                ) : null}
                {coverage === "full" ? (
                  <div className="mt-3 space-y-2">
                    <label className="block text-[10px] font-semibold uppercase text-slate-500">
                      Declared shipment value
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">$</span>
                      <input
                        type="number"
                        min={FULL_VALUE_MIN}
                        max={FULL_VALUE_MAX}
                        step={500}
                        value={declaredValue}
                        onChange={(e) =>
                          setDeclaredValue(
                            Math.min(
                              FULL_VALUE_MAX,
                              Math.max(FULL_VALUE_MIN, Number(e.target.value) || FULL_VALUE_MIN),
                            ),
                          )
                        }
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                      />
                    </div>
                    <p className="text-xs text-slate-600">
                      Premium (1.5%):{" "}
                      <strong className="tabular-nums">${premium.toLocaleString()}</strong>
                    </p>
                  </div>
                ) : null}
              </span>
            </label>

            {!isQuote && editing ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700"
              >
                Done — use this coverage
              </button>
            ) : null}
          </>
        ) : null}

        {packingOnQuote && isQuote ? (
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-relaxed text-slate-600">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-slate-400" />
            Valuation applies to household goods we transport. Items of extraordinary value must be
            declared separately before pickup.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function SelectedSummary({
  title,
  detail,
  accentColor,
}: {
  title: string;
  detail: string;
  accentColor: string;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 25%, white)`,
        backgroundColor: `color-mix(in srgb, ${accentColor} 6%, white)`,
      }}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-0.5 text-xs text-slate-600">{detail}</p>
    </div>
  );
}
