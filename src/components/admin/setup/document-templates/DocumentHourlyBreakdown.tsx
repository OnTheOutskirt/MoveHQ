"use client";

import {
  PACKING_MATERIAL_RATES,
  type HourlyPricingLine,
} from "@/lib/settings/document-valuation";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

type DocumentHourlyBreakdownProps = {
  lines: HourlyPricingLine[];
  showMaterialRates: boolean;
  accentColor: string;
  title?: string;
  footerNote?: string;
};

export function DocumentHourlyBreakdown({
  lines,
  showMaterialRates,
  accentColor,
  title = "What you're quoted",
  footerNote,
}: DocumentHourlyBreakdownProps) {
  return (
    <section className="border-t border-slate-100 bg-white px-5 py-4">
      <h3 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li
            key={line.id}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg px-3 py-2",
              line.emphasis ? "bg-amber-50/70" : "bg-slate-50/80",
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{line.label}</p>
              {line.note ? (
                <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{line.note}</p>
              ) : null}
            </div>
            <div className="shrink-0 text-right">
              {line.originalAmount ? (
                <p className="text-xs tabular-nums text-slate-400 line-through">
                  {line.originalAmount}
                </p>
              ) : null}
              <p
                className={cn(
                  "text-sm font-semibold tabular-nums",
                  line.emphasis ? "text-slate-900" : "text-slate-800",
                  line.id === "discount" && "text-emerald-700",
                )}
              >
                {line.amount}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {showMaterialRates ? (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3">
          <p className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            <Package className="h-3 w-3" />
            Material rates (if we pack)
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Charged only for supplies used on move day — not estimated upfront.
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {PACKING_MATERIAL_RATES.map((m) => (
              <li key={m.label} className="flex justify-between gap-2 text-slate-700">
                <span>{m.label}</span>
                <span className="font-medium tabular-nums">${m.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {footerNote !== undefined ? (
        footerNote ? (
          <p
            className="mt-3 text-[11px] leading-relaxed"
            style={{ color: `color-mix(in srgb, ${accentColor} 70%, #64748b)` }}
          >
            {footerNote}
          </p>
        ) : null
      ) : (
        <p
          className="mt-3 text-[11px] leading-relaxed"
          style={{ color: `color-mix(in srgb, ${accentColor} 70%, #64748b)` }}
        >
          Final invoice = labor hours × rate + travel fee + materials used + any office fees (dump,
          crating, etc.) + valuation premium if upgraded.
        </p>
      )}
    </section>
  );
}
