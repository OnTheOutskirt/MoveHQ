"use client";

import { DashboardPreviewBanner } from "@/components/dashboard/DashboardPreviewBanner";
import { DashboardViewPanel } from "@/components/dashboard/DashboardViewPanel";
import { ModulePage } from "@/components/shared/ModulePage";
import { TabBar } from "@/components/shared/TabBar";
import { dashboardViews, dashboardTabs } from "@/lib/dashboard/views";
import type { DashboardView } from "@/lib/dashboard/types";
import { pageMeta } from "@/lib/navigation/page-meta";
import { useRouter, useSearchParams } from "next/navigation";

const TAB_IDS = dashboardTabs.map((t) => t.id);

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawView = searchParams.get("view");
  const activeView: DashboardView = TAB_IDS.includes(rawView as DashboardView)
    ? (rawView as DashboardView)
    : "ceo";
  const meta = pageMeta["/dashboard"];
  const viewMeta = dashboardViews[activeView];

  function setView(view: DashboardView) {
    router.push(`/dashboard?view=${view}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <ModulePage title={meta.title} description={meta.description} />

      <DashboardPreviewBanner />

      <TabBar tabs={dashboardTabs} activeTab={activeView} onChange={setView} />

      <DashboardViewPanel view={viewMeta} />
    </div>
  );
}
