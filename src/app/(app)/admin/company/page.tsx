"use client";

import { AdminSaveBar } from "@/components/admin/AdminSaveBar";
import { SettingsDraftProvider, useSettingsDraft } from "@/components/providers/SettingsDraftProvider";
import { useSettings } from "@/components/providers/SettingsProvider";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { BrandingTab } from "@/components/settings/settings-tabs/BrandingTab";
import { CompanyTab } from "@/components/settings/settings-tabs/CompanyTab";
import { DefaultsTab } from "@/components/settings/settings-tabs/DefaultsTab";
import { NotificationsTab } from "@/components/settings/settings-tabs/NotificationsTab";
import { Button } from "@/components/ui/Button";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { id: "branding", label: "Branding" },
  { id: "profile", label: "Business info" },
  { id: "defaults", label: "Defaults" },
  { id: "notifications", label: "Notifications" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function TabPanel({ tab }: { tab: TabId }) {
  switch (tab) {
    case "branding":
      return <BrandingTab />;
    case "profile":
      return <CompanyTab />;
    case "defaults":
      return <DefaultsTab />;
    case "notifications":
      return <NotificationsTab />;
    default:
      return <BrandingTab />;
  }
}

function CompanyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetSettings, isReady } = useSettings();
  const { dirty, save, discard } = useSettingsDraft();
  const rawTab = searchParams.get("tab");
  const activeTab: TabId = TABS.some((t) => t.id === rawTab) ? (rawTab as TabId) : "branding";
  const meta = pageMeta["/admin/company"];

  function setTab(tab: TabId) {
    router.push(`/admin/company?tab=${tab}`, { scroll: false });
  }

  if (!isReady) {
    return <p className="text-sm text-slate-500">Loading company settings…</p>;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <ModulePage title={meta.title} description={meta.description} />
        <Button type="button" variant="secondary" size="sm" onClick={resetSettings}>
          Reset all settings
        </Button>
      </div>

      <TabBar tabs={TABS} activeTab={activeTab} onChange={setTab} />

      <TabPanel tab={activeTab} />

      <AdminSaveBar dirty={dirty} onSave={save} onDiscard={discard} />
    </div>
  );
}

export default function CompanyPage() {
  return (
    <SettingsDraftProvider>
      <CompanyPageInner />
    </SettingsDraftProvider>
  );
}
