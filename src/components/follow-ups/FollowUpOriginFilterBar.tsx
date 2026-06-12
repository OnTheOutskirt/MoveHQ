"use client";

import {
  FOLLOW_UP_ORIGIN_LABELS,
  type FollowUpOriginKind,
} from "@/lib/moves/follow-up-display";
import { cn } from "@/lib/utils";

const ORIGIN_FILTER_IDS: FollowUpOriginKind[] = ["manual", "automated"];

type FollowUpOriginFilterBarProps = {
  value: FollowUpOriginKind;
  onChange: (value: FollowUpOriginKind) => void;
  counts: Record<FollowUpOriginKind, number>;
  className?: string;
};

export function FollowUpOriginFilterBar({
  value,
  onChange,
  counts,
  className,
}: FollowUpOriginFilterBarProps) {
  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {ORIGIN_FILTER_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
            value === id
              ? "bg-brand-100 text-brand-800 ring-1 ring-brand-200"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          {FOLLOW_UP_ORIGIN_LABELS[id]} ({counts[id]})
        </button>
      ))}
    </div>
  );
}
