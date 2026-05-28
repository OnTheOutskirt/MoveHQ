"use client";

import { CrewListTab } from "@/components/operations/crew/CrewListTab";
import { CrewPerformanceTab } from "@/components/operations/crew/CrewPerformanceTab";
import { CrewScheduleTab } from "@/components/operations/crew/CrewScheduleTab";
import { CrewTimeOffTab } from "@/components/operations/crew/CrewTimeOffTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/operations/crew"];

const TABS = [
  { id: "list" as const, label: "List" },
  { id: "schedule" as const, label: "Work schedule" },
  { id: "time-off" as const, label: "Time off" },
  { id: "performance" as const, label: "Performance" },
];

export function CrewWorkspace() {
  const [tab, setTab] = usePersistedState<(typeof TABS)[number]["id"]>(
    "jm-tab-/operations/crew",
    "list",
  );

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />
      {tab === "list" ? <CrewListTab /> : null}
      {tab === "schedule" ? <CrewScheduleTab /> : null}
      {tab === "time-off" ? <CrewTimeOffTab /> : null}
      {tab === "performance" ? <CrewPerformanceTab /> : null}
    </div>
  );
}
