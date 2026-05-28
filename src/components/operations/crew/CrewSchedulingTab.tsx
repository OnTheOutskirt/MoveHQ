"use client";

import { CrewScheduleTab } from "@/components/operations/crew/CrewScheduleTab";
import { CrewTimeOffTab } from "@/components/operations/crew/CrewTimeOffTab";
import { TabBar } from "@/components/shared/TabBar";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";

const VIEWS = [
  { id: "work-schedule" as const, label: "Work schedule" },
  { id: "time-off" as const, label: "Time off" },
];

export function CrewSchedulingTab() {
  const [view, setView] = usePersistedState<(typeof VIEWS)[number]["id"]>(
    "jm-tab-/operations/crew/scheduling",
    "work-schedule",
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Work patterns and time-off requests. Approval checks mover staffing before confirming PTO.
      </p>
      <TabBar tabs={VIEWS} activeTab={view} onChange={setView} />
      {view === "work-schedule" ? <CrewScheduleTab /> : null}
      {view === "time-off" ? <CrewTimeOffTab /> : null}
    </div>
  );
}
