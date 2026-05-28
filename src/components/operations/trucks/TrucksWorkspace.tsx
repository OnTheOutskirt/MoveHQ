"use client";

import { TrucksListTab } from "@/components/operations/trucks/TrucksListTab";
import { TrucksMaintenanceTab } from "@/components/operations/trucks/TrucksMaintenanceTab";
import { TrucksOutOfServiceTab } from "@/components/operations/trucks/TrucksOutOfServiceTab";
import { TabBar } from "@/components/shared/TabBar";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePersistedState } from "@/lib/hooks/use-persisted-state";
import { pageMeta } from "@/lib/navigation/page-meta";

const meta = pageMeta["/operations/trucks"];

const TABS = [
  { id: "list" as const, label: "List" },
  { id: "out-of-service" as const, label: "Out of service" },
  { id: "maintenance" as const, label: "Maintenance" },
];

export function TrucksWorkspace() {
  const [tab, setTab] = usePersistedState<(typeof TABS)[number]["id"]>(
    "jm-tab-/operations/trucks",
    "list",
  );

  return (
    <div className="space-y-6">
      <PageHeader title={meta.title} description={meta.description} />
      <TabBar tabs={TABS} activeTab={tab} onChange={setTab} />
      {tab === "list" ? <TrucksListTab /> : null}
      {tab === "out-of-service" ? <TrucksOutOfServiceTab /> : null}
      {tab === "maintenance" ? <TrucksMaintenanceTab /> : null}
    </div>
  );
}
