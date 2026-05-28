"use client";

import { ChecklistGroup } from "@/components/planning/ChecklistGroup";
import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { V1_LAUNCH_LABEL, V2_GROUPS } from "@/lib/planning/roadmap-data";

export function V2PlanView() {
  const { v2Stats } = usePlanningProgress();

  return (
    <div className="space-y-6">
      <Card className="border-violet-200 bg-violet-50/40">
        <CardContent className="py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-800">
                Version 2 - after go-live
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                Smarter automation and a fuller crew experience
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                Version 1 gets Jonah&apos;s Movers running on MoveHQ. Version 2 adds{" "}
                <strong>AI on the phone after hours</strong>, help replying to{" "}
                <strong>texts and emails</strong>, a <strong>marketing dashboard</strong>, a deeper{" "}
                <strong>crew app</strong>, better <strong>proposals</strong>, and tools for{" "}
                <strong>sales walkthroughs</strong>. Nothing here blocks the {V1_LAUNCH_LABEL}{" "}
                launch.
              </p>
            </div>
            <div className="rounded-xl border border-violet-100 bg-white px-5 py-4 text-center">
              <p className="text-3xl font-bold tabular-nums text-violet-700">{v2Stats.pct}%</p>
              <p className="mt-1 text-xs text-slate-500">
                {v2Stats.done}/{v2Stats.total} tracked (for planning only)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {V2_GROUPS.map((group) => (
          <ChecklistGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
