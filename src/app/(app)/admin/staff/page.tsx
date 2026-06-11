"use client";

import { useTeamMembers } from "@/components/providers/TeamMembersProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { DirectoryTab } from "@/components/team/tabs/DirectoryTab";
import { PayRatesTab } from "@/components/team/tabs/PayRatesTab";
import { RoleDefaultsTab } from "@/components/team/tabs/RoleDefaultsTab";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { id: "people", label: "People" },
  { id: "roles", label: "Role defaults" },
  { id: "pay", label: "Pay" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "people":
      return <DirectoryTab />;
    case "roles":
      return <RoleDefaultsTab />;
    case "pay":
      return <PayRatesTab />;
    default:
      return <DirectoryTab />;
  }
}

export default function StaffPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetMembers, isReady } = useTeamMembers();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "people";
  const meta = pageMeta["/admin/staff"];

  function setTab(tab: TabId) {
    router.push(`/admin/staff?tab=${tab}`, { scroll: false });
  }

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading staff…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ModulePage title={meta.title} description={meta.description} />
        <Button type="button" variant="secondary" size="sm" onClick={resetMembers}>
          Reset sample data
        </Button>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      <TabPanel tab={activeTab} />
    </div>
  );
}