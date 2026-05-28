"use client";

import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  V1_AUGUST_ITEM_IDS,
  V1_JUNE_ITEM_IDS,
  V1_JULY_ITEM_IDS,
  V1_MONTH_FOCUS,
} from "@/lib/planning/roadmap-data";
import { countProgress } from "@/lib/planning/planning-progress";
import { cn } from "@/lib/utils";
import { Layout, Monitor, Smartphone } from "lucide-react";

type MonthFocus = (typeof V1_MONTH_FOCUS)[keyof typeof V1_MONTH_FOCUS];

function MonthCard({
  icon: Icon,
  focus,
  itemIds,
  accent,
}: {
  icon: typeof Monitor;
  focus: MonthFocus;
  itemIds: string[];
  accent: "brand" | "emerald" | "slate";
}) {
  const { progress } = usePlanningProgress();
  const { done, total } = countProgress(itemIds, progress);
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <Card
      className={cn(
        accent === "brand" && "border-brand-200 bg-brand-50/40",
        accent === "emerald" && "border-emerald-200 bg-emerald-50/40",
        accent === "slate" && "border-slate-200 bg-slate-50/60",
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Icon
              className={cn(
                "h-5 w-5",
                accent === "brand" && "text-brand-700",
                accent === "emerald" && "text-emerald-700",
                accent === "slate" && "text-slate-600",
              )}
            />
            <div>
              <CardTitle className="text-base">{focus.title}</CardTitle>
              <p className="text-xs font-medium text-slate-500">{focus.deadline}</p>
            </div>
          </div>
          <div className="text-right">
            <p
              className={cn(
                "text-xl font-bold tabular-nums",
                accent === "brand" && "text-brand-700",
                accent === "emerald" && "text-emerald-700",
                accent === "slate" && "text-slate-600",
              )}
            >
              {pct}%
            </p>
            <p className="text-[10px] text-slate-500">
              {done}/{total}
            </p>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-600">{focus.summary}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1.5 text-sm text-slate-700">
          {focus.bullets.map((b) => (
            <li key={b} className="flex gap-2">
              <span
                className={cn(
                  "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                  accent === "brand" && "bg-brand-500",
                  accent === "emerald" && "bg-emerald-500",
                  accent === "slate" && "bg-slate-400",
                )}
              />
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/80">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              accent === "brand" && "bg-brand-600",
              accent === "emerald" && "bg-emerald-600",
              accent === "slate" && "bg-slate-600",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function V1MonthFocusCards() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <MonthCard
        icon={Layout}
        focus={V1_MONTH_FOCUS.june}
        itemIds={V1_JUNE_ITEM_IDS}
        accent="slate"
      />
      <MonthCard
        icon={Monitor}
        focus={V1_MONTH_FOCUS.july}
        itemIds={V1_JULY_ITEM_IDS}
        accent="brand"
      />
      <MonthCard
        icon={Smartphone}
        focus={V1_MONTH_FOCUS.august}
        itemIds={V1_AUGUST_ITEM_IDS}
        accent="emerald"
      />
    </div>
  );
}
