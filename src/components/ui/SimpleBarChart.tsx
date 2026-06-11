"use client";

import { cn } from "@/lib/utils";

export type SimpleBarChartItem = {
  label: string;
  value: number;
  barClassName?: string;
};

type SimpleBarChartProps = {
  items: SimpleBarChartItem[];
  emptyMessage?: string;
  className?: string;
};

export function SimpleBarChart({
  items,
  emptyMessage = "No data in this period.",
  className,
}: SimpleBarChartProps) {
  const visible = items.filter((item) => item.value > 0);
  const max = Math.max(...visible.map((item) => item.value), 1);

  if (visible.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {visible.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between gap-2 text-xs">
            <span className="truncate text-slate-700">{item.label}</span>
            <span className="shrink-0 tabular-nums font-semibold text-slate-900">{item.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className={cn("h-full rounded-full bg-brand-600", item.barClassName)}
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

type GroupedBarChartProps = {
  groups: { label: string; segments: SimpleBarChartItem[] }[];
  className?: string;
};

const SEGMENT_COLORS = [
  "bg-amber-500",
  "bg-red-500",
  "bg-brand-600",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-slate-500",
];

export function GroupedMonthlyBarChart({ groups, className }: GroupedBarChartProps) {
  const max = Math.max(
    ...groups.map((g) => g.segments.reduce((sum, s) => sum + s.value, 0)),
    1,
  );

  const legend = groups[0]?.segments ?? [];

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap gap-3">
        {legend.map((segment, index) => (
          <span key={segment.label} className="inline-flex items-center gap-1.5 text-xs text-slate-600">
            <span className={cn("h-2 w-2 rounded-full", SEGMENT_COLORS[index % SEGMENT_COLORS.length])} />
            {segment.label}
          </span>
        ))}
      </div>
      <div className="flex items-end gap-2 sm:gap-3">
        {groups.map((group) => {
          const total = group.segments.reduce((sum, s) => sum + s.value, 0);
          return (
            <div key={group.label} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <div className="flex h-28 w-full items-end justify-center rounded-lg bg-slate-50 px-1 pb-1 pt-2">
                <div className="flex h-full w-full max-w-[2.5rem] flex-col justify-end overflow-hidden rounded-md">
                  {group.segments.map((segment, index) => {
                    if (segment.value === 0) return null;
                    const height = `${(segment.value / max) * 100}%`;
                    return (
                      <div
                        key={segment.label}
                        title={`${segment.label}: ${segment.value}`}
                        className={cn("w-full", SEGMENT_COLORS[index % SEGMENT_COLORS.length])}
                        style={{ height }}
                      />
                    );
                  })}
                  {total === 0 ? (
                    <div className="h-1 w-full rounded bg-slate-200" title="No issues" />
                  ) : null}
                </div>
              </div>
              <span className="text-[10px] font-medium text-slate-500">{group.label}</span>
              <span className="text-[10px] tabular-nums text-slate-400">{total}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
