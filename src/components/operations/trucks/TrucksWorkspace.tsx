"use client";

import { TrucksListTab } from "@/components/operations/trucks/TrucksListTab";
import { TrucksMaintenanceTab } from "@/components/operations/trucks/TrucksMaintenanceTab";
import { TrucksOutOfServiceTab } from "@/components/operations/trucks/TrucksOutOfServiceTab";
import { TrucksRentalsTab } from "@/components/operations/trucks/TrucksRentalsTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useEffect, useState } from "react";

const meta = pageMeta["/operations/fleet"];

const TABS = [
  { id: "roster" as const, label: "Roster" },
  { id: "rentals" as const, label: "Rentals" },
  { id: "out-of-service" as const, label: "Out of service" },
  { id: "maintenance" as const, label: "Maintenance" },
] as const;

type FleetTabId = (typeof TABS)[number]["id"];

function normalizeFleetTab(stored: string): FleetTabId {
  if (TABS.some((t) => t.id === stored)) return stored as FleetTabId;
  if (stored === "list") return "roster";
  return "roster";
}

export function TrucksWorkspace() {
  const [storedTab, setStoredTab] = usePersistedState<string>("jm-tab-/operations/fleet", "roster");
  const [tab, setTab] = useState<FleetTabId>(() => normalizeFleetTab(storedTab));

  useEffect(() => {
    setTab(normalizeFleetTab(storedTab));
  }, [storedTab]);

  function changeTab(next: FleetTabId) {
    setTab(next);
    setStoredTab(next);
  }

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <TabBar tabs={TABS} activeTab={tab} onChange={changeTab} />
      {tab === "roster" ? <TrucksListTab /> : null}
      {tab === "rentals" ? <TrucksRentalsTab /> : null}
      {tab === "out-of-service" ? <TrucksOutOfServiceTab /> : null}
      {tab === "maintenance" ? <TrucksMaintenanceTab /> : null}
    </div>
  );
}
