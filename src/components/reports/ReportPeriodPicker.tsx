"use client";

import { REPORT_PERIODS, type ReportPeriodId } from "@/lib/reports/mock-reports";
import { cn } from "@/lib/utils";

type ReportPeriodPickerProps = {
  value: ReportPeriodId;
  onChange: (period: ReportPeriodId) => void;
};

export function ReportPeriodPicker({ value, onChange }: ReportPeriodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {REPORT_PERIODS.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            value === p.id
              ? "border-brand-600 bg-brand-50 text-brand-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300",
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
