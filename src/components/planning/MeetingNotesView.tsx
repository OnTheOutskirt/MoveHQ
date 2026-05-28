"use client";

import { ChecklistGroup } from "@/components/planning/ChecklistGroup";
import { usePlanningProgress } from "@/components/planning/PlanningProgressProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { MEETING_NOTES_GROUPS } from "@/lib/planning/meeting-notes";
import { ClipboardList } from "lucide-react";

export function MeetingNotesView() {
  const { meetingNotesStats } = usePlanningProgress();

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-slate-50/60">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
          <div className="flex items-start gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">Notes from meeting</p>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">
                Action items captured from stakeholder meetings. Check items off as they are scoped,
                built, or decided — progress saves in this browser.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
            <p className="text-2xl font-bold tabular-nums text-brand-700">
              {meetingNotesStats.pct}%
            </p>
            <p className="text-xs font-medium text-slate-500">
              {meetingNotesStats.done} of {meetingNotesStats.total} done
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {MEETING_NOTES_GROUPS.map((group) => (
          <ChecklistGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
}
