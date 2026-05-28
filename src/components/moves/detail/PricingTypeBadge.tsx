"use client";

import { cn } from "@/lib/utils";

type PricingTypeBadgeProps = {
  quoteType: "hourly" | "flat" | null;
  className?: string;
};

export function PricingTypeBadge({ quoteType, className }: PricingTypeBadgeProps) {
  const isHourly = quoteType === "hourly";
  const isFlat = quoteType === "flat";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold uppercase tracking-wide",
        isHourly && "bg-amber-100 text-amber-900 ring-1 ring-amber-200",
        isFlat && "bg-brand-100 text-brand-800 ring-1 ring-brand-200",
        !isHourly && !isFlat && "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
        className,
      )}
    >
      {isHourly ? "Hourly" : isFlat ? "Flat rate" : "Pricing TBD"}
    </span>
  );
}
