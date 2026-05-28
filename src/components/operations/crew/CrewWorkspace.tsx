"use client";

import { CrewListTab } from "@/components/operations/crew/CrewListTab";
import { CrewReportsTab } from "@/components/operations/crew/CrewReportsTab";
import { CrewSchedulingTab } from "@/components/operations/crew/CrewSchedulingTab";
import { CrewTrackRecordTab } from "@/components/operations/crew/CrewTrackRecordTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useEffect, useState } from "react";

const meta = pageMeta["/operations/crew"];

const TABS = [
  { id: "roster" as const, label: "Roster" },
  { id: "scheduling" as const, label: "Scheduling" },
  { id: "track-record" as const, label: "Track record" },
  { id: "reports" as const, label: "Reports" },
];

type CrewTabId = (typeof TABS)[number]["id"];

const LEGACY_TAB_MAP: Record<string, CrewTabId> = {
  list: "roster",
  schedule: "scheduling",
  "time-off": "scheduling",
  performance: "track-record",
};

function normalizeCrewTab(stored: string): CrewTabId {
  if (TABS.some((t) => t.id === stored)) return stored as CrewTabId;
  return LEGACY_TAB_MAP[stored] ?? "roster";
}

export function CrewWorkspace() {
  const [storedTab, setStoredTab] = usePersistedState<string>("jm-tab-/operations/crew", "roster");
  const [tab, setTab] = useState<CrewTabId>(() => normalizeCrewTab(storedTab));

  useEffect(() => {
    setTab(normalizeCrewTab(storedTab));
  }, [storedTab]);

  function changeTab(next: CrewTabId) {
    setTab(next);
    setStoredTab(next);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <TabBar tabs={TABS} activeTab={tab} onChange={changeTab} />
      {tab === "roster" ? <CrewListTab /> : null}
      {tab === "scheduling" ? <CrewSchedulingTab /> : null}
      {tab === "track-record" ? <CrewTrackRecordTab /> : null}
      {tab === "reports" ? <CrewReportsTab /> : null}
    </div>
  );
}
