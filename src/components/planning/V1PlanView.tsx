"use client";

import { useState } from "react";
import { PlanningGantt } from "@/components/planning/PlanningGantt";
import { V1MonthFocusCards } from "@/components/planning/V1MonthFocusCards";
import { V1PlanChecklist } from "@/components/planning/V1PlanChecklist";
import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { TimelineTable } from "@/components/planning/TimelineTable";
import { Card, CardContent } from "@/components/ui/Card";
import { PRODUCT_TAGLINE, V1_DEADLINE, V1_LAUNCH_LABEL } from "@/lib/planning/roadmap-data";
import { cn } from "@/lib/utils";
import { Calendar, ListChecks, Table2 } from "lucide-react";

type V1View = "gantt" | "table" | "checklist";

export function V1PlanView() {
  const [view, setView] = useState<V1View>("gantt");
  const { v1Stats } = usePlanningProgress();

  const views: { id: V1View; label: string; hint: string; icon: typeof Calendar }[] = [
    { id: "gantt", label: "Gantt chart", hint: "Visual timeline", icon: Calendar },
    { id: "table", label: "Timeline table", hint: "Phase by phase", icon: Table2 },
    { id: "checklist", label: "Full checklist", hint: "Check off as built", icon: ListChecks },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
        <CardContent className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
                Version 1 - what we ship
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Go live: {V1_LAUNCH_LABEL}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {PRODUCT_TAGLINE}. June designs the office app, creates the Supabase database
                structure, and wires every module to seed data (no live business data yet). July
                finishes the desktop product on live data. August adds crew phones, imports history,
                and team testing before launch. Smart auto-reply on phone, text, and email waits
                until Version 2.
              </p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white px-5 py-4 text-center shadow-sm">
              <p className="text-3xl font-bold tabular-nums text-brand-700">{v1Stats.pct}%</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {v1Stats.done} of {v1Stats.total} items checked
              </p>
              <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-600 transition-all"
                  style={{ width: `${v1Stats.pct}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <V1MonthFocusCards />

      <div className="flex flex-wrap items-center gap-2">
        {views.map(({ id, label, hint, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
              view === id
                ? "border-brand-600 bg-brand-50 text-brand-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
            title={hint}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {view === "gantt" && <PlanningGantt />}
      {view === "table" && <TimelineTable />}
      {view === "checklist" && <V1PlanChecklist />}

      <p className="text-center text-xs text-slate-400">
        Checkmarks save in this browser · target date {V1_DEADLINE}
      </p>
    </div>
  );
}
